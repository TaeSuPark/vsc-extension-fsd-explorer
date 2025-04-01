# Change Log / 변경 이력

## English

### [0.0.3] - 2024-03-25 - Bug Fix

#### Fixed

- Fixed a bug where Git diff viewer was not working properly due to file focusing issues
- Improved Git diff viewer detection using `visibleTextEditors` API

### [0.0.2] - 2024-03-24 - Bug Fix

#### Fixed

- Fixed a bug where page components were created in the slice root instead of the ui folder
- Components are now only created when ui folder option is enabled

### [0.0.1] - 2024-03-24 - Initial Release

#### Added

- FSD structure visualization with tree view
- Rule violation detection for FSD architecture
  - Layer dependency rules
  - Cross-slice import rules
  - Support for alias imports (@/[layer], @[layer])
- Project management features
  - FSD structure initialization
  - Slice creation across layers
  - File and folder operations
- Real-time violation checking with progress tracking
- Multilingual support (English/Korean)

---

## 한글

### [0.0.3] - 2024-03-25 - 버그 수정

#### 수정됨

- Git diff 뷰어 사용 시 파일 포커싱으로 인한 비교 기능 동작 오류 수정
- `visibleTextEditors` API를 사용하여 Git diff 뷰어 감지 방식 개선

### [0.0.2] - 2024-03-24 - 버그 수정

#### 수정됨

- 페이지 컴포넌트가 ui 폴더가 아닌 슬라이스 루트에 생성되는 버그 수정
- ui 폴더 옵션이 활성화된 경우에만 컴포넌트가 생성되도록 수정

### [0.0.1] - 2024-03-24 - 최초 릴리즈

#### 추가된 기능

- FSD 구조 트리 뷰 시각화
- FSD 아키텍처 규칙 위반 감지
  - 계층 간 의존성 규칙
  - 크로스 슬라이스 import 규칙
  - 별칭 import 지원 (@/[layer], @[layer])
- 프로젝트 관리 기능
  - FSD 구조 초기화
  - 여러 계층에 걸친 슬라이스 생성
  - 파일 및 폴더 조작
- 진행률 표시와 함께 실시간 위반 검사
- 다국어 지원 (영어/한국어)
