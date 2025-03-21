import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"

// FSD 트리 아이템 클래스
export class FSDItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly resourceUri: vscode.Uri,
    public readonly parent?: FSDItem // 부모 항목 추가
  ) {
    super(label, collapsibleState)
    this.tooltip = resourceUri.fsPath
    this.resourceUri = resourceUri // 리소스 URI 설정 (VS Code가 자동으로 현재 파일 강조에 사용)

    // 컨텍스트 값 설정 (폴더 또는 파일)
    this.contextValue =
      collapsibleState === vscode.TreeItemCollapsibleState.None
        ? "file"
        : "folder"

    // 아이콘 설정
    if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
      // 파일인 경우
      this.iconPath = new vscode.ThemeIcon("file")
      this.command = {
        command: "vscode.open",
        title: "Open File",
        arguments: [resourceUri],
      }
    } else {
      // 폴더인 경우
      this.iconPath = new vscode.ThemeIcon("folder")
    }
  }
}

// FSD 트리 데이터 제공자
export class FSDExplorer implements vscode.TreeDataProvider<FSDItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    FSDItem | undefined | null | void
  > = new vscode.EventEmitter<FSDItem | undefined | null | void>()
  readonly onDidChangeTreeData: vscode.Event<
    FSDItem | undefined | null | void
  > = this._onDidChangeTreeData.event

  private activeEditorDisposable: vscode.Disposable | undefined
  private currentlyOpenTabFilePath: string | undefined
  private treeView: vscode.TreeView<FSDItem> | undefined

  // 파일 경로를 키로, FSDItem을 값으로 하는 맵
  private itemsMap = new Map<string, FSDItem>()

  constructor(private workspaceRoot: string | undefined) {
    // 현재 활성화된 편집기 변경 이벤트 구독
    this.activeEditorDisposable = vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor) {
          this.currentlyOpenTabFilePath = editor.document.uri.fsPath
          this.refresh()

          // 현재 열린 파일에 해당하는 트리 항목 찾아서 표시
          this.revealActiveFile(editor.document.uri)
        }
      }
    )

    // 초기 활성화된 편집기 설정
    if (vscode.window.activeTextEditor) {
      this.currentlyOpenTabFilePath =
        vscode.window.activeTextEditor.document.uri.fsPath
    }
  }

  // TreeView 설정
  setTreeView(treeView: vscode.TreeView<FSDItem>) {
    this.treeView = treeView

    // 초기 활성화된 편집기가 있으면 해당 파일 표시
    if (vscode.window.activeTextEditor) {
      this.revealActiveFile(vscode.window.activeTextEditor.document.uri)
    }
  }

  // 현재 활성화된 파일을 트리뷰에서 표시
  private async revealActiveFile(uri: vscode.Uri) {
    if (!this.treeView || !this.workspaceRoot) {
      return
    }

    try {
      // 파일 경로가 워크스페이스 내에 있는지 확인
      const relativePath = path.relative(this.workspaceRoot, uri.fsPath)
      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return // 워크스페이스 외부 파일은 무시
      }

      // src 폴더 확인
      const srcPath = path.join(this.workspaceRoot, "src")
      const basePath = fs.existsSync(srcPath) ? srcPath : this.workspaceRoot

      // 경로 분석
      const pathParts = relativePath.split(path.sep)
      if (pathParts.length < 2) {
        return // 최소한 레이어와 도메인이 있어야 함
      }

      // src 폴더가 있는 경우 경로에서 제외
      const startIndex = pathParts[0] === "src" ? 1 : 0

      // 레이어 (app, pages, widgets 등)
      const layer = pathParts[startIndex]

      // 레이어 항목 찾기
      const layerItems = await this.getChildren()
      const layerItem = layerItems.find((item) => item.label === layer)

      if (layerItem) {
        // 레이어 항목 펼치기
        await this.treeView.reveal(layerItem, { expand: true })

        // 나머지 경로 순회하며 항목 펼치기
        let currentItem = layerItem
        let currentItems = await this.getChildren(currentItem)

        for (let i = startIndex + 1; i < pathParts.length - 1; i++) {
          const part = pathParts[i]
          const nextItem = currentItems.find((item) => item.label === part)

          if (nextItem) {
            await this.treeView.reveal(nextItem, { expand: true })
            currentItem = nextItem
            currentItems = await this.getChildren(currentItem)
          } else {
            break
          }
        }

        // 최종 파일 항목 찾기
        const fileName = pathParts[pathParts.length - 1]
        const fileItem = currentItems.find((item) => item.label === fileName)

        if (fileItem) {
          // 파일 항목 선택
          await this.treeView.reveal(fileItem, { select: true, focus: true })
        }
      }
    } catch (error) {
      console.error("Error revealing file in tree view:", error)
    }
  }

  // 리소스 해제
  dispose() {
    if (this.activeEditorDisposable) {
      this.activeEditorDisposable.dispose()
    }
    this.itemsMap.clear()
  }

  refresh(): void {
    this.itemsMap.clear()
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: FSDItem): vscode.TreeItem {
    return element
  }

  // getParent 메서드 구현
  getParent(element: FSDItem): vscode.ProviderResult<FSDItem> {
    return element.parent
  }

  getChildren(element?: FSDItem): Thenable<FSDItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No workspace folder is open")
      return Promise.resolve([])
    }

    if (element) {
      // 하위 항목 반환
      return this.getFolderContents(element.resourceUri.fsPath, element)
    } else {
      // 루트 레벨 - FSD 계층 구조 반환
      const fsdLayers = [
        "app",
        "pages",
        "widgets",
        "features",
        "entities",
        "shared",
      ]
      const items: FSDItem[] = []

      // src 폴더 확인
      const srcPath = path.join(this.workspaceRoot, "src")
      const basePath = fs.existsSync(srcPath) ? srcPath : this.workspaceRoot

      for (const layer of fsdLayers) {
        const layerPath = path.join(basePath, layer)
        if (fs.existsSync(layerPath)) {
          const uri = vscode.Uri.file(layerPath)
          const item = new FSDItem(
            layer,
            vscode.TreeItemCollapsibleState.Collapsed,
            uri
          )
          items.push(item)
          this.itemsMap.set(layerPath, item)
        }
      }
      return Promise.resolve(items)
    }
  }

  private getFolderContents(
    folderPath: string,
    parent: FSDItem
  ): Thenable<FSDItem[]> {
    if (!fs.existsSync(folderPath)) {
      return Promise.resolve([])
    }

    const children = fs.readdirSync(folderPath)
    const items: FSDItem[] = []

    for (const child of children) {
      const childPath = path.join(folderPath, child)
      const stats = fs.statSync(childPath)
      const uri = vscode.Uri.file(childPath)

      let item: FSDItem
      if (stats.isDirectory()) {
        item = new FSDItem(
          child,
          vscode.TreeItemCollapsibleState.Collapsed,
          uri,
          parent
        )
      } else {
        item = new FSDItem(
          child,
          vscode.TreeItemCollapsibleState.None,
          uri,
          parent
        )
      }

      items.push(item)
      this.itemsMap.set(childPath, item)
    }

    return Promise.resolve(items)
  }
}
