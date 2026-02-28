"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Category, Item, ItemCreate, Group } from "@/types/item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Item>>({});
  const [formData, setFormData] = useState<ItemCreate>({
    name: "",
    category: "",
    status: "保管中",
    quantity: 1,
    bring_to_jamboree: false,
    location: "",
    owner_group_id: 0,
    note: "",
  });

  // 初回ロード時に備品一覧と団一覧を取得
  useEffect(() => {
    fetchItems();
    fetchGroups();
    fetchCategories();
  }, [searchQuery, statusFilter]);

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const url = `${API_BASE_URL}/api/items${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups`);
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      alert("カテゴリを選択してください");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // フォームをリセット
        setFormData({
          name: "",
          category: "",
          status: "保管中",
          quantity: 1,
          bring_to_jamboree: false,
          location: "",
          owner_group_id: 0,
          note: "",
        });
        // 一覧を再取得
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setEditData({
      category: item.category,
      status: item.status,
      quantity: item.quantity,
      bring_to_jamboree: item.bring_to_jamboree,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (itemId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        setEditingId(null);
        setEditData({});
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  // 統計情報を計算
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
    <div className="container mx-auto py-8 px-4 md:py-10">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Jumbory 備品管理</h1>
          <div className="flex gap-2 flex-wrap">
            <Link href="/leaders">
              <Button variant="outline">指導者管理</Button>
            </Link>
            <Link href="/scouts">
              <Button variant="outline">スカウト管理</Button>
            </Link>
          </div>
        </div>
        <p className="text-muted-foreground">
          備品の登録・管理・検索を一元管理できるダッシュボード
        </p>
      </div>

      {/* 統計情報ダッシュボード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              総備品数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              保管中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-3xl font-bold text-green-600">
              {stats.available}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              貸出中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-3xl font-bold text-blue-600">
              {stats.borrowed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              要メンテ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-3xl font-bold text-red-600">
              {stats.maintenance}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 検索・フィルタ */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>検索・フィルタ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <Input
                placeholder="備品名またはカテゴリで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* 新規登録フォーム */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>新しい備品を登録</CardTitle>
          <CardDescription>備品情報を入力して登録してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">備品名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">カテゴリ</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">ステータス</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="保管中">保管中</option>
                  <option value="貸出中">貸出中</option>
                  <option value="要メンテ">要メンテ</option>
                </select>
              </div>
              <div>
                <Label htmlFor="quantity">数量</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="bring_to_jamboree">ジャンボリー持参</Label>
                <select
                  id="bring_to_jamboree"
                  value={formData.bring_to_jamboree ? "yes" : "no"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bring_to_jamboree: e.target.value === "yes",
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="no">持っていかない</option>
                  <option value="yes">持っていく</option>
                </select>
              </div>
              <div>
                <Label htmlFor="location">保管場所</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="owner_group_id">所有団</Label>
                <Select
                  value={formData.owner_group_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, owner_group_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="団を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="note">備考</Label>
              <Input
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
              />
            </div>
            <Button type="submit">登録</Button>
          </form>
        </CardContent>
      </Card>

      {/* 備品一覧 */}
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
                <TableHead>ステータス</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>持参</TableHead>
                <TableHead>所有団</TableHead>
                <TableHead>保管場所</TableHead>
                <TableHead>備考</TableHead>
                <TableHead>操作</TableHead>
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
                    <TableCell>
                      {editingId === item.id ? (
                        <Select
                          value={(editData.category as string) ?? item.category}
                          onValueChange={(value) =>
                            setEditData({
                              ...editData,
                              category: value,
                            })
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        item.category
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <select
                          value={editData.status ?? item.status}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              status: e.target.value,
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        >
                          <option value="保管中">保管中</option>
                          <option value="貸出中">貸出中</option>
                          <option value="要メンテ">要メンテ</option>
                        </select>
                      ) : (
                        <Badge
                          variant={
                            item.status === "保管中"
                              ? "default"
                              : item.status === "貸出中"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          min={1}
                          value={editData.quantity ?? item.quantity}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              quantity: Number(e.target.value),
                            })
                          }
                          className="w-20"
                        />
                      ) : (
                        item.quantity
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <select
                          value={
                            (editData.bring_to_jamboree ??
                              item.bring_to_jamboree)
                              ? "yes"
                              : "no"
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              bring_to_jamboree: e.target.value === "yes",
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        >
                          <option value="no">持っていかない</option>
                          <option value="yes">持っていく</option>
                        </select>
                      ) : item.bring_to_jamboree ? (
                        "持っていく"
                      ) : (
                        "持っていかない"
                      )}
                    </TableCell>
                    <TableCell className="w-32">{item.group?.name || "-"}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.note || "-"}</TableCell>
                    <TableCell>
                      {editingId === item.id ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(item.id)}
                          >
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            キャンセル
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(item)}>
                            編集
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            削除
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
