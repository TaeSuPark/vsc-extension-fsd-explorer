import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"

// FSD 트리 아이템 클래스
export class FSDItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly resourceUri: vscode.Uri
  ) {
    super(label, collapsibleState)
    this.tooltip = resourceUri.fsPath

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

  constructor(private workspaceRoot: string | undefined) {}

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: FSDItem): vscode.TreeItem {
    return element
  }

  getChildren(element?: FSDItem): Thenable<FSDItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No workspace folder is open")
      return Promise.resolve([])
    }

    if (element) {
      // 하위 항목 반환
      return this.getFolderContents(element.resourceUri.fsPath)
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
          items.push(
            new FSDItem(layer, vscode.TreeItemCollapsibleState.Collapsed, uri)
          )
        }
      }
      return Promise.resolve(items)
    }
  }

  private getFolderContents(folderPath: string): Thenable<FSDItem[]> {
    if (!fs.existsSync(folderPath)) {
      return Promise.resolve([])
    }

    const children = fs.readdirSync(folderPath)
    const items: FSDItem[] = []

    for (const child of children) {
      const childPath = path.join(folderPath, child)
      const stats = fs.statSync(childPath)
      const uri = vscode.Uri.file(childPath)

      if (stats.isDirectory()) {
        items.push(
          new FSDItem(child, vscode.TreeItemCollapsibleState.Collapsed, uri)
        )
      } else {
        items.push(
          new FSDItem(child, vscode.TreeItemCollapsibleState.None, uri)
        )
      }
    }

    return Promise.resolve(items)
  }
}
