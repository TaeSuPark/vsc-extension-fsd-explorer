// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"

// FSD 폴더 구조
const FSD_FOLDERS = [
  "entities",
  "features",
  "pages",
  "widgets",
  "shared",
  "app",
]

// 폴더 생성 함수
async function createFolderIfNotExists(folderPath: string): Promise<void> {
  try {
    if (!fs.existsSync(folderPath)) {
      await fs.promises.mkdir(folderPath, { recursive: true })
      return Promise.resolve()
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

// FSD 구조 초기화 함수
async function initializeFsdStructure(): Promise<void> {
  // 현재 워크스페이스 가져오기
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("FSD Creator: 열린 워크스페이스가 없습니다.")
    return
  }

  const rootPath = workspaceFolders[0].uri.fsPath
  const srcPath = path.join(rootPath, "src")

  // src 폴더 확인
  if (!fs.existsSync(srcPath)) {
    const createSrc = await vscode.window.showQuickPick(["예", "아니오"], {
      placeHolder: "src 폴더가 없습니다. 생성할까요?",
    })

    if (createSrc !== "예") {
      vscode.window.showInformationMessage(
        "FSD Creator: 초기화가 취소되었습니다."
      )
      return
    }

    await createFolderIfNotExists(srcPath)
  }

  // FSD 폴더 생성
  const createdFolders: string[] = []
  const existingFolders: string[] = []

  for (const folder of FSD_FOLDERS) {
    const folderPath = path.join(srcPath, folder)

    if (!fs.existsSync(folderPath)) {
      await createFolderIfNotExists(folderPath)
      createdFolders.push(folder)
    } else {
      existingFolders.push(folder)
    }
  }

  // 결과 메시지 표시
  if (createdFolders.length > 0) {
    vscode.window.showInformationMessage(
      `FSD Creator: 다음 폴더가 생성되었습니다: ${createdFolders.join(", ")}`
    )
  }

  if (existingFolders.length > 0) {
    vscode.window.showInformationMessage(
      `FSD Creator: 다음 폴더는 이미 존재합니다: ${existingFolders.join(", ")}`
    )
  }

  // 탐색기 새로고침 (선택적)
  vscode.commands.executeCommand("workbench.files.action.refreshFilesExplorer")
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "fsd-creator" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const helloWorldDisposable = vscode.commands.registerCommand(
    "fsd-creator.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from fsd creator!")
    }
  )

  // FSD 초기화 명령어 등록
  const initFsdDisposable = vscode.commands.registerCommand(
    "fsd-creator.initFsd",
    initializeFsdStructure
  )

  context.subscriptions.push(helloWorldDisposable, initFsdDisposable)
}

// This method is called when your extension is deactivated
export function deactivate() {}
