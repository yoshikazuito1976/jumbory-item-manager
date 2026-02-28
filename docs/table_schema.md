# テーブル設計（Database Schema）

このドキュメントは、現在のバックエンド実装とマイグレーション適用後のテーブル構成をまとめたものです。

## ER概要

- `groups`（団） 1 : N `items`（備品）
- `groups`（団） 1 : N `leaders`（指導者）
- `groups`（団） 1 : N `scouts`（スカウト）
- `leaders`（指導者） 1 : N `items`（承認者）
- `scouts`（スカウト） 1 : N `items`（使用責任者）
- `categories` はカテゴリマスタ（現状は `items.category` 文字列とアプリ側ロジックで連携、DB外部キーは未設定）

## categories

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| id | Integer | No | PK, Index | カテゴリID |
| name | String | No | Unique, Index | カテゴリ名 |
| sort_order | Integer | No | Default: 0 | 表示順 |
| is_active | Boolean | No | Default: true | 有効フラグ |

## groups

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| id | Integer | No | PK, Index | 団ID |
| name | String | No | Unique, Index | 団名 |
| description | String | Yes |  | 団の説明 |

## leaders

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| id | Integer | No | PK, Index | 指導者ID |
| name | String | No | Index | 名前 |
| group_id | Integer | No | FK -> groups.id | 所属団ID |
| role | String | Yes |  | 役務 |
| gender | String | Yes |  | 性別 |
| phone | String | Yes |  | 電話番号 |
| email | String | Yes |  | メール |
| is_deleted | Boolean | No | Default: false | 論理削除フラグ |

## scouts

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| id | Integer | No | PK, Index | スカウトID |
| name | String | No | Index | 名前 |
| name_kana | String | Yes |  | ふりがな |
| group_id | Integer | No | FK -> groups.id | 所属団ID |
| grade | String | Yes |  | 学年 |
| rank | String | Yes |  | 級（進級） |
| gender | String | Yes |  | 性別 |
| patrol | String | Yes |  | 班名 |
| is_deleted | Boolean | No | Default: false | 論理削除フラグ |

## items

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| id | Integer | No | PK, Index | 備品ID |
| name | String | No | Index | 備品名 |
| category | String | No |  | カテゴリ名（現状文字列管理） |
| status | String | No |  | 状態（保管中/貸出中/要メンテ） |
| quantity | Integer | No | Default: 1 | 数量 |
| bring_to_jamboree | Boolean | No | Default: false | ジャンボリー持参フラグ |
| location | String | No |  | 保管場所 |
| owner_group_id | Integer | No | FK -> groups.id | 所有団ID |
| approved_leader_id | Integer | Yes | FK -> leaders.id | 承認指導者ID |
| responsible_scout_id | Integer | Yes | FK -> scouts.id | 使用責任スカウトID |
| note | String | Yes |  | 備考 |

## alembic_version

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| version_num | String | No | PK | 適用中リビジョン |

## 参照元

- モデル定義: [backend/app/models.py](../backend/app/models.py)
- スキーマ定義: [backend/app/schemas.py](../backend/app/schemas.py)
- マイグレーション: [backend/alembic/versions](../backend/alembic/versions)
