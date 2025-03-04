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

// 파일 생성 함수
async function createFileIfNotExists(
  filePath: string,
  content: string
): Promise<void> {
  try {
    if (!fs.existsSync(filePath)) {
      await fs.promises.writeFile(filePath, content)
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

// 도메인 생성 함수
async function createDomain(): Promise<void> {
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
    vscode.window.showErrorMessage(
      "FSD Creator: src 폴더가 없습니다. 먼저 FSD 구조를 초기화해주세요."
    )
    return
  }

  // 도메인 이름 입력 받기
  const domainName = await vscode.window.showInputBox({
    placeHolder: "도메인 이름을 입력하세요 (예: user, auth, product)",
    prompt: "생성할 도메인의 이름을 입력하세요",
    validateInput: (value) => {
      if (!value) {
        return "도메인 이름은 필수입니다."
      }
      if (!/^[a-z][a-z0-9-]*$/.test(value)) {
        return "도메인 이름은 소문자 알파벳으로 시작하고, 소문자 알파벳, 숫자, 하이픈만 포함해야 합니다."
      }
      return null
    },
  })

  if (!domainName) {
    vscode.window.showInformationMessage(
      "FSD Creator: 도메인 생성이 취소되었습니다."
    )
    return
  }

  // 레이어 선택 (다중 선택 가능)
  const selectedLayers = await vscode.window.showQuickPick(FSD_FOLDERS, {
    placeHolder: "도메인을 생성할 레이어를 선택하세요",
    canPickMany: true,
  })

  if (!selectedLayers || selectedLayers.length === 0) {
    vscode.window.showInformationMessage(
      "FSD Creator: 레이어 선택이 취소되었습니다."
    )
    return
  }

  // 선택된 레이어에 도메인 폴더 및 index.ts 파일 생성
  const createdPaths: string[] = []
  const existingPaths: string[] = []
  const errorPaths: string[] = []

  for (const layer of selectedLayers) {
    const layerPath = path.join(srcPath, layer)

    // 레이어 폴더가 없으면 건너뛰기
    if (!fs.existsSync(layerPath)) {
      errorPaths.push(`${layer}/${domainName}`)
      continue
    }

    const domainPath = path.join(layerPath, domainName)
    const indexFilePath = path.join(domainPath, "index.ts")

    try {
      // 도메인 폴더 생성
      if (!fs.existsSync(domainPath)) {
        await createFolderIfNotExists(domainPath)

        // index.ts 파일 생성
        const indexContent = `// ${layer}/${domainName} 도메인의 진입점\n\nexport {};\n`
        await createFileIfNotExists(indexFilePath, indexContent)

        // pages 레이어인 경우 추가 파일 생성
        if (layer === "pages") {
          // ui 폴더 생성
          const uiPath = path.join(domainPath, "ui")
          await createFolderIfNotExists(uiPath)

          // 컴포넌트 파일 생성 (PascalCase로 변환)
          const componentName = domainName
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("")

          const componentFilePath = path.join(uiPath, `${domainName}.tsx`)

          // 컴포넌트 기본 내용 생성
          const componentContent = `import React from 'react';\n\ninterface ${componentName}Props {\n  // 여기에 props 타입을 정의하세요\n}\n\nexport const ${componentName}: React.FC<${componentName}Props> = (props) => {\n  return (\n    <div>\n      <h1>${componentName} 페이지</h1>\n      {/* 여기에 컴포넌트 내용을 추가하세요 */}\n    </div>\n  );\n};\n`

          await createFileIfNotExists(componentFilePath, componentContent)

          // index.ts 파일 업데이트
          const updatedIndexContent = `// ${layer}/${domainName} 도메인의 진입점\n\nexport { ${componentName} } from './ui/${domainName}';\n`
          await fs.promises.writeFile(indexFilePath, updatedIndexContent)
        }

        createdPaths.push(`${layer}/${domainName}`)
      } else {
        existingPaths.push(`${layer}/${domainName}`)
      }
    } catch (error) {
      errorPaths.push(`${layer}/${domainName}`)
      console.error(`Error creating domain in ${layer}:`, error)
    }
  }

  // 결과 메시지 표시
  if (createdPaths.length > 0) {
    vscode.window.showInformationMessage(
      `FSD Creator: 다음 도메인이 생성되었습니다: ${createdPaths.join(", ")}`
    )
  }

  if (existingPaths.length > 0) {
    vscode.window.showInformationMessage(
      `FSD Creator: 다음 도메인은 이미 존재합니다: ${existingPaths.join(", ")}`
    )
  }

  if (errorPaths.length > 0) {
    vscode.window.showErrorMessage(
      `FSD Creator: 다음 도메인 생성 중 오류가 발생했습니다: ${errorPaths.join(
        ", "
      )}`
    )
  }

  // 탐색기 새로고침
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

  // 도메인 생성 명령어 등록
  const createDomainDisposable = vscode.commands.registerCommand(
    "fsd-creator.createDomain",
    createDomain
  )

  context.subscriptions.push(
    helloWorldDisposable,
    initFsdDisposable,
    createDomainDisposable
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
