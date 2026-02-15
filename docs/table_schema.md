# テーブル設計（Database Schema）

このドキュメントはバックエンドのSQLAlchemyモデルに基づくテーブル設計の概要です。

## ER概要

- `groups`（団） 1 : N `items`（備品）
- `groups`（団） 1 : N `leaders`（指導者）
- `groups`（団） 1 : N `scouts`（スカウト）
- `leaders`（指導者） 1 : N `items`（承認者）
- `scouts`（スカウト） 1 : N `items`（使用責任者）

## groups

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| id | Integer | No | PK | 団ID |
| name | String | No | Unique, Index | 団名 |
| description | String | Yes |  | 団の説明 |

## leaders

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| id | Integer | No | PK | 指導者ID |
| name | String | No | Index | 名前 |
| group_id | Integer | No | FK -> groups.id | 所属団ID |
| role | String | Yes |  | 役務 |
| gender | String | Yes |  | 性別 |
| phone | String | Yes |  | 電話番号 |
| email | String | Yes |  | メール |

## scouts

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| id | Integer | No | PK | スカウトID |
| name | String | No | Index | 名前 |
| name_kana | String | Yes |  | ふりがな |
| group_id | Integer | No | FK -> groups.id | 所属団ID |
| grade | String | Yes |  | 学年 |
| rank | String | Yes |  | 級（進級） |
| gender | String | Yes |  | 性別 |
| patrol | String | Yes |  | 班名 |

## items

| Column | Type | Nullable | Constraints | Description |
|---|---|---|---|---|
| id | Integer | No | PK | 備品ID |
| name | String | No | Index | 備品名 |
| category | String | No |  | カテゴリ |
| status | String | No |  | 状態（保管中/貸出中/要メンテ） |
| location | String | No |  | 保管場所 |
| owner_group_id | Integer | No | FK -> groups.id | 所有団ID |
| approved_leader_id | Integer | Yes | FK -> leaders.id | 承認指導者ID |
| responsible_scout_id | Integer | Yes | FK -> scouts.id | 使用責任スカウトID |
| note | String | Yes |  | 備考 |

## 参照元

- モデル定義: [backend/app/models.py](../backend/app/models.py)
- DB初期化: [backend/app/database.py](../backend/app/database.py)
