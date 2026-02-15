# Frontend/Backend ファイル説明

このドキュメントは、今回作成・編集されたフロントエンド/バックエンドの主要ファイルと役割を簡潔にまとめたものです。

## Backend (FastAPI)

- [backend/main.py](../backend/main.py): FastAPIアプリ本体。ルーティング、初期データ投入、CSVアップロードなどのAPIを定義。
- [backend/app/database.py](../backend/app/database.py): DB接続設定とセッション管理。`.env`の読み込みもここで実施。
- [backend/app/models.py](../backend/app/models.py): SQLAlchemyのモデル定義（Item/Group/Leader/Scout）。
- [backend/app/schemas.py](../backend/app/schemas.py): Pydanticのスキーマ定義（API入出力用）。
- [backend/requirements.txt](../backend/requirements.txt): Render向けのpip依存関係。
- [backend/runtime.txt](../backend/runtime.txt): Renderで使用するPythonバージョン指定。
- [backend/Dockerfile](../backend/Dockerfile): Docker実行用の設定。
- [backend/pyproject.toml](../backend/pyproject.toml): Poetry設定（ローカル開発向け）。
- [backend/alembic.ini](../backend/alembic.ini): Alembic設定ファイル。
- [backend/alembic/](../backend/alembic/): マイグレーション管理（`versions/`配下に履歴）。

## Frontend (Next.js)

- [frontend/src/app/page.tsx](../frontend/src/app/page.tsx): 備品一覧ページ（トップ）。APIから備品と団情報を取得。
- [frontend/src/app/leaders/page.tsx](../frontend/src/app/leaders/page.tsx): 指導者管理ページ。
- [frontend/src/app/scouts/page.tsx](../frontend/src/app/scouts/page.tsx): スカウト管理ページ（CSVアップロード含む）。
- [frontend/src/app/layout.tsx](../frontend/src/app/layout.tsx): ルートレイアウト。
- [frontend/src/app/globals.css](../frontend/src/app/globals.css): グローバルCSS。
- [frontend/src/components/ui/](../frontend/src/components/ui/): UIコンポーネント群（Button/Table/Cardなど）。
- [frontend/src/types/](../frontend/src/types/): 型定義（Item/Leader/Scout）。
- [frontend/next.config.ts](../frontend/next.config.ts): Next.js設定。
- [frontend/package.json](../frontend/package.json): npm依存関係。
- [frontend/components.json](../frontend/components.json): shadcn/ui設定。

## 注意事項

- `node_modules/`, `.next/`, `__pycache__/` はビルド生成物のため対象外。
- `.env` に機密情報を含むため、リポジトリには含めない。
