"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Item } from "@/types/item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_BASE_URL } from "@/lib/admin-auth";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (statusFilter !== "all") params.append("status", statusFilter);

        const url = `${API_BASE_URL}/api/items${params.toString() ? `?${params.toString()}` : ""}`;
        const response = await fetch(url);
        if (!response.ok) {
          setItems([]);
          return;
        }

        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [searchQuery, statusFilter]);

  const getPhotoUrl = (path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${API_BASE_URL}${path}`;
  };

  const stats = {
    total: items.length,
    available: items.filter((item) => item.status === "保管中").length,
    borrowed: items.filter((item) => item.status === "貸出中").length,
    maintenance: items.filter((item) => item.status === "要メンテ").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-10">
      <div className="mb-8">
        <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">Jumbory 備品管理</h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/usage">
              <Button variant="outline">使用方法</Button>
            </Link>
            <Link href="/leaders">
              <Button variant="outline">指導者一覧</Button>
            </Link>
            <Link href="/scouts">
              <Button variant="outline">スカウト一覧</Button>
            </Link>
            <Link href="/admin">
              <Button>管理者画面</Button>
            </Link>
          </div>
        </div>
        <p className="text-muted-foreground">
          公開画面は閲覧専用です。編集と削除は管理者画面から行ってください。
        </p>
      </div>

      <Card className="mb-8 border-blue-200 bg-blue-50/60">
        <CardHeader>
          <CardTitle>管理者向け</CardTitle>
          <CardDescription>
            変更作業はパスワード認証後の管理者画面でのみ可能です。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/items">
            <Button>備品の管理を開く</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
              総備品数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold sm:text-3xl">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
              保管中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600 sm:text-3xl">
              {stats.available}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
              貸出中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600 sm:text-3xl">
              {stats.borrowed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
              要メンテ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600 sm:text-3xl">
              {stats.maintenance}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>検索・フィルタ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="min-w-0 flex-1">
              <Input
                placeholder="備品名またはカテゴリで検索..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="保管中">保管中</SelectItem>
                <SelectItem value="貸出中">貸出中</SelectItem>
                <SelectItem value="要メンテ">要メンテ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>備品一覧</CardTitle>
          <CardDescription>
            {searchQuery || statusFilter !== "all"
              ? `検索結果: ${items.length}件`
              : `登録されている備品: ${items.length}件`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>備品名</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>持参</TableHead>
                <TableHead>所有団</TableHead>
                <TableHead>保管場所</TableHead>
                <TableHead>写真</TableHead>
                <TableHead>備考</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    該当する備品が見つかりませんでした
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.bring_to_jamboree ? "持っていく" : "持っていかない"}</TableCell>
                    <TableCell>{item.group?.name || "-"}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      {item.image_url ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewPhoto({
                              url: getPhotoUrl(item.image_url as string),
                              name: item.name,
                            })
                          }
                          className="block cursor-pointer"
                        >
                          <img
                            src={getPhotoUrl(item.image_url)}
                            alt={`${item.name}の写真`}
                            className="h-14 w-14 rounded-md border object-cover transition-opacity hover:opacity-80"
                          />
                        </button>
                      ) : (
                        <span className="text-sm text-muted-foreground">未登録</span>
                      )}
                    </TableCell>
                    <TableCell>{item.note || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {previewPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <Button
              type="button"
              variant="outline"
              className="absolute right-3 top-3 z-10 bg-background/90"
              onClick={() => setPreviewPhoto(null)}
            >
              閉じる
            </Button>
            <img
              src={previewPhoto.url}
              alt={`${previewPhoto.name}の拡大写真`}
              className="max-h-[85vh] w-full rounded-lg bg-white object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
