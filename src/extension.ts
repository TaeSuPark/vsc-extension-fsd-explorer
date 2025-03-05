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

  // 설정에서 초기화할 폴더 가져오기
  const config = vscode.workspace.getConfiguration("fsd-creator")
  const initFolders = config.get<Record<string, boolean>>("initFolders") || {
    entities: true,
    features: true,
    pages: true,
    widgets: true,
    shared: true,
    app: true,
  }

  // 선택된 폴더만 필터링
  const foldersToCreate = Object.entries(initFolders)
    .filter(([_, enabled]) => enabled)
    .map(([folder]) => folder)

  // FSD 폴더 생성
  const createdFolders: string[] = []
  const existingFolders: string[] = []

  for (const folder of foldersToCreate) {
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

  // 설정에서 도메인 생성 가능한 레이어 가져오기
  const config = vscode.workspace.getConfiguration("fsd-creator")
  const domainLayers = config.get<Record<string, boolean>>("domainLayers") || {
    entities: true,
    features: true,
    pages: true,
    widgets: true,
  }

  // 선택 가능한 레이어 필터링
  const availableLayers = Object.entries(domainLayers)
    .filter(([_, enabled]) => enabled)
    .map(([layer]) => layer)

  // 레이어 선택 (다중 선택 가능)
  const selectedLayers = await vscode.window.showQuickPick(availableLayers, {
    placeHolder: getMessage("selectLayersPlaceholder"),
    canPickMany: true,
  })

  if (!selectedLayers || selectedLayers.length === 0) {
    vscode.window.showInformationMessage(getMessage("layerSelectionCancelled"))
    return
  }

  // 레이어 구조 설정 가져오기
  const layerStructure = config.get("layerStructure") || {
    entities: { model: true, api: true, ui: false },
    features: { model: true, api: true, ui: true },
    pages: { model: true, api: false, ui: true, createComponent: true },
    widgets: { model: true, api: false, ui: true },
  }

  // 도메인 생성
  const createdDomains: string[] = []
  const existingDomains: string[] = []
  const errorDomains: string[] = []

  for (const layer of selectedLayers) {
    try {
      const domainPath = path.join(srcPath, layer, domainName)
      const indexFilePath = path.join(domainPath, "index.ts")

      // 도메인 폴더가 이미 존재하는지 확인
      if (fs.existsSync(domainPath)) {
        existingDomains.push(`${layer}/${domainName}`)
        continue
      }

      // 도메인 폴더 생성
      await createFolderIfNotExists(domainPath)

      // 레이어별 구조 설정 가져오기
      const layerConfig = (layerStructure as any)[layer] || { model: true }

      // model 폴더 및 interface.ts 생성
      if (layerConfig.model) {
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
      }

      // api 폴더 생성
      if (layerConfig.api) {
        const apiPath = path.join(domainPath, "api")
        await createFolderIfNotExists(apiPath)
      }

      // ui 폴더 생성
      if (layerConfig.ui) {
        const uiPath = path.join(domainPath, "ui")
        await createFolderIfNotExists(uiPath)
      }

      // pages 레이어에서 컴포넌트 생성
      if (layer === "pages" && layerConfig.createComponent) {
        // 컴포넌트 이름 생성 (PascalCase)
        const componentName = domainName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")

        // 컴포넌트 파일 경로
        const componentFilePath = path.join(domainPath, `${componentName}.tsx`)

        // 컴포넌트 기본 내용 생성
        const componentContent = `import React from 'react';\n\nexport const ${componentName} = () => {\n  return (\n    <>\n      <h1>${componentName} ${getMessage(
          "componentPage"
        )}</h1>\n      {/* ${getMessage(
          "addComponentContent"
        )} */}\n    </>\n  );\n};\n`

        await createFileIfNotExists(componentFilePath, componentContent)
      }

      // index.ts 파일 생성
      const indexContent = `// ${getMessage(
        "domainEntryPoint"
      )} ${layer}/${domainName}\n\nexport {};\n`
      await createFileIfNotExists(indexFilePath, indexContent)

      createdDomains.push(`${layer}/${domainName}`)
    } catch (error) {
      errorDomains.push(`${layer}/${domainName}`)
      console.error(`Error creating domain ${layer}/${domainName}:`, error)
    }
  }

  // 결과 메시지 표시
  if (createdDomains.length > 0) {
    vscode.window.showInformationMessage(
      `${getMessage("domainsCreated")}${createdDomains.join(", ")}`
    )
  }

  if (existingDomains.length > 0) {
    vscode.window.showInformationMessage(
      `${getMessage("domainsExist")}${existingDomains.join(", ")}`
    )
  }

  if (errorDomains.length > 0) {
    vscode.window.showErrorMessage(
      `${getMessage("domainsError")}${errorDomains.join(", ")}`
    )
  }

  // 탐색기 새로고침
  vscode.commands.executeCommand(getMessage("refreshExplorer"))
}

// HTML 템플릿 로드 및 변수 대체 함수
async function loadHtmlTemplate(
  context: vscode.ExtensionContext,
  webview: vscode.Webview,
  templatePath: string,
  variables: Record<string, string | boolean | Record<string, any>>
): Promise<string> {
  // 템플릿 파일 경로
  const templateUri = vscode.Uri.joinPath(context.extensionUri, templatePath)

  try {
    // 파일 내용 읽기
    const templateContent = await fs.promises.readFile(
      templateUri.fsPath,
      "utf-8"
    )

    // 변수 대체
    let processedContent = templateContent

    // 모든 변수를 문자열로 변환하여 대체
    for (const [key, value] of Object.entries(variables)) {
      // 객체인 경우 JSON 문자열로 변환
      if (typeof value === "object" && value !== null) {
        const jsonStr = JSON.stringify(value)
        // 객체 속성에 접근하는 표현식 처리 (예: ${initFolders.entities})
        const regex = new RegExp(`\\$\\{${key}\\.([\\w\\.]+)\\}`, "g")
        processedContent = processedContent.replace(regex, (match, prop) => {
          // 중첩 속성 처리 (예: layerStructure.pages.createComponent)
          const props = prop.split(".")
          let result = value as any

          for (const p of props) {
            if (result && typeof result === "object") {
              result = result[p]
            } else {
              result = undefined
              break
            }
          }

          return result ? "checked" : ""
        })

        // 객체 자체를 대체 (예: ${initFolders})
        processedContent = processedContent.replace(`\${${key}}`, jsonStr)
      } else {
        // 일반 변수 대체
        processedContent = processedContent.replace(`\${${key}}`, String(value))
      }
    }

    return processedContent
  } catch (error) {
    console.error("Error loading HTML template:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return `<html><body><h1>Error loading settings</h1><p>${errorMessage}</p></body></html>`
  }
}

// 웹뷰 HTML 콘텐츠 생성 함수 수정
async function getSettingsWebviewContent(
  context: vscode.ExtensionContext,
  webview: vscode.Webview
): Promise<string> {
  // 미디어 파일 경로 설정
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "media", "settings.css")
  )
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, "media", "settings.js")
  )

  // 현재 설정 가져오기
  const config = vscode.workspace.getConfiguration("fsd-creator")

  // 타입 정의
  interface FolderSettings {
    entities: boolean
    features: boolean
    pages: boolean
    widgets: boolean
    shared: boolean
    app: boolean
  }

  interface DomainLayerSettings {
    entities: boolean
    features: boolean
    pages: boolean
    widgets: boolean
  }

  interface LayerStructure {
    model: boolean
    api: boolean
    ui: boolean
    lib: boolean
  }

  interface PageLayerStructure extends LayerStructure {
    createComponent: boolean
  }

  interface LayerStructureSettings {
    entities: LayerStructure
    features: LayerStructure
    pages: PageLayerStructure
    widgets: LayerStructure
  }

  // 기본값 정의
  const defaultInitFolders: FolderSettings = {
    entities: true,
    features: true,
    pages: true,
    widgets: true,
    shared: true,
    app: true,
  }

  const defaultDomainLayers: DomainLayerSettings = {
    entities: true,
    features: true,
    pages: true,
    widgets: true,
  }

  const defaultLayerStructure: LayerStructureSettings = {
    entities: { model: true, api: true, ui: false, lib: false },
    features: { model: true, api: true, ui: true, lib: false },
    pages: {
      model: true,
      api: false,
      ui: true,
      lib: false,
      createComponent: true,
    },
    widgets: { model: true, api: false, ui: true, lib: false },
  }

  // 설정 가져오기 (기본값 사용)
  const initFolders =
    config.get<FolderSettings>("initFolders") || defaultInitFolders
  const domainLayers =
    config.get<DomainLayerSettings>("domainLayers") || defaultDomainLayers
  const layerStructure =
    config.get<LayerStructureSettings>("layerStructure") ||
    defaultLayerStructure
  const language = config.get<string>("language") || "en"

  // 템플릿 변수
  const templateVariables = {
    styleUri: styleUri.toString(),
    scriptUri: scriptUri.toString(),
    language,
    initFolders,
    domainLayers,
    layerStructure,
  }

  // HTML 템플릿 로드 및 변수 대체
  return await loadHtmlTemplate(
    context,
    webview,
    "media/settings.html",
    templateVariables
  )
}

// 설정 웹뷰 패널 생성 함수 수정
async function createSettingsWebview(context: vscode.ExtensionContext) {
  // 웹뷰 패널 생성
  const panel = vscode.window.createWebviewPanel(
    "fsdSettings", // 고유 ID
    "FSD Creator Settings", // 패널 제목
    vscode.ViewColumn.One, // 표시할 열
    {
      enableScripts: true, // 스크립트 활성화
      retainContextWhenHidden: true, // 숨겨져 있을 때 컨텍스트 유지
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "media")],
    }
  )

  // 웹뷰 HTML 설정 (비동기 함수로 변경)
  panel.webview.html = await getSettingsWebviewContent(context, panel.webview)

  // 웹뷰에서 메시지 수신
  panel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case "saveSettings":
          // 설정 저장 로직
          const config = vscode.workspace.getConfiguration("fsd-creator")

          // 각 설정 항목 저장
          await config.update(
            "language",
            message.settings.language,
            vscode.ConfigurationTarget.Global
          )
          await config.update(
            "initFolders",
            message.settings.initFolders,
            vscode.ConfigurationTarget.Global
          )
          await config.update(
            "domainLayers",
            message.settings.domainLayers,
            vscode.ConfigurationTarget.Global
          )
          await config.update(
            "layerStructure",
            message.settings.layerStructure,
            vscode.ConfigurationTarget.Global
          )

          vscode.window.showInformationMessage("FSD Creator settings saved!")
          break
      }
    },
    undefined,
    context.subscriptions
  )

  return panel
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

  // 설정 명령어 등록
  const openSettingsDisposable = vscode.commands.registerCommand(
    "fsd-creator.openSettings",
    async () => {
      await createSettingsWebview(context)
    }
  )

  context.subscriptions.push(
    helloWorldDisposable,
    initFsdDisposable,
    createDomainDisposable,
    setLanguageDisposable,
    openSettingsDisposable
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
