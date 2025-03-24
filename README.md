# FSD Explorer

## 한국어

### 소개

FSD Explorer는 Feature-Sliced Design 아키텍처를 사용하는 프로젝트를 위한 VS Code 익스텐션입니다. 이 익스텐션은 프로젝트의 FSD 구조를 시각화하고 아키텍처 규칙 위반을 감지하여 표시합니다.

### 기능

- FSD 구조 시각화: 프로젝트의 계층(app, pages, widgets, features, entities, shared)을 트리 뷰로 표시
- 규칙 위반 감지: FSD 아키텍처 규칙을 위반하는 import 문을 감지
- 위반 표시: 규칙을 위반하는 파일과 해당 파일이 포함된 폴더에 경고 아이콘 표시
- 빠른 탐색: FSD 구조를 통해 프로젝트 파일을 쉽게 탐색

### 규칙 검사

FSD Explorer는 다음과 같은 규칙 위반을 감지합니다:

1. 하위 계층이 상위 계층을 import하는 경우 (예: entities에서 features 계층 import)
2. 동일 계층 내에서 다른 슬라이스를 import하는 경우 (예: features/auth에서 features/profile import)

### 설치 방법

1. VS Code 마켓플레이스에서 "FSD Explorer" 검색
2. 또는 `.vsix` 파일을 다운로드하여 직접 설치:
   - VS Code 확장 뷰에서 "..." 메뉴 클릭
   - "VSIX에서 설치..." 선택
   - 다운로드한 `.vsix` 파일 선택

### 사용 방법

1. FSD 구조를 사용하는 프로젝트를 VS Code로 엽니다.
2. 활동 바에서 FSD Explorer 아이콘을 클릭합니다.
3. FSD 구조가 트리 뷰로 표시됩니다.
4. 규칙 위반이 있는 파일은 경고 아이콘으로 표시됩니다.
5. 규칙 위반 파일이 포함된 폴더에도 경고 아이콘이 표시됩니다.

### 주의사항

- 주석 처리된 import 문은 규칙 위반 검사에서 제외됩니다.
- 프로젝트 루트 또는 src 폴더에 FSD 구조가 있어야 합니다.

## English

### Introduction

FSD Explorer is a VS Code extension for projects using Feature-Sliced Design architecture. This extension visualizes the FSD structure of your project and detects architecture rule violations.

### Features

- FSD Structure Visualization: Displays the layers of your project (app, pages, widgets, features, entities, shared) in a tree view
- Rule Violation Detection: Detects import statements that violate FSD architecture rules
- Violation Indicators: Shows warning icons on files that violate rules and folders containing those files
- Quick Navigation: Easily navigate through your project files using the FSD structure

### Rule Checking

FSD Explorer detects the following rule violations:

1. When a lower layer imports from a higher layer (e.g., entities importing from features)
2. When a slice imports from another slice within the same layer (e.g., features/auth importing from features/profile)

### Installation

1. Search for "FSD Explorer" in the VS Code Marketplace
2. Or install directly from a `.vsix` file:
   - Click the "..." menu in the Extensions view
   - Select "Install from VSIX..."
   - Choose the downloaded `.vsix` file

### Usage

1. Open a project with FSD structure in VS Code.
2. Click the FSD Explorer icon in the activity bar.
3. The FSD structure will be displayed in a tree view.
4. Files with rule violations will be marked with warning icons.
5. Folders containing rule violation files will also be marked with warning icons.

### Notes

- Import statements in comments are excluded from rule violation checks.
- Your project should have an FSD structure in the root or src folder.
