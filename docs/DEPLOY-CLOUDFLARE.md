# Cloudflare Pages 배포

## 가장 쉬운 방법: GitHub 연결

1. 이 프로젝트 폴더의 파일 전체를 GitHub 저장소에 올립니다.
2. Cloudflare 대시보드에서 **Workers & Pages → Create → Pages → Connect to Git**을 선택합니다.
3. 저장소를 선택하고 아래와 같이 설정합니다.
   - Framework preset: `None`
   - Build command: 비워두기
   - Build output directory: `public`
4. 배포 후 아래 주소가 정상인지 확인합니다.
   - `/`
   - `/api/health`
   - `/api/lotto`
5. 커스텀 도메인을 연결한 뒤 도메인 치환 스크립트를 실행하고 다시 올립니다.

```bash
npm install
npm run set-domain -- https://실제도메인.com
npm run check
```

## Cloudflare 직접 업로드 주의

대시보드의 정적 파일 직접 업로드 방식은 `functions/` 서버리스 함수가 포함되지 않을 수 있습니다. 최신 당첨번호 자동조회와 회차 검색을 쓰려면 GitHub 연결 방식 또는 Wrangler 배포를 권장합니다.

## Wrangler 배포

```bash
npm install
npx wrangler login
npm run deploy
```
