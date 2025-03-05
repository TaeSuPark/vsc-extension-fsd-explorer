;(function () {
  const vscode = acquireVsCodeApi()

  // 설정 저장 함수
  function saveSettings() {
    const settings = {
      language: document.getElementById("language").value,

      // 초기화 폴더 설정
      initFolders: {
        entities: document.getElementById("init-entities").checked,
        features: document.getElementById("init-features").checked,
        pages: document.getElementById("init-pages").checked,
        widgets: document.getElementById("init-widgets").checked,
        shared: document.getElementById("init-shared").checked,
        app: document.getElementById("init-app").checked,
      },

      // 도메인 생성 레이어 설정
      domainLayers: {
        entities: document.getElementById("domain-entities").checked,
        features: document.getElementById("domain-features").checked,
        pages: document.getElementById("domain-pages").checked,
        widgets: document.getElementById("domain-widgets").checked,
      },

      // 레이어 구조 설정
      layerStructure: {
        entities: {
          model: document.getElementById("entities-model").checked,
          api: document.getElementById("entities-api").checked,
          ui: document.getElementById("entities-ui").checked,
          lib: document.getElementById("entities-lib").checked,
        },
        features: {
          model: document.getElementById("features-model").checked,
          api: document.getElementById("features-api").checked,
          ui: document.getElementById("features-ui").checked,
          lib: document.getElementById("features-lib").checked,
        },
        pages: {
          model: document.getElementById("pages-model").checked,
          api: document.getElementById("pages-api").checked,
          ui: document.getElementById("pages-ui").checked,
          lib: document.getElementById("pages-lib").checked,
          createComponent: document.getElementById("pages-component").checked,
        },
        widgets: {
          model: document.getElementById("widgets-model").checked,
          api: document.getElementById("widgets-api").checked,
          ui: document.getElementById("widgets-ui").checked,
          lib: document.getElementById("widgets-lib").checked,
        },
      },
    }

    vscode.postMessage({
      command: "saveSettings",
      settings: settings,
    })
  }

  // 기본값으로 재설정 함수
  function resetToDefaults() {
    // 언어 설정
    document.getElementById("language").value = "en"

    // 초기화 폴더 설정
    document.getElementById("init-entities").checked = true
    document.getElementById("init-features").checked = true
    document.getElementById("init-pages").checked = true
    document.getElementById("init-widgets").checked = true
    document.getElementById("init-shared").checked = true
    document.getElementById("init-app").checked = true

    // 도메인 생성 레이어 설정
    document.getElementById("domain-entities").checked = true
    document.getElementById("domain-features").checked = true
    document.getElementById("domain-pages").checked = true
    document.getElementById("domain-widgets").checked = true

    // 레이어 구조 설정
    document.getElementById("entities-model").checked = true
    document.getElementById("entities-api").checked = true
    document.getElementById("entities-ui").checked = false
    document.getElementById("entities-lib").checked = false

    document.getElementById("features-model").checked = true
    document.getElementById("features-api").checked = true
    document.getElementById("features-ui").checked = true
    document.getElementById("features-lib").checked = false

    document.getElementById("pages-model").checked = true
    document.getElementById("pages-api").checked = false
    document.getElementById("pages-ui").checked = true
    document.getElementById("pages-lib").checked = false
    document.getElementById("pages-component").checked = true

    document.getElementById("widgets-model").checked = true
    document.getElementById("widgets-api").checked = false
    document.getElementById("widgets-ui").checked = true
    document.getElementById("widgets-lib").checked = false
  }

  // 이벤트 리스너 등록
  document.getElementById("saveButton").addEventListener("click", saveSettings)
  document
    .getElementById("resetButton")
    .addEventListener("click", resetToDefaults)
})()
