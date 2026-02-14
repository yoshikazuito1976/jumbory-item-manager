# Jumbory Item Manager

Jumbory (ジャンボリー) の備品管理アプリ用リポジトリです。

## Structure

- backend/: FastAPI (Poetry)
- frontend/: Next.js App Router + Tailwind CSS + shadcn/ui (npm)
- docs/: 設計書や API 仕様書 (Markdown)

## Backend

```bash
cd backend
poetry install
poetry run uvicorn main:app --reload
```

`GET /` returns `{"message": "Hello Jumbory API"}`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 to see the Next.js starter screen.

## Docs

設計書や API 仕様書は docs/ に追加してください。

- コード説明書: [docs/overview.md](docs/overview.md)
