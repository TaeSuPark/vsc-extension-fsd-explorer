import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"

// FSD 트리 아이템 클래스
export class FSDItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly resourceUri: vscode.Uri,
    public readonly parent?: FSDItem,
    public readonly violatesRules: boolean = false // 규칙 위반 여부 추가
  ) {
    super(label, collapsibleState)
    this.tooltip = resourceUri.fsPath
    this.resourceUri = resourceUri // 리소스 URI 설정 (VS Code가 자동으로 현재 파일 강조에 사용)

    // 파일 또는 폴더 여부 설정
    if (this.resourceUri) {
      if (fs.lstatSync(this.resourceUri.fsPath).isDirectory()) {
        this.iconPath = new vscode.ThemeIcon("folder")
        this.contextValue = "folder"
      } else {
        this.iconPath = new vscode.ThemeIcon(violatesRules ? "warning" : "file")
        this.contextValue = violatesRules ? "fsdViolation" : "file"
      }
    }

    // 규칙 위반 시 스타일 변경
    if (violatesRules) {
      this.description = "FSD 규칙 위반"
      this.tooltip = "이 파일은 FSD 아키텍처 규칙을 위반합니다"
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

    // 트리 아이템 클릭 이벤트 처리
    treeView.onDidChangeSelection(async (e) => {
      if (e.selection.length > 0) {
        const selectedItem = e.selection[0]

        // 파일인 경우에만 열기
        if (
          selectedItem.contextValue === "file" ||
          selectedItem.contextValue === "fsdViolation"
        ) {
          // 미리보기 모드가 아닌 완전히 열기 위해 preview: false 옵션 사용
          const document = await vscode.workspace.openTextDocument(
            selectedItem.resourceUri
          )
          await vscode.window.showTextDocument(document, { preview: false })
        }
      }
    })

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
    this._onDidChangeTreeData.fire(undefined)
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

  // FSD 규칙 검사 함수 개선
  private checkFSDRuleViolation(filePath: string): boolean {
    // 파일 경로에서 계층 정보 추출
    const workspacePath = this.workspaceRoot || ""
    if (!workspacePath) {
      return false // 워크스페이스 경로가 없으면 검사 불가
    }

    const srcPath = fs.existsSync(path.join(workspacePath, "src"))
      ? path.join(workspacePath, "src")
      : workspacePath

    // 상대 경로 계산
    const relativePath = path.relative(srcPath, filePath)
    const parts = relativePath.split(path.sep)

    // 파일이 아니면 검사하지 않음
    if (fs.lstatSync(filePath).isDirectory() || parts.length < 2) {
      return false
    }

    // 현재 파일의 계층 확인
    const currentLayer = parts[0]

    // 계층 우선순위 정의 (낮을수록 상위 계층)
    const layerPriority: Record<string, number> = {
      app: 0,
      pages: 1,
      widgets: 2,
      features: 3,
      entities: 4,
      shared: 5,
    }

    // 파일 내용 읽기
    try {
      const content = fs.readFileSync(filePath, "utf-8")

      // import 문 찾기 (더 정확한 정규식 사용)
      const importRegex =
        /import\s+(?:(?:\{[^}]*\})|(?:[^{}\s]+))\s+from\s+['"]([^'"]+)['"]/g
      const aliasImportRegex =
        /import\s+(?:(?:\{[^}]*\})|(?:[^{}\s]+))\s+from\s+['"]@\/([^'"]+)['"]/g

      let match

      // 상대 경로 import 검사
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1]

        // 상대 경로 import만 검사
        if (importPath.startsWith(".")) {
          // 절대 경로로 변환
          const importAbsolutePath = path.resolve(
            path.dirname(filePath),
            importPath
          )
          const importRelativePath = path.relative(srcPath, importAbsolutePath)
          const importParts = importRelativePath.split(path.sep)

          if (importParts.length > 0) {
            const importLayer = importParts[0]

            // 계층이 FSD 구조에 포함되는지 확인
            if (importLayer in layerPriority && currentLayer in layerPriority) {
              // 규칙 위반 검사: 하위 계층이 상위 계층을 import하는 경우
              if (layerPriority[currentLayer] > layerPriority[importLayer]) {
                console.log(`규칙 위반 발견: ${filePath} -> ${importPath}`)
                return true
              }

              // 동일 계층 내 다른 슬라이스 import 검사
              if (
                layerPriority[currentLayer] === layerPriority[importLayer] &&
                importParts.length > 1 &&
                parts.length > 1 &&
                importParts[1] !== parts[1]
              ) {
                console.log(
                  `동일 계층 내 다른 슬라이스 import 위반: ${filePath} -> ${importPath}`
                )
                return true
              }
            }
          }
        }
      }

      // 별칭(@/) import 검사
      while ((match = aliasImportRegex.exec(content)) !== null) {
        const importPath = match[1]
        const importParts = importPath.split("/")

        if (importParts.length > 0) {
          const importLayer = importParts[0]

          // 계층이 FSD 구조에 포함되는지 확인
          if (importLayer in layerPriority && currentLayer in layerPriority) {
            // 규칙 위반 검사: 하위 계층이 상위 계층을 import하는 경우
            if (layerPriority[currentLayer] > layerPriority[importLayer]) {
              console.log(`별칭 규칙 위반 발견: ${filePath} -> @/${importPath}`)
              return true
            }

            // 동일 계층 내 다른 슬라이스 import 검사
            if (
              layerPriority[currentLayer] === layerPriority[importLayer] &&
              importParts.length > 1 &&
              parts.length > 1 &&
              importParts[1] !== parts[1]
            ) {
              console.log(
                `별칭 동일 계층 내 다른 슬라이스 import 위반: ${filePath} -> @/${importPath}`
              )
              return true
            }
          }
        }
      }
    } catch (error) {
      console.error(`파일 분석 중 오류 발생: ${filePath}`, error)
    }

    return false
  }

  // 폴더 내용 가져오기 함수 수정
  private async getFolderContents(
    folderPath: string,
    parent: FSDItem
  ): Promise<FSDItem[]> {
    if (!fs.existsSync(folderPath)) {
      return []
    }

    const items: FSDItem[] = []
    const files = fs.readdirSync(folderPath)

    for (const file of files) {
      const filePath = path.join(folderPath, file)
      const stat = fs.statSync(filePath)
      const uri = vscode.Uri.file(filePath)

      // 규칙 위반 검사 (파일인 경우만)
      const violatesRules =
        !stat.isDirectory() && this.checkFSDRuleViolation(filePath)

      const collapsibleState = stat.isDirectory()
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None

      const item = new FSDItem(
        file,
        collapsibleState,
        uri,
        parent,
        violatesRules
      )
      items.push(item)
      this.itemsMap.set(filePath, item)
    }

    return items
  }

  // 규칙 위반 항목 찾기
  public findViolations(violations: FSDItem[], searchPath?: string): void {
    for (const [path, item] of this.itemsMap.entries()) {
      // 특정 경로 내에서만 검색하는 경우
      if (searchPath && !path.startsWith(searchPath)) {
        continue
      }

      // 파일이고 규칙을 위반하는 경우
      if (item.contextValue === "fsdViolation") {
        violations.push(item)
      }
    }
  }
}
