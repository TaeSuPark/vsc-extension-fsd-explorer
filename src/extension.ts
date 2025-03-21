// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"
import { FSDExplorer, FSDItem } from "./fsdExplorer"

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

    // 슬라이스 생성 관련
    initFirst:
      "FSD Creator: src folder not found. Please initialize FSD structure first.",
    domainNamePlaceholder: "Enter slice name (e.g., User, Auth, Product)",
    domainNamePrompt: "Enter the name of the slice to create",
    domainNameRequired: "Slice name is required.",
    domainNameInvalid:
      "Slice name must start with a letter and contain only letters, numbers, and hyphens.",
    domainCreationCancelled: "FSD Creator: Slice creation cancelled.",
    selectLayersPlaceholder: "Select layers to create the slice in",
    layerSelectionCancelled: "FSD Creator: Layer selection cancelled.",
    domainsCreated: "FSD Creator: The following slices have been created: ",
    domainsExist: "FSD Creator: The following slices already exist: ",
    domainsError: "FSD Creator: Error creating the following slices: ",

    // 파일 내용 관련
    domainEntryPoint: "Entry point for the slice",
    interfaceDefinition: "Interface definition for the slice",
    addPropsHere: "Add interface properties here",
    componentPage: "page",
    addComponentContent: "Add component content here",

    // 설정 UI 관련
    settingsTitle: "FSD Creator Settings",
    generalSettings: "General Settings",
    language: "Language",
    fsdInitialization: "FSD Initialization",
    foldersToCreate: "Folders to create when initializing",
    domainCreation: "Slice Creation",
    layersAvailable: "Layers available for slice creation",
    layerStructure: "Layer Structure",
    createComponent: "create component",
    saveSettings: "Save Settings",
    resetToDefaults: "Reset to Defaults",
    settingsSaved: "FSD Creator settings saved!",

    // 사이드바 관련
    initializeFsd: "Initialize FSD Architecture structure in your project.",
    initializeFsdButton: "Initialize FSD",
    createDomainDesc: "Create a new slice across selected layers.",
    createDomainButton: "Create Slice",
    openSettingsButton: "Open Settings",

    // 파일 시스템 명령어
    noActiveEditor: "No active editor",
    notAFolder: "Selected item is not a folder",
    enterFileName: "Enter file name",
    newFilePrompt: "Enter the name of the new file",
    fileNameRequired: "File name is required",
    invalidFileName: "File name cannot contain path separators",
    fileAlreadyExists: "A file with this name already exists",
    enterFolderName: "Enter folder name",
    newFolderPrompt: "Enter the name of the new folder",
    folderNameRequired: "Folder name is required",
    invalidFolderName: "Folder name cannot contain path separators",
    folderAlreadyExists: "A folder with this name already exists",
    errorCreatingFile: "Error creating file",
    errorCreatingFolder: "Error creating folder",
    errorRenaming: "Error renaming item",
    errorDeleting: "Error deleting item",
    confirmDeleteFolder:
      "Are you sure you want to delete the folder '{0}' and all its contents?",
    confirmDeleteFile: "Are you sure you want to delete the file '{0}'?",
    delete: "Delete",
    noItemSelected: "No item selected",
    enterNewName: "Enter new name",
    renamePrompt: "Enter the new name",
    nameRequired: "Name is required",
    invalidName: "Name cannot contain path separators",
    itemAlreadyExists: "An item with this name already exists",
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

    // 슬라이스 생성 관련
    initFirst:
      "FSD Creator: src 폴더가 없습니다. 먼저 FSD 구조를 초기화해주세요.",
    domainNamePlaceholder:
      "슬라이스 이름을 입력하세요 (예: User, Auth, Product)",
    domainNamePrompt: "생성할 슬라이스의 이름을 입력하세요",
    domainNameRequired: "슬라이스 이름은 필수입니다.",
    domainNameInvalid:
      "슬라이스 이름은 알파벳으로 시작하고, 알파벳, 숫자, 하이픈만 포함해야 합니다.",
    domainCreationCancelled: "FSD Creator: 슬라이스 생성이 취소되었습니다.",
    selectLayersPlaceholder: "슬라이스를 생성할 레이어를 선택하세요",
    layerSelectionCancelled: "FSD Creator: 레이어 선택이 취소되었습니다.",
    domainsCreated: "FSD Creator: 다음 슬라이스가 생성되었습니다: ",
    domainsExist: "FSD Creator: 다음 슬라이스는 이미 존재합니다: ",
    domainsError: "FSD Creator: 다음 슬라이스 생성 중 오류가 발생했습니다: ",

    // 파일 내용 관련
    domainEntryPoint: "슬라이스의 진입점",
    interfaceDefinition: "슬라이스의 인터페이스 정의",
    addPropsHere: "여기에 인터페이스 속성을 정의하세요",
    componentPage: "페이지",
    addComponentContent: "여기에 컴포넌트 내용을 추가하세요",

    // 설정 UI 관련
    settingsTitle: "FSD Creator 설정",
    generalSettings: "일반 설정",
    language: "언어",
    fsdInitialization: "FSD 초기화",
    foldersToCreate: "초기화 시 생성할 폴더",
    domainCreation: "슬라이스 생성",
    layersAvailable: "슬라이스 생성에 사용할 레이어",
    layerStructure: "레이어 구조",
    createComponent: "컴포넌트 생성",
    saveSettings: "설정 저장",
    resetToDefaults: "기본값으로 재설정",
    settingsSaved: "FSD Creator 설정이 저장되었습니다!",

    // 사이드바 관련
    initializeFsd: "프로젝트에 FSD 아키텍처 구조를 초기화합니다.",
    initializeFsdButton: "FSD 초기화",
    createDomainDesc: "선택한 레이어에 새 슬라이스를 생성합니다.",
    createDomainButton: "슬라이스 생성",
    openSettingsButton: "설정 열기",

    // 파일 시스템 명령어
    noActiveEditor: "활성화된 편집기가 없습니다",
    notAFolder: "선택한 항목이 폴더가 아닙니다",
    enterFileName: "파일 이름 입력",
    newFilePrompt: "새 파일의 이름을 입력하세요",
    fileNameRequired: "파일 이름은 필수입니다",
    invalidFileName: "파일 이름에 경로 구분자를 포함할 수 없습니다",
    fileAlreadyExists: "이 이름의 파일이 이미 존재합니다",
    enterFolderName: "폴더 이름 입력",
    newFolderPrompt: "새 폴더의 이름을 입력하세요",
    folderNameRequired: "폴더 이름은 필수입니다",
    invalidFolderName: "폴더 이름에 경로 구분자를 포함할 수 없습니다",
    folderAlreadyExists: "이 이름의 폴더가 이미 존재합니다",
    errorCreatingFile: "파일 생성 중 오류 발생",
    errorCreatingFolder: "폴더 생성 중 오류 발생",
    errorRenaming: "이름 변경 중 오류 발생",
    errorDeleting: "항목 삭제 중 오류 발생",
    confirmDeleteFolder: "폴더 '{0}'과(와) 모든 내용을 삭제하시겠습니까?",
    confirmDeleteFile: "파일 '{0}'을(를) 삭제하시겠습니까?",
    delete: "삭제",
    noItemSelected: "선택된 항목이 없습니다",
    enterNewName: "새 이름 입력",
    renamePrompt: "새 이름을 입력하세요",
    nameRequired: "이름은 필수입니다",
    invalidName: "이름에 경로 구분자를 포함할 수 없습니다",
    itemAlreadyExists: "이 이름의 항목이 이미 존재합니다",
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

// 슬라이스 생성 가능한 레이어
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

  // FSD Explorer 새로고침
  vscode.commands.executeCommand("fsd-creator.refreshExplorer")
}

// 슬라이스 생성 함수
async function createSlice(): Promise<void> {
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

  // 슬라이스 이름 입력 받기
  const sliceName = await vscode.window.showInputBox({
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

  if (!sliceName) {
    vscode.window.showInformationMessage(getMessage("domainCreationCancelled"))
    return
  }

  // 설정에서 슬라이스 생성 가능한 레이어 가져오기
  const config = vscode.workspace.getConfiguration("fsd-creator")
  const availableLayers = config.get<Record<string, boolean>>(
    "domainLayers"
  ) || {
    entities: true,
    features: true,
    pages: true,
    widgets: true,
  }

  // 선택 가능한 레이어 필터링
  const layerOptions = Object.entries(availableLayers)
    .filter(([_, enabled]) => enabled)
    .map(([layer]) => layer)

  // 레이어 선택 (다중 선택 가능)
  const selectedLayers = await vscode.window.showQuickPick(layerOptions, {
    placeHolder: getMessage("selectLayersPlaceholder"),
    canPickMany: true,
  })

  if (!selectedLayers || selectedLayers.length === 0) {
    vscode.window.showInformationMessage(getMessage("layerSelectionCancelled"))
    return
  }

  // 레이어 구조 설정 가져오기
  const layerStructure = config.get("layerStructure") || {
    entities: {
      model: true,
      api: true,
      ui: false,
      lib: false,
      config: false,
      consts: false,
    },
    features: {
      model: true,
      api: true,
      ui: true,
      lib: false,
      config: false,
      consts: false,
    },
    pages: {
      model: true,
      api: false,
      ui: true,
      createComponent: true,
      lib: false,
      config: false,
      consts: false,
    },
    widgets: {
      model: true,
      api: false,
      ui: true,
      lib: false,
      config: false,
      consts: false,
    },
  }

  // 슬라이스 생성
  const createdSlices: string[] = []
  const existingSlices: string[] = []
  const errorSlices: string[] = []

  for (const layer of selectedLayers) {
    try {
      const slicePath = path.join(srcPath, layer, sliceName)
      const indexFilePath = path.join(slicePath, "index.ts")

      // 슬라이스 폴더가 이미 존재하는지 확인
      if (fs.existsSync(slicePath)) {
        existingSlices.push(`${layer}/${sliceName}`)
        continue
      }

      // 슬라이스 폴더 생성
      await createFolderIfNotExists(slicePath)

      // 레이어별 구조 설정 가져오기
      const layerConfig = (layerStructure as any)[layer] || { model: true }

      // model 폴더 및 interface.ts 생성
      if (layerConfig.model) {
        const modelPath = path.join(slicePath, "model")
        await createFolderIfNotExists(modelPath)

        // 슬라이스 이름과 레이어 이름을 PascalCase로 변환
        const pascalSliceName = sliceName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")

        const pascalLayerName = layer.charAt(0).toUpperCase() + layer.slice(1)

        // 인터페이스 이름 생성 (I{Layer}{Slice} 형식)
        const interfaceName = `I${pascalLayerName}${pascalSliceName}`

        const interfaceContent = `// ${getMessage(
          "interfaceDefinition"
        )} ${layer}/${sliceName}\n\nexport interface ${interfaceName} {\n  // ${getMessage(
          "addPropsHere"
        )}\n}\n`

        await createFileIfNotExists(
          path.join(modelPath, "interface.ts"),
          interfaceContent
        )
      }

      // api 폴더 생성
      if (layerConfig.api) {
        const apiPath = path.join(slicePath, "api")
        await createFolderIfNotExists(apiPath)
      }

      // ui 폴더 생성
      if (layerConfig.ui) {
        const uiPath = path.join(slicePath, "ui")
        await createFolderIfNotExists(uiPath)
      }

      // lib 폴더 생성
      if (layerConfig.lib) {
        const libPath = path.join(slicePath, "lib")
        await createFolderIfNotExists(libPath)
      }

      // config 폴더 생성
      if (layerConfig.config) {
        const configPath = path.join(slicePath, "config")
        await createFolderIfNotExists(configPath)
      }

      // consts 폴더 생성
      if (layerConfig.consts) {
        const constsPath = path.join(slicePath, "consts")
        await createFolderIfNotExists(constsPath)
      }

      // pages 레이어에서 컴포넌트 생성
      if (layer === "pages" && layerConfig.createComponent) {
        // 컴포넌트 이름 생성 (PascalCase)
        const componentName = sliceName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("")

        // 컴포넌트 파일 경로
        const componentFilePath = path.join(slicePath, `${componentName}.tsx`)

        // 컴포넌트 기본 내용 생성
        const componentContent = `\nexport const ${componentName} = () => {\n  return (\n    <>\n      <h1>${componentName} ${getMessage(
          "componentPage"
        )}</h1>\n      {/* ${getMessage(
          "addComponentContent"
        )} */}\n    </>\n  );\n};\n`

        await createFileIfNotExists(componentFilePath, componentContent)
      }

      // index.ts 파일 생성
      const indexContent = `// ${getMessage(
        "domainEntryPoint"
      )} ${layer}/${sliceName}\n\nexport {};\n`
      await createFileIfNotExists(indexFilePath, indexContent)

      createdSlices.push(`${layer}/${sliceName}`)
    } catch (error) {
      errorSlices.push(`${layer}/${sliceName}`)
      console.error(`Error creating slice ${sliceName} in ${layer}:`, error)
    }
  }

  // 결과 메시지 표시
  if (createdSlices.length > 0) {
    vscode.window.showInformationMessage(
      `${getMessage("domainsCreated")}${createdSlices.join(", ")}`
    )
  }

  if (existingSlices.length > 0) {
    vscode.window.showInformationMessage(
      `${getMessage("domainsExist")}${existingSlices.join(", ")}`
    )
  }

  if (errorSlices.length > 0) {
    vscode.window.showErrorMessage(
      `${getMessage("domainsError")}${errorSlices.join(", ")}`
    )
  }

  // FSD Explorer 새로고침
  vscode.commands.executeCommand("fsd-creator.refreshExplorer")
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

// 설정 웹뷰 HTML 콘텐츠 생성 함수
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

  // 기본값 정의
  const defaultInitFolders = {
    entities: true,
    features: true,
    pages: true,
    widgets: true,
    shared: true,
    app: true,
  }

  const defaultDomainLayers = {
    entities: true,
    features: true,
    pages: true,
    widgets: true,
  }

  const defaultLayerStructure = {
    entities: {
      model: true,
      api: true,
      ui: false,
      lib: false,
      config: false,
      consts: false,
    },
    features: {
      model: true,
      api: true,
      ui: true,
      lib: false,
      config: false,
      consts: false,
    },
    pages: {
      model: true,
      api: false,
      ui: true,
      lib: false,
      config: false,
      consts: false,
      createComponent: true,
    },
    widgets: {
      model: true,
      api: false,
      ui: true,
      lib: false,
      config: false,
      consts: false,
    },
  }
  // 설정 가져오기 (기본값과 병합)
  // 중요: config.get()이 undefined를 반환할 수 있으므로 기본값을 명시적으로 설정

  const initFolders = config.inspect<Record<string, boolean>>("initFolders")
    ? config.inspect<Record<string, boolean>>("initFolders")?.globalValue
    : config.inspect<Record<string, boolean>>("initFolders")?.defaultValue ||
      (defaultInitFolders as Record<string, boolean>)

  const domainLayers =
    config.inspect<Record<string, boolean>>("domainLayers")?.globalValue ||
    config.inspect<Record<string, boolean>>("domainLayers")?.defaultValue ||
    (defaultDomainLayers as Record<string, boolean>)

  const layerStructure =
    config.inspect<Record<string, Record<string, boolean>>>("layerStructure")
      ?.globalValue ||
    config.inspect<Record<string, Record<string, boolean>>>("layerStructure")
      ?.defaultValue ||
    (defaultLayerStructure as Record<string, Record<string, boolean>>)

  // 디버깅을 위해 콘솔에 현재 설정값 출력
  console.log("Current settings:", {
    language,
    initFolders,
    domainLayers,
    layerStructure,
    defaultValues: {
      initFolders: config.inspect("initFolders")?.defaultValue,
      domainLayers: config.inspect("domainLayers")?.defaultValue,
      layerStructure: config.inspect("layerStructure")?.defaultValue,
    },
  })

  // 표현식 미리 평가
  const selectedEn = language === "en" ? "selected" : ""
  const selectedKo = language === "ko" ? "selected" : ""

  // initFolders 체크 상태
  const checkedEntities = initFolders?.entities ? "checked" : ""
  const checkedFeatures = initFolders?.features ? "checked" : ""
  const checkedPages = initFolders?.pages ? "checked" : ""
  const checkedWidgets = initFolders?.widgets ? "checked" : ""
  const checkedShared = initFolders?.shared ? "checked" : ""
  const checkedApp = initFolders?.app ? "checked" : ""

  // domainLayers 체크 상태
  const checkedDomainEntities = domainLayers?.entities ? "checked" : ""
  const checkedDomainFeatures = domainLayers?.features ? "checked" : ""
  const checkedDomainPages = domainLayers?.pages ? "checked" : ""
  const checkedDomainWidgets = domainLayers?.widgets ? "checked" : ""

  // layerStructure 체크 상태
  const checkedEntitiesModel = layerStructure.entities.model ? "checked" : ""
  const checkedEntitiesApi = layerStructure.entities.api ? "checked" : ""
  const checkedEntitiesUi = layerStructure.entities.ui ? "checked" : ""
  const checkedEntitiesLib = layerStructure.entities.lib ? "checked" : ""
  const checkedEntitiesConfig = layerStructure.entities.config ? "checked" : ""
  const checkedEntitiesConsts = layerStructure.entities.consts ? "checked" : ""

  const checkedFeaturesModel = layerStructure.features.model ? "checked" : ""
  const checkedFeaturesApi = layerStructure.features.api ? "checked" : ""
  const checkedFeaturesUi = layerStructure.features.ui ? "checked" : ""
  const checkedFeaturesLib = layerStructure.features.lib ? "checked" : ""
  const checkedFeaturesConfig = layerStructure.features.config ? "checked" : ""
  const checkedFeaturesConsts = layerStructure.features.consts ? "checked" : ""

  const checkedPagesModel = layerStructure.pages.model ? "checked" : ""
  const checkedPagesApi = layerStructure.pages.api ? "checked" : ""
  const checkedPagesUi = layerStructure.pages.ui ? "checked" : ""
  const checkedPagesLib = layerStructure.pages.lib ? "checked" : ""
  const checkedPagesConfig = layerStructure.pages.config ? "checked" : ""
  const checkedPagesConsts = layerStructure.pages.consts ? "checked" : ""
  const checkedPagesComponent = layerStructure.pages.createComponent
    ? "checked"
    : ""

  const checkedWidgetsModel = layerStructure.widgets.model ? "checked" : ""
  const checkedWidgetsApi = layerStructure.widgets.api ? "checked" : ""
  const checkedWidgetsUi = layerStructure.widgets.ui ? "checked" : ""
  const checkedWidgetsLib = layerStructure.widgets.lib ? "checked" : ""
  const checkedWidgetsConfig = layerStructure.widgets.config ? "checked" : ""
  const checkedWidgetsConsts = layerStructure.widgets.consts ? "checked" : ""

  // HTML 템플릿 파일 읽기
  const templatePath = vscode.Uri.joinPath(
    context.extensionUri,
    "media",
    "settings.html"
  )
  let templateContent = await fs.promises.readFile(templatePath.fsPath, "utf8")

  // 템플릿 변수 대체
  templateContent = templateContent
    .replace(/\${styleUri}/g, styleUri.toString())
    .replace(/\${scriptUri}/g, scriptUri.toString())
    .replace(/\${language}/g, language)
    .replace(/\${selectedEn}/g, selectedEn)
    .replace(/\${selectedKo}/g, selectedKo)
    .replace(/\${checkedEntities}/g, checkedEntities)
    .replace(/\${checkedFeatures}/g, checkedFeatures)
    .replace(/\${checkedPages}/g, checkedPages)
    .replace(/\${checkedWidgets}/g, checkedWidgets)
    .replace(/\${checkedShared}/g, checkedShared)
    .replace(/\${checkedApp}/g, checkedApp)
    .replace(/\${checkedDomainEntities}/g, checkedDomainEntities)
    .replace(/\${checkedDomainFeatures}/g, checkedDomainFeatures)
    .replace(/\${checkedDomainPages}/g, checkedDomainPages)
    .replace(/\${checkedDomainWidgets}/g, checkedDomainWidgets)
    .replace(/\${checkedEntitiesModel}/g, checkedEntitiesModel)
    .replace(/\${checkedEntitiesApi}/g, checkedEntitiesApi)
    .replace(/\${checkedEntitiesUi}/g, checkedEntitiesUi)
    .replace(/\${checkedEntitiesLib}/g, checkedEntitiesLib)
    .replace(/\${checkedEntitiesConfig}/g, checkedEntitiesConfig)
    .replace(/\${checkedEntitiesConsts}/g, checkedEntitiesConsts)
    .replace(/\${checkedFeaturesModel}/g, checkedFeaturesModel)
    .replace(/\${checkedFeaturesApi}/g, checkedFeaturesApi)
    .replace(/\${checkedFeaturesUi}/g, checkedFeaturesUi)
    .replace(/\${checkedFeaturesLib}/g, checkedFeaturesLib)
    .replace(/\${checkedFeaturesConfig}/g, checkedFeaturesConfig)
    .replace(/\${checkedFeaturesConsts}/g, checkedFeaturesConsts)
    .replace(/\${checkedPagesModel}/g, checkedPagesModel)
    .replace(/\${checkedPagesApi}/g, checkedPagesApi)
    .replace(/\${checkedPagesUi}/g, checkedPagesUi)
    .replace(/\${checkedPagesLib}/g, checkedPagesLib)
    .replace(/\${checkedPagesConfig}/g, checkedPagesConfig)
    .replace(/\${checkedPagesConsts}/g, checkedPagesConsts)
    .replace(/\${checkedPagesComponent}/g, checkedPagesComponent)
    .replace(/\${checkedWidgetsModel}/g, checkedWidgetsModel)
    .replace(/\${checkedWidgetsApi}/g, checkedWidgetsApi)
    .replace(/\${checkedWidgetsUi}/g, checkedWidgetsUi)
    .replace(/\${checkedWidgetsLib}/g, checkedWidgetsLib)
    .replace(/\${checkedWidgetsConfig}/g, checkedWidgetsConfig)
    .replace(/\${checkedWidgetsConsts}/g, checkedWidgetsConsts)
  // UI 메시지 대체
  Object.entries(uiMessages).forEach(([key, value]) => {
    // value를 문자열로 변환
    const stringValue = String(value)
    templateContent = templateContent.replace(
      new RegExp(`\\$\\{uiMessages\\.${key}\\}`, "g"),
      stringValue
    )
  })

  return templateContent
}

// 설정 웹뷰 패널 생성 함수
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

// 파일 생성 명령어
async function createFile(fileItem: FSDItem) {
  if (!fileItem) {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) {
      vscode.window.showErrorMessage(getMessage("noActiveEditor"))
      return
    }

    // 현재 열린 파일의 디렉토리를 기본 위치로 사용
    const currentFilePath = activeEditor.document.uri.fsPath
    const currentDir = path.dirname(currentFilePath)
    fileItem = {
      resourceUri: vscode.Uri.file(currentDir),
      contextValue: "folder",
    } as FSDItem
  }

  // 폴더인지 확인
  if (fileItem.contextValue !== "folder") {
    vscode.window.showErrorMessage(getMessage("notAFolder"))
    return
  }

  // 파일 이름 입력 받기
  const fileName = await vscode.window.showInputBox({
    placeHolder: getMessage("enterFileName"),
    prompt: getMessage("newFilePrompt"),
    validateInput: (value) => {
      if (!value) {
        return getMessage("fileNameRequired")
      }
      if (value.includes("/") || value.includes("\\")) {
        return getMessage("invalidFileName")
      }
      return null
    },
  })

  if (!fileName) {
    return // 취소됨
  }

  // 파일 경로 생성
  const filePath = path.join(fileItem.resourceUri.fsPath, fileName)

  // 파일이 이미 존재하는지 확인
  if (fs.existsSync(filePath)) {
    vscode.window.showErrorMessage(getMessage("fileAlreadyExists"))
    return
  }

  // 파일 생성
  try {
    fs.writeFileSync(filePath, "")

    // 생성된 파일 열기
    const document = await vscode.workspace.openTextDocument(filePath)
    await vscode.window.showTextDocument(document)

    // FSD Explorer 새로고침
    vscode.commands.executeCommand("fsd-creator.refreshExplorer")
  } catch (error) {
    vscode.window.showErrorMessage(
      `${getMessage("errorCreatingFile")}: ${error}`
    )
  }
}

// 폴더 생성 명령어
async function createFolder(fileItem: FSDItem) {
  if (!fileItem) {
    const activeEditor = vscode.window.activeTextEditor
    if (!activeEditor) {
      vscode.window.showErrorMessage(getMessage("noActiveEditor"))
      return
    }

    // 현재 열린 파일의 디렉토리를 기본 위치로 사용
    const currentFilePath = activeEditor.document.uri.fsPath
    const currentDir = path.dirname(currentFilePath)
    fileItem = {
      resourceUri: vscode.Uri.file(currentDir),
      contextValue: "folder",
    } as FSDItem
  }

  // 폴더인지 확인
  if (fileItem.contextValue !== "folder") {
    vscode.window.showErrorMessage(getMessage("notAFolder"))
    return
  }

  // 폴더 이름 입력 받기
  const folderName = await vscode.window.showInputBox({
    placeHolder: getMessage("enterFolderName"),
    prompt: getMessage("newFolderPrompt"),
    validateInput: (value) => {
      if (!value) {
        return getMessage("folderNameRequired")
      }
      if (value.includes("/") || value.includes("\\")) {
        return getMessage("invalidFolderName")
      }
      return null
    },
  })

  if (!folderName) {
    return // 취소됨
  }

  // 폴더 경로 생성
  const folderPath = path.join(fileItem.resourceUri.fsPath, folderName)

  // 폴더가 이미 존재하는지 확인
  if (fs.existsSync(folderPath)) {
    vscode.window.showErrorMessage(getMessage("folderAlreadyExists"))
    return
  }

  // 폴더 생성
  try {
    fs.mkdirSync(folderPath)

    // FSD Explorer 새로고침
    vscode.commands.executeCommand("fsd-creator.refreshExplorer")
  } catch (error) {
    vscode.window.showErrorMessage(
      `${getMessage("errorCreatingFolder")}: ${error}`
    )
  }
}

// 이름 변경 명령어
async function rename(fileItem: FSDItem) {
  if (!fileItem) {
    vscode.window.showErrorMessage(getMessage("noItemSelected"))
    return
  }

  const oldPath = fileItem.resourceUri.fsPath
  const oldName = path.basename(oldPath)
  const parentDir = path.dirname(oldPath)

  // 새 이름 입력 받기
  const newName = await vscode.window.showInputBox({
    value: oldName,
    placeHolder: getMessage("enterNewName"),
    prompt: getMessage("renamePrompt"),
    validateInput: (value) => {
      if (!value) {
        return getMessage("nameRequired")
      }
      if (value.includes("/") || value.includes("\\")) {
        return getMessage("invalidName")
      }
      return null
    },
  })

  if (!newName || newName === oldName) {
    return // 취소되거나 이름이 변경되지 않음
  }

  // 새 경로 생성
  const newPath = path.join(parentDir, newName)

  // 이미 존재하는지 확인
  if (fs.existsSync(newPath)) {
    vscode.window.showErrorMessage(getMessage("itemAlreadyExists"))
    return
  }

  // 이름 변경
  try {
    fs.renameSync(oldPath, newPath)

    // FSD Explorer 새로고침
    vscode.commands.executeCommand("fsd-creator.refreshExplorer")
  } catch (error) {
    vscode.window.showErrorMessage(`${getMessage("errorRenaming")}: ${error}`)
  }
}

// 삭제 명령어
async function deleteItem(fileItem: FSDItem) {
  if (!fileItem) {
    vscode.window.showErrorMessage(getMessage("noItemSelected"))
    return
  }

  const itemPath = fileItem.resourceUri.fsPath
  const itemName = path.basename(itemPath)
  const isDirectory = fileItem.contextValue === "folder"

  // 확인 메시지
  const confirmMessage = isDirectory
    ? getMessage("confirmDeleteFolder").replace("{0}", itemName)
    : getMessage("confirmDeleteFile").replace("{0}", itemName)

  const confirmed = await vscode.window.showWarningMessage(
    confirmMessage,
    { modal: true },
    getMessage("delete")
  )

  if (confirmed !== getMessage("delete")) {
    return // 취소됨
  }

  // 삭제
  try {
    if (isDirectory) {
      // 재귀적으로 폴더 삭제
      fs.rmdirSync(itemPath, { recursive: true })
    } else {
      fs.unlinkSync(itemPath)
    }

    // FSD Explorer 새로고침
    vscode.commands.executeCommand("fsd-creator.refreshExplorer")
  } catch (error) {
    vscode.window.showErrorMessage(`${getMessage("errorDeleting")}: ${error}`)
  }
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

  // 슬라이스 생성 명령어 등록
  const createSliceDisposable = vscode.commands.registerCommand(
    "fsd-creator.createDomain",
    createSlice
  )

  // 설정 명령어 등록
  const openSettingsDisposable = vscode.commands.registerCommand(
    "fsd-creator.openSettings",
    async () => {
      await createSettingsWebview(context)
    }
  )

  // FSD 익스플로러 등록
  const workspaceRoot =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined

  const fsdExplorer = new FSDExplorer(workspaceRoot)
  const treeView = vscode.window.createTreeView("fsdExplorer", {
    treeDataProvider: fsdExplorer,
    showCollapseAll: true,
  })
  fsdExplorer.setTreeView(treeView)

  // 리프레시 명령어 등록
  const refreshExplorerDisposable = vscode.commands.registerCommand(
    "fsd-creator.refreshExplorer",
    () => fsdExplorer.refresh()
  )

  // 파일 시스템 명령어 등록
  const createFileDisposable = vscode.commands.registerCommand(
    "fsd-creator.createFile",
    createFile
  )

  const createFolderDisposable = vscode.commands.registerCommand(
    "fsd-creator.createFolder",
    createFolder
  )

  const renameDisposable = vscode.commands.registerCommand(
    "fsd-creator.rename",
    rename
  )

  const deleteDisposable = vscode.commands.registerCommand(
    "fsd-creator.delete",
    deleteItem
  )

  // 확장 프로그램이 비활성화될 때 리소스 해제
  context.subscriptions.push(
    helloWorldDisposable,
    initFsdDisposable,
    createSliceDisposable,
    openSettingsDisposable,
    refreshExplorerDisposable,
    treeView,
    { dispose: () => fsdExplorer.dispose() },
    createFileDisposable,
    createFolderDisposable,
    renameDisposable,
    deleteDisposable
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
