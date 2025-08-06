# 🍳 요리한수 (Cooking Hansu)

> 누구나 요리를 배우고, 나누고, 소통하는 All-in-One 요리 플랫폼  
> 레시피 공유부터 요리 전문가 강의까지, 한 수 배워보세요!

---

## 👨‍💻 Team Members

<table>
  <tr>
    <td align="center"> 김건동</td>
    <td align="center"> 이승지</td>
    <td align="center"> 최재혁</td>
    <td align="center"> 조민형</td>
    <td align="center"> 김상환</td>
  </tr>
  <tr>
    <td align="center"><a href="#" target="_blank"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"/></a></td>
    <td align="center"><a href="#" target="_blank"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"/></a></td>
    <td align="center"><a href="#" target="_blank"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"/></a></td>
    <td align="center"><a href="#" target="_blank"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"/></a></td>
    <td align="center"><a href="#" target="_blank"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"/></a></td>
  </tr>
</table>

---

## 🎨 디자인 & 설계 자료

| 구분 | 링크 |
|------|------|
| 🧩 **Figma 디자인** | [👉 피그마 보기](https://www.figma.com/design/0r1vmACeBTegtlH9OHZaMn/%EC%9A%94%EB%A6%AC%ED%95%9C%EC%88%98?node-id=0-1&p=f&t=NJOrncqdhdRnxdh6-0) |
| 🗂️ **ERD (DB 설계도)** | [👉 ERDCloud 보기](https://www.erdcloud.com/d/25tEnmWT48D4MufsZ) |
| 📝 **WBS & 요구사항 정의서** | [👉 Google Sheet 보기](https://docs.google.com/spreadsheets/d/1UsaqCAM9-1V2rr0dIufYZtAmWtn-mnH4Uthqad71YM8/edit?gid=2045131748#gid=2045131748) |

---

## 🛠️ 기술 스택

### 📦 Frontend

- **Vue 3**
- **Vite**
- **Vuetify 3**
- **Pinia** – 상태 관리
- **Vue Router 4** – SPA 라우팅
- **Axios** – API 통신
- **SCSS** – 스타일링
- **JavaScript (ES6+)**

### 🧰 Backend

- **Spring Boot**
- **Spring Data JPA**
- **MySQL**
- **Spring Security + JWT**
- **Lombok**
- **Gradle**

---

## 🔧 환경 설정

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_BASE_URL=http://localhost:8080
```

**주의**: `.env` 파일은 `.gitignore`에 포함되어 있으므로 Git에 커밋되지 않습니다.

### 개발 서버 실행

```bash
npm install
npm run dev
```

---

## 📄 Commit Convention

| 태그         | 설명                   |
|--------------|------------------------|
| `feat`       | 기능 추가              |
| `fix`        | 버그 수정              |
| `refactor`   | 리팩토링 (기능 변경 없음) |
| `style`      | 코드 스타일 수정 (공백, 포맷 등) |
| `docs`       | 문서 작성/수정         |
| `test`       | 테스트 코드 작성       |
| `chore`      | 빌드, 패키지, 설정 등 기타 변경 |
| `ci`         | CI/CD 설정 관련       |

---

