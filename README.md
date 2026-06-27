# platform-react — Keycloak 커스텀 로그인 테마

[Keycloakify v11](https://keycloakify.dev) 로 만든 **Keycloak 로그인 화면 커스텀 테마**입니다.
기본 Keycloak 로그인 페이지 대신, MUI(Material UI) 기반의 한국어 로그인 UI(아이디/비밀번호 + Google 소셜 로그인)를 보여줍니다.

> Keycloakify 는 React 코드를 Keycloak 이 인식하는 테마(.jar) 로 컴파일해 줍니다.
> 즉 **React 로 로그인 화면을 만들고 → 빌드해서 → Keycloak 서버에 올리는** 구조입니다.

---

## 무엇이 커스텀되어 있나

- `src/login/pages/Login.tsx` — 로그인 페이지(`login.ftl`)를 MUI Card + 그라데이션 배경으로 새로 디자인. 한국어 라벨, "로그인 상태 유지", "비밀번호를 잊으셨나요?", Google 소셜 로그인 버튼, 회원가입 링크 포함.
- `src/login/theme/` — MUI 테마(색상/타이포/입력창/아이콘 등). `AppTheme`, `CustomIcons`(Sitemark·Google 아이콘) 등.
- `src/login/KcPage.tsx` — 어떤 페이지를 어떤 컴포넌트로 그릴지 라우팅. `login.ftl` 만 커스텀 `Login` 으로 보내고, 나머지(회원가입·비밀번호 재설정 등)는 Keycloakify 기본 페이지를 사용.
- `vite.config.ts` — 테마 이름 `platform-react`, account 테마는 사용 안 함(`none`).

---

## 요구사항

| 도구 | 버전 | 용도 |
|------|------|------|
| Node.js | ^18 또는 >=20 | 개발/빌드 |
| npm (또는 yarn) | — | 패키지 관리 |
| **Java (JDK)** | >= 11 권장 | 테마 .jar 빌드 시 필요 |
| **Maven** | >= 3.1.1 | 테마 .jar 빌드 시 필요 |

> Java/Maven 은 **로컬 개발·미리보기에는 필요 없고**, Keycloak 에 올릴 `.jar` 를 만들 때만 필요합니다.
> Windows 설치: `choco install openjdk` · `choco install maven` (또는 [Maven 다운로드](https://maven.apache.org/download.cgi))

---

## 설치

```bash
npm install
# 또는 yarn install  (이 경우 package-lock.json 을 지우세요)
```

---

## 1. 로컬에서 디자인 미리보기 (Keycloak 없이)

Keycloak 서버 없이, 브라우저에서 로그인 화면 디자인만 빠르게 확인합니다.

```bash
npm run dev
```

기본 상태에서는 `kcContext` 가 없어 `No Keycloak Context` 가 보입니다.
특정 페이지를 mock 데이터로 띄우려면 `src/main.tsx` 상단의 주석 블록을 해제하세요.

```tsx
// src/main.tsx
import { getKcContextMock } from "./login/KcPageStory";

if (import.meta.env.DEV) {
    window.kcContext = getKcContextMock({
        pageId: "login.ftl",   // 보고 싶은 페이지
        overrides: {}
    });
}
```

> 번들 크기 때문에, 확인이 끝나면 이 블록은 다시 주석 처리하세요.

---

## 2. Storybook 으로 페이지별 확인 (선택)

```bash
npm run storybook   # http://localhost:6006
```

다양한 페이지/상태(에러 메시지, 소셜 로그인 유무 등)를 격리해서 확인할 때 사용합니다.

---

## 3. Keycloak 테마(.jar) 빌드

실제 Keycloak 에 적용할 테마 파일을 만듭니다. **Java + Maven 필요.**

```bash
npm run build-keycloak-theme
```

- 내부적으로 `npm run build` (tsc + vite build) → `keycloakify build` 가 실행됩니다.
- 결과물은 `dist_keycloak/` 폴더에 `.jar` 로 생성됩니다.
- 기본적으로 Keycloak 버전별로 여러 `.jar` 가 만들어집니다. ([버전 타겟 설정](https://docs.keycloakify.dev/features/compiler-options/keycloakversiontargets))

---

## 4. Keycloak 서버에 적용

1. 생성된 `.jar` 를 Keycloak 의 `providers/` 디렉터리에 복사합니다.
   ```bash
   cp dist_keycloak/keycloak-theme-for-kc-<버전>.jar  <KEYCLOAK_HOME>/providers/
   ```
2. Keycloak 을 (재)빌드/재시작합니다.
   ```bash
   <KEYCLOAK_HOME>/bin/kc.sh build
   <KEYCLOAK_HOME>/bin/kc.sh start
   ```
   > Docker 라면 `.jar` 를 `/opt/keycloak/providers/` 에 마운트하세요.
3. Keycloak 관리 콘솔 → **Realm settings → Themes → Login theme** 에서 `platform-react` 를 선택하고 저장합니다.
4. 해당 Realm 의 로그인 화면에서 커스텀 디자인을 확인합니다.

> Google 소셜 로그인 버튼이 보이려면, Keycloak Realm 에 **Identity Providers → Google** 이 설정되어 있어야 합니다.

---

## 프로젝트 구조

```
src/
├─ main.tsx                  # 엔트리. window.kcContext 로 KcPage 렌더 (+ mock 토글)
├─ kc.gen.tsx                # Keycloakify 자동 생성 (직접 수정 금지)
└─ login/
   ├─ KcPage.tsx             # 페이지 라우팅 (login.ftl → 커스텀 Login)
   ├─ KcContext.ts           # 페이지에 들어오는 데이터 타입
   ├─ i18n.ts                # 다국어 설정
   ├─ KcPageStory.tsx        # mock/Storybook 헬퍼
   ├─ pages/
   │  └─ Login.tsx           # 👈 커스텀 로그인 화면 (가장 자주 수정)
   └─ theme/                 # MUI 테마 (색상·타이포·아이콘·입력창)
      ├─ AppTheme.tsx
      ├─ CustomIcons.tsx     # Sitemark 로고, Google 아이콘
      ├─ themePrimitives.ts
      └─ customizations/
```

---

## 자주 수정하는 곳

| 하고 싶은 것 | 파일 |
|--------------|------|
| 로그인 화면 문구·레이아웃·버튼 | `src/login/pages/Login.tsx` |
| 로고 / 소셜 아이콘 | `src/login/theme/CustomIcons.tsx` |
| 색상·폰트·테마 톤 | `src/login/theme/themePrimitives.ts`, `AppTheme.tsx` |
| 입력창·카드 등 컴포넌트 스타일 | `src/login/theme/customizations/` |
| 회원가입 등 다른 페이지도 커스텀 | `src/login/KcPage.tsx` 의 `switch` 분기 추가 + `pages/` 에 컴포넌트 추가 |
| 테마 이름 변경 | `vite.config.ts` 의 `themeName` |

---

## 다른 페이지 테마 초기화 (선택)

```bash
npx keycloakify initialize-account-theme   # 계정(account) 테마
npx keycloakify initialize-email-theme     # 이메일 테마
```

---

## 명령어 요약

| 명령 | 설명 |
|------|------|
| `npm run dev` | 로컬 디자인 미리보기 (Vite) |
| `npm run storybook` | Storybook 으로 페이지별 확인 |
| `npm run build` | TypeScript + Vite 빌드 |
| `npm run build-keycloak-theme` | Keycloak 테마 `.jar` 생성 (Java/Maven 필요) |
| `npm run format` | Prettier 포맷팅 |

---

## 참고 문서

- Keycloakify 공식 문서: https://docs.keycloakify.dev
- 로컬 테스트: https://docs.keycloakify.dev/testing-your-theme
- CSS/디자인 커스터마이징: https://docs.keycloakify.dev/css-customization
