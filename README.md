# LUCKY LAB V2

로또 번호 생성, 최신 당첨번호, 회차별 검색, 통계, 번호 저장과 이용 가이드를 제공하는 Cloudflare Pages용 프로젝트입니다.

## 폴더 구조

```text
lucky-lab-v2/
├─ public/                 # 실제 웹사이트 정적 파일
│  ├─ assets/              # CSS, JS, 로고, 공유 이미지
│  ├─ guides/              # 검색 유입용 이용 가이드
│  ├─ index.html           # 메인 페이지
│  ├─ privacy.html         # 개인정보처리방침
│  ├─ terms.html           # 이용약관
│  ├─ robots.txt
│  ├─ sitemap.xml
│  └─ ads.txt
├─ functions/api/          # Cloudflare Pages Functions
│  ├─ lotto.js             # 최신/회차별 당첨정보 조회
│  └─ health.js            # 배포 상태 확인
├─ scripts/                # 배포 전 검사와 도메인 치환
├─ docs/                   # 배포 문서와 체크리스트
├─ wrangler.toml           # Cloudflare 설정
└─ package.json
```

## 로컬 확인

```bash
npm install
npm run preview
```

브라우저에서 Wrangler가 표시하는 로컬 주소로 접속합니다. `index.html`을 더블클릭해도 화면은 보이지만 서버리스 API는 동작하지 않아 저장된 예비 당첨정보가 표시됩니다.

## 배포 전

```bash
npm run set-domain -- https://실제도메인.com
npm run check
```

자세한 배포 방법은 `docs/DEPLOY-CLOUDFLARE.md`를 확인하세요.

## 문의

- wond502@gmail.com
