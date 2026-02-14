# Jumbory 備品管理アプリ コード説明

## 全体構成

- backend/: FastAPI + Poetry
- frontend/: Next.js (App Router) + Tailwind CSS + shadcn/ui
- docs/: 設計書や仕様書 (Markdown)

## Backend

- [main.py](../backend/main.py): ルートエンドポイント `GET /` が `{"message": "Hello Jumbory API"}` を返す最小構成
- [pyproject.toml](../backend/pyproject.toml): Poetry 依存関係設定 (FastAPI, Uvicorn)

起動手順:

```bash
cd backend
poetry install
poetry run uvicorn main:app --reload
```

## Frontend

- [src/app/page.tsx](../frontend/src/app/page.tsx): Next.js App Router の初期画面
- [src/app/globals.css](../frontend/src/app/globals.css): Tailwind CSS と shadcn/ui の基本スタイル
- [components.json](../frontend/components.json): shadcn/ui の設定

起動手順:

```bash
cd frontend
npm install
npm run dev
```

## 開発メモ

- Backend は API 追加に応じて `app/` 配下にルーターやサービスを追加予定
- Frontend は `src/app/` 配下でページやコンポーネントを整理
