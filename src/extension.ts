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

    // 설정 UI 관련
    settingsTitle: "FSD Creator Settings",
    generalSettings: "General Settings",
    language: "Language",
    fsdInitialization: "FSD Initialization",
    foldersToCreate: "Folders to create when initializing",
    domainCreation: "Domain Creation",
    layersAvailable: "Layers available for domain creation",
    layerStructure: "Layer Structure",
    createComponent: "create component",
    saveSettings: "Save Settings",
    resetToDefaults: "Reset to Defaults",
    settingsSaved: "FSD Creator settings saved!",

    // 사이드바 관련
    initializeFsd: "Initialize FSD Architecture structure in your project.",
    initializeFsdButton: "Initialize FSD",
    createDomainDesc: "Create a new domain across selected layers.",
    createDomainButton: "Create Domain",
    openSettingsButton: "Open Settings",
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

    // 설정 UI 관련
    settingsTitle: "FSD Creator 설정",
    generalSettings: "일반 설정",
    language: "언어",
    fsdInitialization: "FSD 초기화",
    foldersToCreate: "초기화 시 생성할 폴더",
    domainCreation: "도메인 생성",
    layersAvailable: "도메인 생성에 사용할 레이어",
    layerStructure: "레이어 구조",
    createComponent: "컴포넌트 생성",
    saveSettings: "설정 저장",
    resetToDefaults: "기본값으로 재설정",
    settingsSaved: "FSD Creator 설정이 저장되었습니다!",

    // 사이드바 관련
    initializeFsd: "프로젝트에 FSD 아키텍처 구조를 초기화합니다.",
    initializeFsdButton: "FSD 초기화",
    createDomainDesc: "선택한 레이어에 새 도메인을 생성합니다.",
    createDomainButton: "도메인 생성",
    openSettingsButton: "설정 열기",
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
  variables: Record<string, any>
): Promise<string> {
  // 템플릿 파일 경로
  const templateUri = vscode.Uri.joinPath(context.extensionUri, templatePath)

  try {
    // 파일 읽기
    const templateContent = await fs.promises.readFile(
      templateUri.fsPath,
      "utf8"
    )

    // 변수 대체
    let processedContent = templateContent

    // 정규식을 사용하여 ${variable} 형태의 모든 변수 찾기
    const variableRegex = /\${([^}]+)}/g

    // 변수 대체
    processedContent = processedContent.replace(
      variableRegex,
      (match, varName) => {
        // 점(.)을 포함하는 변수 처리 (예: uiMessages.settingsTitle)
        if (varName.includes(".")) {
          const parts = varName.split(".")
          let value = variables

          for (const part of parts) {
            if (value === undefined || value === null) {
              console.warn(`Variable part ${part} in ${varName} is undefined`)
              return match // 값이 없으면 원래 문자열 반환
            }
            value = value[part]
          }

          return value !== undefined ? String(value) : match
        }

        // 일반 변수 처리
        const value = variables[varName]
        if (value === undefined) {
          console.warn(`Variable ${varName} is undefined`)
        }
        return value !== undefined ? String(value) : match
      }
    )

    return processedContent
  } catch (error) {
    console.error(`Error loading template ${templatePath}:`, error)
    return `<html><body><h1>Error loading template</h1><p>${error}</p></body></html>`
  }
}

// 설정 웹뷰 HTML 콘텐츠 생성 함수 수정
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

  // 언어 설정 가져오기
  const language = config.get<string>("language") || "en"

  // UI 메시지 가져오기
  const uiMessages = messages[language as keyof typeof messages]

  // 설정 가져오기 (기본값 사용)
  const initFolders = config.get("initFolders") || {
    entities: true,
    features: true,
    pages: true,
    widgets: true,
    shared: true,
    app: true,
  }

  const domainLayers = config.get("domainLayers") || {
    entities: true,
    features: true,
    pages: true,
    widgets: true,
  }

  const layerStructure = config.get("layerStructure") || {
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

  // 디버깅을 위해 콘솔에 현재 설정값 출력
  console.log("Current settings:", {
    language,
    initFolders,
    domainLayers,
    layerStructure,
  })

  // 템플릿 변수
  const templateVariables = {
    styleUri: styleUri.toString(),
    scriptUri: scriptUri.toString(),
    language,
    uiMessages,
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

  // 웹뷰 HTML 콘텐츠 설정
  panel.webview.html = await getSettingsWebviewContent(context, panel.webview)

  // 웹뷰에서 메시지 수신 처리
  panel.webview.onDidReceiveMessage(
    async (message) => {
      switch (message.command) {
        case "saveSettings":
          // 설정 저장
          const config = vscode.workspace.getConfiguration("fsd-creator")
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

          // 현재 언어 설정 가져오기
          const language = config.get<string>("language") || "en"
          // 언어에 맞는 메시지 가져오기
          const uiMessages = messages[language as keyof typeof messages]

          // 설정 저장 메시지 표시
          vscode.window.showInformationMessage(uiMessages.settingsSaved)

          // 웹뷰 패널 닫기
          panel.dispose()
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
  console.log(getMessage("extensionActive"))

  // 기본 명령어 등록
  const helloWorldDisposable = vscode.commands.registerCommand(
    "fsd-creator.helloWorld",
    () => {
      vscode.window.showInformationMessage(getMessage("extensionActive"))
    }
  )

  // FSD 구조 초기화 명령어 등록
  const initFsdDisposable = vscode.commands.registerCommand(
    "fsd-creator.initializeFsd",
    initializeFsdStructure
  )

  // 도메인 생성 명령어 등록
  const createDomainDisposable = vscode.commands.registerCommand(
    "fsd-creator.createDomain",
    createDomain
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
    openSettingsDisposable
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
