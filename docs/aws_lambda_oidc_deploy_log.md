# AWS Lambda + GitHub Actions (OIDC) 作業ログ

最終更新: 2026-02-21
対象リポジトリ: `yoshikazuito1976/jumbory-item-manager`

## 1. 全体構成概要

- デプロイ経路は `GitHub Actions -> OIDC -> IAM Role AssumeRole -> Lambda update-function-code`。
- `main` ブランチへの push をトリガーに、`.github/workflows/deploy-lambda.yml` が Lambda のコードを更新する。
- ロールは分離して運用する。
  - **デプロイロール**: GitHub Actions が Assume してデプロイ操作を行う。
  - **実行ロール**: Lambda 関数が実行時に使用する。
- この構成により、GitHub Secrets へ長期 AWS Access Key を保持しない。

## 2. 使用している AWS リソース

- OIDC Provider
  - `token.actions.githubusercontent.com`
- IAM Role（デプロイ用）
  - `GitHubActions-JumboryItemManager-LambdaDeployRole`
- IAM Role（Lambda 実行用）
  - `jumbory-item-manager-lambda-exec-role`
- Lambda Function
  - 関数名: `jumbory-item-manager`
  - Runtime: `Python 3.12`
  - Handler: `handler.handler`
  - Region: `ap-northeast-1`

## 3. IAM 設計方針

- 信頼ポリシーは `repo` と `main` ブランチに厳密に制限。
  - `sub = repo:yoshikazuito1976/jumbory-item-manager:ref:refs/heads/main`
  - `aud = sts.amazonaws.com`
- デプロイ用ロールの権限は最小化。
  - `lambda:UpdateFunctionCode`
  - `lambda:GetFunction`
- Lambda 実行ロールは `AWSLambdaBasicExecutionRole` のみ（CloudWatch Logs 出力用途）。

## 4. Lambda 作成手順（CLIベース・要点）

### 4.1 実行ロール作成

- 信頼エンティティを `lambda.amazonaws.com` として実行ロールを作成。
- 管理ポリシー `AWSLambdaBasicExecutionRole` をアタッチ。

### 4.2 初期コードを zip 化

- 最低限 `handler.py` を zip に含める（初期作成時のダミーで可）。
- 本番運用は `backend` 同梱 ZIP を GitHub Actions で生成して更新。

### 4.3 関数作成

- `aws lambda create-function` で以下を指定。
  - `--function-name jumbory-item-manager`
  - `--runtime python3.12`
  - `--handler handler.handler`
  - `--role <jumbory-item-manager-lambda-exec-role ARN>`
  - `--zip-file fileb://<zip file>`

### 4.4 動作確認

- `aws lambda invoke` で疎通確認し、レスポンスと CloudWatch Logs を確認。

## 5. GitHub Actions 側の前提

- OIDC 利用のため、Workflow に `permissions: id-token: write` が必須。
- 使用 Secrets は以下。
  - `AWS_IAM_ROLE_ARN`
  - `AWS_REGION`
  - `AWS_LAMBDA_FUNCTION_NAME`
- デプロイ方式は「`backend` を含む ZIP を Actions 側で生成して Lambda へ反映」。
  - `handler.py` は ZIP 直下に配置。
  - `backend/main.py` と `backend/app` を ZIP に同梱。

## 6. 注意点・ハマりどころ

- Lambda 自体は GitHub を監視しない。自動反映は Workflow トリガー設定に依存。
- ZIP 内配置が崩れると `handler` 解決に失敗するため、`handler.py` は直下を維持。
- 実行ロールとデプロイロールの責務を混同しない（権限漏れ・過剰権限の原因）。
- IAM は常に最小権限を維持し、必要時のみ明示的に権限追加する。

## 付記: 現在のリポジトリ側実装

- Workflow: `.github/workflows/deploy-lambda.yml`
- Lambda エントリ: `lambda/handler.py`
- 補足ドキュメント: `lambda/README.md`
