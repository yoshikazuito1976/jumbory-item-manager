# Jumbory Item Manager

Jumbory (ジャンボリー) の備品管理アプリ用リポジトリです。

## Structure

- backend/: FastAPI (Poetry)
- frontend/: Next.js App Router + Tailwind CSS + shadcn/ui (npm)
- docs/: 設計書や API 仕様書 (Markdown)

## Backend

### ローカル実行

```bash
cd backend
poetry install
poetry run uvicorn main:app --reload
```

### Docker実行

```bash
# バックエンドのみ
cd backend
docker build -t jumbory-backend .
docker run -p 8001:8001 jumbory-backend

# または docker-compose を使用（推奨）
docker-compose up
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

- [コード説明書](docs/overview.md): 全体構成と技術スタック
- [データの流れ](docs/data_flow.md): フロントエンドからバックエンド、DBまでのデータフロー（Mermaid シーケンス図）
- [実装ログ](docs/implementation_log.md): 備品管理機能の実装内容と動作確認結果（2026/2/14）
