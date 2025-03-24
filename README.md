# FSD Explorer

## Guide

### Introduction

FSD Explorer is a VS Code extension for projects using Feature-Sliced Design architecture. This extension helps you visualize your project's FSD structure and enforce architectural rules through real-time violation detection.

### Features

- **FSD Structure Visualization**

  - Tree view display of FSD layers (app, pages, widgets, features, entities, shared)
  - Visual indicators for rule violations (warning icons)
  - Parent folder violation status propagation

- **Rule Violation Detection**

  - Detects imports from higher layers to lower layers
  - Detects cross-slice imports within the same layer
  - Excludes commented-out imports from violation checks
  - Real-time progress tracking during scans
  - Cancellable scan operations

- **Project Management**
  - Initialize FSD structure with customizable layers
  - Create new slices across multiple layers
  - Quick file and folder creation within the FSD structure
  - Rename and delete operations with safety checks

### Installation

Search for "FSD Explorer" in VS Code Marketplace

### Usage

1. Open a project in VS Code
2. Click the FSD Explorer icon in the Activity Bar
3. Initialize FSD structure or open existing one
4. Use the tree view to navigate your FSD structure
5. Run violation checks through the command palette or context menu
6. Click on violation warnings to view and fix issues

### Requirements

- VS Code version 1.91.0 or higher
- Project must have a root or src folder for FSD structure

### Notes

- Commented imports are excluded from rule violation checks
- For absolute path imports, only two alias formats are supported: '@/[layer]' and '@[layer]' (e.g., '@/pages', '@pages')

---

## 가이드

### 소개

FSD Explorer는 Feature-Sliced Design 아키텍처를 사용하는 프로젝트를 위한 VS Code 확장 프로그램입니다. 이 확장은 프로젝트의 FSD 구조를 시각화하고 실시간 위반 감지를 통해 아키텍처 규칙을 준수하도록 돕습니다.

### 기능

- **FSD 구조 시각화**

  - FSD 계층 트리 뷰 표시 (app, pages, widgets, features, entities, shared)
  - 규칙 위반 시각적 표시 (경고 아이콘)
  - 상위 폴더 위반 상태 전파

- **규칙 위반 감지**

  - 상위 계층에서 하위 계층으로의 import 감지
  - 동일 계층 내 다른 슬라이스 간 import 감지
  - 주석 처리된 import 문은 검사에서 제외
  - 실시간 검사 진행 상태 표시
  - 검사 작업 취소 가능

- **프로젝트 관리**
  - 사용자 정의 가능한 계층으로 FSD 구조 초기화
  - 여러 계층에 걸쳐 새로운 슬라이스 생성
  - FSD 구조 내 빠른 파일 및 폴더 생성
  - 안전한 이름 변경 및 삭제 작업

### 설치 방법

VS Code 마켓플레이스에서 "FSD Explorer" 검색

### 사용 방법

1. VS Code에서 프로젝트 열기
2. 활동 바에서 FSD Explorer 아이콘 클릭
3. FSD 구조 초기화 또는 기존 구조 열기
4. 트리 뷰로 FSD 구조 탐색
5. 명령 팔레트나 컨텍스트 메뉴로 위반 검사 실행
6. 위반 경고를 클릭하여 문제 확인 및 수정

### 요구사항

- VS Code 버전 1.91.0 이상
- 프로젝트에 FSD 구조를 위한 루트 또는 src 폴더 필요

### 참고사항

- 주석 처리된 import 문은 규칙 위반 검사에서 제외됩니다
- 절대 경로 import 시 '@/[layer]', '@[layer]' 형식의 별칭만 지원됩니다 (예: '@/pages', '@pages')
