# 목회파트너

목회자를 위한 AI 성경 연구 보조 서비스입니다. 설교문을 대신 작성하지 않고 본문의 배경, 문맥, 구조, 핵심 주제와 원어 관찰을 정리합니다.

## Vercel 배포

1. Vercel에서 이 GitHub 저장소를 가져옵니다.
2. 프로젝트 설정의 Environment Variables에 `OPENAI_API_KEY`를 추가합니다.
3. Deploy를 실행합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

루트에 `.env.local` 파일을 만들고 다음 값을 입력합니다.

```text
OPENAI_API_KEY=your_key_here
```

API 키나 `.env.local` 파일은 GitHub에 올리지 마세요.
