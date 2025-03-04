// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"

// 다국어 메시지 정의
const messages = {
  en: {
    // 일반 메시지
    extensionActive:
      'Congratulations, your extension "fsd-creator" is now active!',
    noWorkspace: "FSD Creator: No open workspace found.",
    refreshExplorer: "workbench.files.action.refreshFilesExplorer",

    // FSD 초기화 관련
    noSrcFolder: "FSD Creator: src folder not found. Create it?",
    createSrcOptions: ["Yes", "No"],
    initCancelled: "FSD Creator: Initialization cancelled.",
    foldersCreated: "FSD Creator: The following folders have been created: ",
    foldersExist: "FSD Creator: The following folders already exist: ",

    // 도메인 생성 관련
    initFirst:
      "FSD Creator: src folder not found. Please initialize FSD structure first.",
    domainNamePlaceholder: "Enter domain name (e.g., User, Auth, Product)",
    domainNamePrompt: "Enter the name of the domain to create",
    domainNameRequired: "Domain name is required.",
    domainNameInvalid:
      "Domain name must start with a letter and contain only letters, numbers, and hyphens.",
    domainCreationCancelled: "FSD Creator: Domain creation cancelled.",
    selectLayersPlaceholder: "Select layers to create the domain in",
    layerSelectionCancelled: "FSD Creator: Layer selection cancelled.",
    domainsCreated: "FSD Creator: The following domains have been created: ",
    domainsExist: "FSD Creator: The following domains already exist: ",
    domainsError: "FSD Creator: Error creating the following domains: ",

    // 파일 내용 관련
    domainEntryPoint: "Entry point for the domain",
    interfaceDefinition: "Interface definition for the domain",
    addPropsHere: "Add interface properties here",
    componentPage: "page",
    addComponentContent: "Add component content here",
  },
  ko: {
    // 일반 메시지
    extensionActive: "FSD Creator 익스텐션이 활성화되었습니다!",
    noWorkspace: "FSD Creator: 열린 워크스페이스가 없습니다.",
    refreshExplorer: "workbench.files.action.refreshFilesExplorer",

    // FSD 초기화 관련
    noSrcFolder: "FSD Creator: src 폴더가 없습니다. 생성할까요?",
    createSrcOptions: ["예", "아니오"],
    initCancelled: "FSD Creator: 초기화가 취소되었습니다.",
    foldersCreated: "FSD Creator: 다음 폴더가 생성되었습니다: ",
    foldersExist: "FSD Creator: 다음 폴더는 이미 존재합니다: ",

    // 도메인 생성 관련
    initFirst:
      "FSD Creator: src 폴더가 없습니다. 먼저 FSD 구조를 초기화해주세요.",
    domainNamePlaceholder: "도메인 이름을 입력하세요 (예: User, Auth, Product)",
    domainNamePrompt: "생성할 도메인의 이름을 입력하세요",
    domainNameRequired: "도메인 이름은 필수입니다.",
    domainNameInvalid:
      "도메인 이름은 알파벳으로 시작하고, 알파벳, 숫자, 하이픈만 포함해야 합니다.",
    domainCreationCancelled: "FSD Creator: 도메인 생성이 취소되었습니다.",
    selectLayersPlaceholder: "도메인을 생성할 레이어를 선택하세요",
    layerSelectionCancelled: "FSD Creator: 레이어 선택이 취소되었습니다.",
    domainsCreated: "FSD Creator: 다음 도메인이 생성되었습니다: ",
    domainsExist: "FSD Creator: 다음 도메인은 이미 존재합니다: ",
    domainsError: "FSD Creator: 다음 도메인 생성 중 오류가 발생했습니다: ",

    // 파일 내용 관련
    domainEntryPoint: "도메인의 진입점",
    interfaceDefinition: "도메인의 인터페이스 정의",
    addPropsHere: "여기에 인터페이스 속성을 정의하세요",
    componentPage: "페이지",
    addComponentContent: "여기에 컴포넌트 내용을 추가하세요",
  },
}

// 현재 언어 설정 가져오기
function getCurrentLanguage(): "en" | "ko" {
  const config = vscode.workspace.getConfiguration("fsd-creator")
  const language = config.get<string>("language") || "en"
  return language === "ko" ? "ko" : "en"
}

// 메시지 가져오기
function getMessage<T extends keyof typeof messages.en>(
  key: T
): (typeof messages.en)[T] {
  const lang = getCurrentLanguage()
  return messages[lang][key] as (typeof messages.en)[T]
}

// FSD 폴더 구조
const FSD_FOLDERS = [
  "entities",
  "features",
  "pages",
  "widgets",
  "shared",
  "app",
]

// 도메인 생성 가능한 레이어
const DOMAIN_LAYERS = FSD_FOLDERS.filter(
  (layer) => layer !== "shared" && layer !== "app"
)

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
    vscode.window.showErrorMessage(getMessage("noWorkspace"))
    return
  }

  const rootPath = workspaceFolders[0].uri.fsPath
  const srcPath = path.join(rootPath, "src")

  // src 폴더 확인
  if (!fs.existsSync(srcPath)) {
    // 타입 안전성을 위해 메시지 함수 수정
    const createSrcOptions = getMessage("createSrcOptions")
    const options = Array.isArray(createSrcOptions)
      ? createSrcOptions
      : ["Yes", "No"]

    const createSrc = await vscode.window.showQuickPick(options, {
      placeHolder: getMessage("noSrcFolder"),
    })

    if (createSrc !== options[0]) {
      vscode.window.showInformationMessage(getMessage("initCancelled"))
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
      `${getMessage("foldersCreated")}${createdFolders.join(", ")}`
    )
  }

  if (existingFolders.length > 0) {
    vscode.window.showInformationMessage(
      `${getMessage("foldersExist")}${existingFolders.join(", ")}`
    )
  }

  // 탐색기 새로고침
  vscode.commands.executeCommand(getMessage("refreshExplorer"))
}

// 도메인 생성 함수
async function createDomain(): Promise<void> {
  // 현재 워크스페이스 가져오기
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders) {
    vscode.window.showErrorMessage(getMessage("noWorkspace"))
    return
  }

  const rootPath = workspaceFolders[0].uri.fsPath
  const srcPath = path.join(rootPath, "src")

  // src 폴더 확인
  if (!fs.existsSync(srcPath)) {
    vscode.window.showErrorMessage(getMessage("initFirst"))
    return
  }

  // 도메인 이름 입력 받기
  const domainName = await vscode.window.showInputBox({
    placeHolder: getMessage("domainNamePlaceholder"),
    prompt: getMessage("domainNamePrompt"),
    validateInput: (value) => {
      if (!value) {
        return getMessage("domainNameRequired")
      }
      if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(value)) {
        return getMessage("domainNameInvalid")
      }
      return null
    },
  })

  if (!domainName) {
    vscode.window.showInformationMessage(getMessage("domainCreationCancelled"))
    return
  }

  // 레이어 선택 (다중 선택 가능) - shared 제외
  const selectedLayers = await vscode.window.showQuickPick(DOMAIN_LAYERS, {
    placeHolder: getMessage("selectLayersPlaceholder"),
    canPickMany: true,
  })

  if (!selectedLayers || selectedLayers.length === 0) {
    vscode.window.showInformationMessage(getMessage("layerSelectionCancelled"))
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
        const indexContent = `// ${getMessage(
          "domainEntryPoint"
        )} ${layer}/${domainName}

export {};\n`
        await createFileIfNotExists(indexFilePath, indexContent)

        // 공통 폴더 생성 (lib, model)
        await createFolderIfNotExists(path.join(domainPath, "lib"))

        // model 폴더 및 interface.ts 생성
        const modelPath = path.join(domainPath, "model")
        await createFolderIfNotExists(modelPath)

        // 도메인 이름과 레이어 이름을 PascalCase로 변환
        const pascalDomainName = domainName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")

        const pascalLayerName = layer.charAt(0).toUpperCase() + layer.slice(1)

        // 인터페이스 이름 생성 (I{Layer}{Domain} 형식)
        const interfaceName = `I${pascalLayerName}${pascalDomainName}`

        const interfaceContent = `// ${getMessage(
          "interfaceDefinition"
        )} ${layer}/${domainName}\n\nexport interface ${interfaceName} {\n  // ${getMessage(
          "addPropsHere"
        )}\n}\n`

        await createFileIfNotExists(
          path.join(modelPath, "interface.ts"),
          interfaceContent
        )

        // index.ts 파일에 인터페이스 export 추가
        const updatedIndexContent = `// ${getMessage(
          "domainEntryPoint"
        )} ${layer}/${domainName}\n\nexport type { ${interfaceName} } from './model/interface';\nexport {};\n`
        await fs.promises.writeFile(indexFilePath, updatedIndexContent)

        // api 폴더 생성 (entities, features 레이어만)
        if (layer === "entities" || layer === "features") {
          await createFolderIfNotExists(path.join(domainPath, "api"))
        }

        // ui 폴더 생성 (entities 레이어 제외)
        if (layer !== "entities") {
          await createFolderIfNotExists(path.join(domainPath, "ui"))
        }

        // pages 레이어인 경우 추가 파일 생성
        if (layer === "pages") {
          // ui 폴더는 이미 생성됨
          const uiPath = path.join(domainPath, "ui")

          // 컴포넌트 파일 생성 (PascalCase로 변환)
          const componentName = domainName
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("")

          const componentFilePath = path.join(uiPath, `${domainName}.tsx`)

          // 컴포넌트 기본 내용 생성
          const componentContent = `\nexport const ${componentName} = () => {\n  return (\n    <>\n      <h1>${componentName} ${getMessage(
            "componentPage"
          )}</h1>\n      {/* ${getMessage(
            "addComponentContent"
          )} */}\n    </>\n  );\n};\n`

          await createFileIfNotExists(componentFilePath, componentContent)

          // index.ts 파일 업데이트
          const updatedIndexContent = `// ${getMessage(
            "domainEntryPoint"
          )} ${layer}/${domainName}\n\nexport { ${componentName} } from './ui/${domainName}';\nexport type { ${interfaceName} } from './model/interface';\nexport {};\n`
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
      `${getMessage("domainsCreated")}${createdPaths.join(", ")}`
    )
  }

  if (existingPaths.length > 0) {
    vscode.window.showInformationMessage(
      `${getMessage("domainsExist")}${existingPaths.join(", ")}`
    )
  }

  if (errorPaths.length > 0) {
    vscode.window.showErrorMessage(
      `${getMessage("domainsError")}${errorPaths.join(", ")}`
    )
  }

  // 탐색기 새로고침
  vscode.commands.executeCommand(getMessage("refreshExplorer"))
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(getMessage("extensionActive"))

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

  // 언어 설정 명령어 등록
  const setLanguageDisposable = vscode.commands.registerCommand(
    "fsd-creator.setLanguage",
    async () => {
      const language = await vscode.window.showQuickPick(
        ["English", "한국어"],
        {
          placeHolder: "Select language / 언어를 선택하세요",
        }
      )

      if (language) {
        const config = vscode.workspace.getConfiguration("fsd-creator")
        await config.update(
          "language",
          language === "한국어" ? "ko" : "en",
          vscode.ConfigurationTarget.Global
        )

        const message =
          language === "한국어"
            ? "언어가 한국어로 설정되었습니다."
            : "Language set to English."
        vscode.window.showInformationMessage(message)
      }
    }
  )

  context.subscriptions.push(
    helloWorldDisposable,
    initFsdDisposable,
    createDomainDisposable,
    setLanguageDisposable
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
