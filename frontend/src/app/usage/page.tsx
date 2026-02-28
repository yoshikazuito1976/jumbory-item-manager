import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const USAGE_GUIDE_URL =
  "https://github.com/yoshikazuito1976/jumbory-item-manager/blob/main/docs/usage_guide.md";

export default function UsagePage() {
  return (
    <div className="container mx-auto py-8 px-4 md:py-10">
      <div className="mb-6 flex gap-2 flex-wrap">
        <Link href="/">
          <Button variant="outline">← 備品管理に戻る</Button>
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">使用方法</h1>

      <Card>
        <CardHeader>
          <CardTitle>基本的な使い方</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm sm:text-base">
          <section>
            <h2 className="font-semibold mb-2">1. 備品を登録する</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>トップページの「新しい備品を登録」を入力</li>
              <li>カテゴリをプルダウンから選択</li>
              <li>「登録」を押して保存</li>
            </ol>
          </section>

          <section>
            <h2 className="font-semibold mb-2">2. 備品を検索・更新する</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>検索欄に備品名またはカテゴリを入力</li>
              <li>必要ならステータスフィルタを選択</li>
              <li>一覧の「編集」からカテゴリ・数量・ステータスを更新</li>
            </ol>
          </section>

          <section>
            <h2 className="font-semibold mb-2">3. 管理ページを使う</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>指導者管理: 指導者の登録・編集・削除・復元</li>
              <li>スカウト管理: スカウトの登録・編集・削除・復元・CSV取込</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold mb-2">4. 補足</h2>
            <p>
              詳細ドキュメントは
              <a
                href={USAGE_GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                docs/usage_guide.md
              </a>
              を参照してください。
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
