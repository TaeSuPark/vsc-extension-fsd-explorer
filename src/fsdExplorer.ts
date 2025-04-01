import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"
import { getMessage } from "./extension" // getMessage 함수 가져오기

// FSD 트리 아이템 클래스
export class FSDItem extends vscode.TreeItem {
  public violatesRules: boolean // public으로 변경하여 외부에서 수정 가능

  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly resourceUri: vscode.Uri,
    public readonly parent?: FSDItem,
    violatesRules: boolean = false // 규칙 위반 여부
  ) {
    super(label, collapsibleState)
    this.violatesRules = violatesRules
    this.tooltip = resourceUri.fsPath
    this.resourceUri = resourceUri // 리소스 URI 설정 (VS Code가 자동으로 현재 파일 강조에 사용)

    // 파일 또는 폴더 여부 설정
    if (this.resourceUri) {
      if (fs.lstatSync(this.resourceUri.fsPath).isDirectory()) {
        // 폴더의 경우 규칙 위반이 있으면 경고 아이콘 표시
        this.iconPath = new vscode.ThemeIcon("folder")
        this.contextValue = violatesRules ? "folderWithViolation" : "folder"
      } else {
        // 파일의 경우 규칙 위반이 있으면 경고 아이콘 표시
        this.iconPath = new vscode.ThemeIcon(violatesRules ? "warning" : "file")
        this.contextValue = violatesRules ? "fsdViolation" : "file"
      }
    }

    // 규칙 위반 시 스타일 변경
    if (violatesRules) {
      if (fs.lstatSync(this.resourceUri.fsPath).isDirectory()) {
        this.description = getMessage("folderContainsViolations")
        this.tooltip = getMessage("folderViolationTooltip")
      } else {
        this.description = getMessage("fileViolation")
        this.tooltip = getMessage("fileViolationTooltip")
      }
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
    this.activeEditorDisposable = vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor) {
          // 현재 열려있는 모든 에디터 확인
          const allEditors = vscode.window.visibleTextEditors
          const hasGitDiffViewer = allEditors.some(
            (e) => e.document.uri.scheme === "git"
          )

          console.log("Editor state:", {
            hasGitDiffViewer,
            activeEditorScheme: editor.document.uri.scheme,
            allEditors: allEditors.map((e) => ({
              scheme: e.document.uri.scheme,
              fileName: e.document.fileName,
            })),
          })

          // Git diff 뷰어가 열려있으면 파일 reveal 건너뛰기
          if (hasGitDiffViewer) {
            console.log("Git diff viewer is open, skipping file reveal")
            return
          }

          this.currentlyOpenTabFilePath = editor.document.uri.fsPath
          this.refresh()
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
          // Git diff 뷰어가 열려있으면 파일 열기 기능 비활성화
          const activeEditor = vscode.window.activeTextEditor
          if (activeEditor && activeEditor.document.uri.scheme === "git") {
            return
          }

          const document = await vscode.workspace.openTextDocument(
            selectedItem.resourceUri
          )
          await vscode.window.showTextDocument(document)
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
      console.log("Revealing active file:", {
        uri: uri.toString(),
        scheme: uri.scheme,
        fileName: uri.fsPath,
      })

      // Git diff 뷰어인지 다시 한번 확인
      const activeEditor = vscode.window.activeTextEditor
      if (activeEditor) {
        const isGitDiffViewer =
          activeEditor.document.fileName.includes("(Working Tree)") ||
          activeEditor.document.fileName.includes("(Index)")

        if (isGitDiffViewer) {
          console.log("Git diff viewer detected in revealActiveFile, skipping")
          return
        }
      }

      // 파일 경로가 워크스페이스 내에 있는지 확인
      const relativePath = path.relative(this.workspaceRoot, uri.fsPath)
      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        console.log("File is outside workspace, skipping")
        return
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

    // app 레이어는 모든 import가 허용됨 (제한 없음)
    if (currentLayer === "app") {
      return false
    }

    // 계층 우선순위 정의 (낮을수록 상위 계층)
    const layerPriority: Record<string, number> = {
      app: 0,
      pages: 1,
      widgets: 2,
      features: 3,
      entities: 4,
      shared: 5,
    }

    // 계층별 별칭 매핑 (별칭 -> 계층 이름)
    const aliasToLayer: Record<string, string> = {
      "@app": "app",
      "@pages": "pages",
      "@page": "pages",
      "@widgets": "widgets",
      "@widget": "widgets",
      "@features": "features",
      "@feature": "features",
      "@entities": "entities",
      "@entity": "entities",
      "@shared": "shared",
      "@": "", // 루트 별칭은 특별 처리
    }

    // 파일 내용 읽기
    try {
      const content = fs.readFileSync(filePath, "utf-8")

      // 주석 제외 처리
      let processedContent = ""
      let inMultilineComment = false
      const lines = content.split("\n")

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // 한 줄 주석은 건너뛰기
        if (line.startsWith("//")) {
          continue
        }

        // 여러 줄 주석 시작
        if (line.includes("/*") && !line.includes("*/")) {
          inMultilineComment = true
          continue
        }

        // 여러 줄 주석 종료
        if (inMultilineComment && line.includes("*/")) {
          inMultilineComment = false
          continue
        }

        // 주석 중이 아닌 경우에만 추가
        if (!inMultilineComment) {
          processedContent += line + "\n"
        }
      }

      // import 문 찾기 (모든 import 처리)
      const importRegex =
        /import\s+(?:(?:\{[^}]*\})|(?:[^{}\s]+))\s+from\s+['"]([^'"]+)['"]/g

      let match
      // 모든 import 문 검사
      while ((match = importRegex.exec(processedContent)) !== null) {
        const importPath = match[1]

        // 딱 FSD 관련 별칭만 처리 - 명시적인 필터링
        const fsdAliases = [
          "@app/",
          "@pages/",
          "@page/",
          "@widgets/",
          "@widget/",
          "@features/",
          "@feature/",
          "@entities/",
          "@entity/",
          "@shared/",
          "@/app/",
          "@/pages/",
          "@/widgets/",
          "@/features/",
          "@/entities/",
          "@/shared/",
        ]

        // 상대 경로 또는 FSD 별칭인 경우만 처리
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

            // shared 레이어 특수 규칙: shared는 오직 shared 내부만 import 가능
            if (currentLayer === "shared") {
              if (importLayer !== "shared") {
                console.log(
                  getMessage("sharedLayerViolation", filePath, importPath)
                )
                return true
              }
              // shared 내에서는 모든 import 허용
              continue
            }

            // 계층이 FSD 구조에 포함되는지 확인
            if (importLayer in layerPriority && currentLayer in layerPriority) {
              // 규칙 위반 검사: 하위 계층이 상위 계층을 import하는 경우
              if (layerPriority[currentLayer] > layerPriority[importLayer]) {
                console.log(getMessage("layerViolation", filePath, importPath))
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
                  getMessage("crossSliceViolation", filePath, importPath)
                )
                return true
              }
            }
          }
        } else {
          // FSD 별칭인지 확인
          let isFsdAlias = false
          for (const alias of fsdAliases) {
            if (importPath.startsWith(alias)) {
              isFsdAlias = true
              break
            }
          }

          // FSD 별칭이 아니면 건너뛰기
          if (!isFsdAlias) {
            continue
          }

          // FSD 별칭 처리 - 기존 코드 유지
          // 여러 별칭 패턴 처리
          let aliasPrefix = null
          let importPathWithoutAlias = importPath
          let importLayer = null
          let sliceName = null

          // 1. 알려진 별칭 패턴 확인 (@feature, @widget 등)
          for (const alias in aliasToLayer) {
            if (importPath.startsWith(alias)) {
              aliasPrefix = alias
              importPathWithoutAlias = importPath.substring(alias.length)

              // 별칭이 직접 계층을 가리키는 경우 (@features, @widgets 등)
              if (aliasToLayer[alias]) {
                importLayer = aliasToLayer[alias]
                // 슬라이스 이름 추출 (경로에서 첫 번째 부분)
                const pathParts = importPathWithoutAlias.split("/")
                if (pathParts.length > 1 && pathParts[0]) {
                  sliceName = pathParts[0]
                }
              }
              // 루트 별칭인 경우 (@/)
              else if (alias === "@") {
                // 경로에서 계층과 슬라이스 추출
                const pathParts = importPathWithoutAlias.split("/")
                if (pathParts.length > 0 && pathParts[0]) {
                  importLayer = pathParts[0]
                  if (pathParts.length > 1 && pathParts[1]) {
                    sliceName = pathParts[1]
                  }
                }
              }
              break
            }
          }

          // 별칭을 찾았고 import 계층이 결정된 경우
          if (aliasPrefix && importLayer) {
            // shared 레이어 특수 규칙: shared는 오직 shared 내부만 import 가능
            if (currentLayer === "shared") {
              if (importLayer !== "shared") {
                console.log(
                  getMessage("sharedLayerViolation", filePath, importPath)
                )
                return true
              }
              // shared 내에서는 모든 import 허용
              continue
            }

            // 계층이 FSD 구조에 포함되는지 확인
            if (importLayer in layerPriority && currentLayer in layerPriority) {
              // 규칙 위반 검사: 하위 계층이 상위 계층을 import하는 경우
              if (layerPriority[currentLayer] > layerPriority[importLayer]) {
                console.log(getMessage("layerViolation", filePath, importPath))
                return true
              }

              // 동일 계층 내 다른 슬라이스 import 검사
              if (
                layerPriority[currentLayer] === layerPriority[importLayer] &&
                sliceName &&
                parts.length > 1 &&
                sliceName !== parts[1]
              ) {
                console.log(
                  getMessage("crossSliceViolation", filePath, importPath)
                )
                return true
              }
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
    parent?: FSDItem
  ): Promise<FSDItem[]> {
    if (!fs.existsSync(folderPath)) {
      return []
    }

    // 폴더 내용 읽기
    const files = fs.readdirSync(folderPath)
    const items: FSDItem[] = []
    let containsViolation = false // 폴더 내 규칙 위반 파일 존재 여부

    // 각 파일/폴더 처리
    for (const file of files) {
      const filePath = path.join(folderPath, file)
      const stat = fs.statSync(filePath)
      const uri = vscode.Uri.file(filePath)

      if (stat.isDirectory()) {
        // 하위 폴더 내용 재귀적으로 가져오기
        const childItems = await this.getFolderContents(filePath, undefined)

        // 하위 폴더에 규칙 위반이 있는지 확인
        const hasViolationInChildren = childItems.some(
          (item) => item.violatesRules
        )

        // 폴더 아이템 생성
        const folderItem = new FSDItem(
          file,
          vscode.TreeItemCollapsibleState.Collapsed,
          uri,
          parent,
          hasViolationInChildren // 하위에 규칙 위반이 있으면 부모도 표시
        )

        // 맵에 저장
        this.itemsMap.set(filePath, folderItem)
        items.push(folderItem)

        // 현재 폴더에 규칙 위반 포함 여부 업데이트
        if (hasViolationInChildren) {
          containsViolation = true
        }
      } else {
        // 파일 규칙 위반 확인
        const violatesRules = this.checkFSDRuleViolation(filePath)

        // 파일 아이템 생성
        const fileItem = new FSDItem(
          file,
          vscode.TreeItemCollapsibleState.None,
          uri,
          parent,
          violatesRules
        )

        // 맵에 저장
        this.itemsMap.set(filePath, fileItem)
        items.push(fileItem)

        // 현재 폴더에 규칙 위반 포함 여부 업데이트
        if (violatesRules) {
          containsViolation = true
        }
      }
    }

    // 부모 폴더가 있고 현재 폴더에 규칙 위반이 있으면 부모 표시 업데이트
    if (parent && containsViolation) {
      parent.violatesRules = true
    }

    return items
  }

  // 규칙 위반 항목 찾기 (진행 상태 표시 및 취소 가능하도록 개선)
  public async findViolations(
    violations: FSDItem[],
    searchPath?: string,
    progress?: vscode.Progress<{ increment: number; message: string }>,
    token?: vscode.CancellationToken
  ): Promise<void> {
    // 검색 시작 경로 설정
    const startPath = searchPath || this.workspaceRoot
    if (!startPath || !fs.existsSync(startPath)) {
      return
    }

    // 총 파일 수를 미리 계산하여 진행률 표시에 사용
    let totalFiles = 0
    let processedFiles = 0

    // 먼저 검사할 파일의 총 갯수를 대략적으로 계산
    if (progress) {
      progress.report({ increment: 0, message: getMessage("countingFiles") })
      totalFiles = await this.countFiles(startPath, token)
      progress.report({
        increment: 5,
        message: getMessage("planningToCheck", totalFiles.toString()),
      })
    }

    // 파일 시스템 직접 스캔 (비동기로 변경)
    await this.scanForViolations(
      startPath,
      violations,
      progress,
      token,
      totalFiles,
      processedFiles
    )
  }

  // 파일 개수 계산 (진행 상황 추정을 위해)
  private async countFiles(
    dirPath: string,
    token?: vscode.CancellationToken
  ): Promise<number> {
    if (token?.isCancellationRequested) {
      return 0
    }

    try {
      let count = 0
      const files = fs.readdirSync(dirPath)

      for (const file of files) {
        if (token?.isCancellationRequested) {
          return count
        }

        try {
          const filePath = path.join(dirPath, file)
          const stat = fs.statSync(filePath)

          if (stat.isDirectory()) {
            // node_modules 및 숨김 폴더 무시
            if (file === "node_modules" || file.startsWith(".")) {
              continue
            }
            // 디렉토리인 경우 재귀적으로 계산
            count += await this.countFiles(filePath, token)
          } else {
            // 특정 확장자만 카운트 (성능 향상)
            const ext = path.extname(file).toLowerCase()
            if ([".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
              count++
            }
          }
        } catch (error) {
          // 개별 파일 처리 오류는 무시
        }
      }
      return count
    } catch (error) {
      return 0
    }
  }

  // 파일 시스템 직접 스캔하여 위반 항목 찾기 (비동기 및 진행 상태 표시)
  private async scanForViolations(
    dirPath: string,
    violations: FSDItem[],
    progress?: vscode.Progress<{ increment: number; message: string }>,
    token?: vscode.CancellationToken,
    totalFiles: number = 0,
    processedFiles: number = 0
  ): Promise<number> {
    if (token?.isCancellationRequested) {
      return processedFiles
    }

    try {
      const files = fs.readdirSync(dirPath)

      for (const file of files) {
        if (token?.isCancellationRequested) {
          return processedFiles
        }

        try {
          const filePath = path.join(dirPath, file)
          const stat = fs.statSync(filePath)

          if (stat.isDirectory()) {
            // node_modules 및 숨김 폴더 무시
            if (file === "node_modules" || file.startsWith(".")) {
              continue
            }
            // 디렉토리인 경우 재귀적으로 스캔
            processedFiles = await this.scanForViolations(
              filePath,
              violations,
              progress,
              token,
              totalFiles,
              processedFiles
            )
          } else {
            // 특정 확장자만 검사 (성능 향상)
            const ext = path.extname(file).toLowerCase()
            if ([".ts", ".tsx", ".js", ".jsx"].includes(ext)) {
              // 파일인 경우 규칙 위반 검사
              const violatesRules = this.checkFSDRuleViolation(filePath)

              if (violatesRules) {
                // 맵에 이미 있는 항목 사용 또는 새 항목 생성
                const uri = vscode.Uri.file(filePath)
                const existingItem = this.itemsMap.get(filePath)

                if (existingItem) {
                  violations.push(existingItem)
                } else {
                  // 새 항목 생성
                  const fileName = path.basename(filePath)
                  const newItem = new FSDItem(
                    fileName,
                    vscode.TreeItemCollapsibleState.None,
                    uri,
                    undefined,
                    true
                  )
                  violations.push(newItem)
                }
              }

              // 진행 상태 업데이트
              processedFiles++

              if (progress && totalFiles > 0) {
                const increment = 95 / totalFiles // 95%를 파일 검사에 사용
                progress.report({
                  increment: increment,
                  message: getMessage(
                    "checkingFile",
                    processedFiles.toString(),
                    totalFiles.toString(),
                    violations.length.toString()
                  ),
                })

                // UI 업데이트를 위한 약간의 지연
                await new Promise((resolve) => setTimeout(resolve, 0))
              }
            }
          }
        } catch (error) {
          // 개별 파일 처리 오류는 무시하고 계속 진행
          console.error(
            getMessage("fileProcessingError", path.join(dirPath, file)),
            error
          )
        }
      }
    } catch (error) {
      // 디렉토리 처리 오류는 무시하고 계속 진행
      console.error(getMessage("directoryProcessingError", dirPath), error)
    }

    // 모든 처리가 끝난 후 최종 상태 업데이트
    if (progress) {
      progress.report({
        increment: 0,
        message: getMessage(
          "scanComplete",
          processedFiles.toString(),
          violations.length.toString()
        ),
      })
    }

    return processedFiles
  }
}
