"use client";

import { useEffect, useState } from "react";
import { Category, Group, Item, ItemCreate } from "@/types/item";
import { AdminGate } from "@/components/admin-gate";
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
import {
  API_BASE_URL,
  buildAdminHeaders,
  getApiErrorMessage,
} from "@/lib/admin-auth";

const PHOTO_MAX_SIZE_MB = 1;
const PHOTO_MAX_SIZE_BYTES = PHOTO_MAX_SIZE_MB * 1024 * 1024;

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Item>>({});
  const [newItemPhoto, setNewItemPhoto] = useState<File | null>(null);
  const [rowPhotoFiles, setRowPhotoFiles] = useState<Record<number, File | null>>({});
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; name: string } | null>(null);
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

  useEffect(() => {
    const loadItems = async () => {
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

    void loadItems();
  }, [refreshKey, searchQuery, statusFilter]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [groupsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/groups`),
          fetch(`${API_BASE_URL}/api/categories`),
        ]);

        const groupsData = groupsResponse.ok ? await groupsResponse.json() : [];
        const categoriesData = categoriesResponse.ok
          ? await categoriesResponse.json()
          : [];

        setGroups(Array.isArray(groupsData) ? groupsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
        setGroups([]);
        setCategories([]);
      }
    };

    void loadMeta();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.category) {
      alert("カテゴリを選択してください");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: "POST",
        headers: buildAdminHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        alert(await getApiErrorMessage(response, "備品の登録に失敗しました"));
        return;
      }

      const createdItem = await response.json();
      if (newItemPhoto) {
        await uploadItemPhoto(createdItem.id, newItemPhoto);
      }

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
      setNewItemPhoto(null);
      setRefreshKey((prev) => prev + 1);
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
        headers: buildAdminHeaders(),
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        alert(await getApiErrorMessage(response, "備品の更新に失敗しました"));
        return;
      }

      setEditingId(null);
      setEditData({});
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: "DELETE",
        headers: buildAdminHeaders({ includeContentType: false }),
      });

      if (!response.ok) {
        alert(await getApiErrorMessage(response, "備品の削除に失敗しました"));
        return;
      }

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const getPhotoUrl = (path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${API_BASE_URL}${path}`;
  };

  const openPhotoPreview = (item: Item) => {
    if (!item.image_url) {
      return;
    }

    setPreviewPhoto({
      url: getPhotoUrl(item.image_url),
      name: item.name,
    });
  };

  const uploadItemPhoto = async (itemId: number, file: File) => {
    if (file.size > PHOTO_MAX_SIZE_BYTES) {
      alert(`画像サイズは${PHOTO_MAX_SIZE_MB}MB以下にしてください`);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/items/${itemId}/photo`, {
      method: "POST",
      headers: buildAdminHeaders({ includeContentType: false }),
      body: formData,
    });

    if (!response.ok) {
      alert(await getApiErrorMessage(response, "画像アップロードに失敗しました"));
      return;
    }

    setRowPhotoFiles((prev) => ({ ...prev, [itemId]: null }));
    setRefreshKey((prev) => prev + 1);
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
    <AdminGate
      title="備品管理者画面"
      description="備品の登録、編集、削除はこの管理画面から行います。"
    >
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">備品管理</h1>
        <p className="text-muted-foreground">
          公開画面は閲覧専用です。この画面では登録、編集、削除、写真更新ができます。
        </p>
      </div>

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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>新しい備品を登録</CardTitle>
          <CardDescription>備品情報を入力して登録してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">備品名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
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
                  onChange={(event) =>
                    setFormData({ ...formData, status: event.target.value })
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
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      quantity: Number(event.target.value),
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
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      bring_to_jamboree: event.target.value === "yes",
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
                  onChange={(event) =>
                    setFormData({ ...formData, location: event.target.value })
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
              <Label htmlFor="item_photo">備品写真（任意、{PHOTO_MAX_SIZE_MB}MBまで）</Label>
              <Input
                id="item_photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setNewItemPhoto(file);
                }}
              />
            </div>
            <div>
              <Label htmlFor="note">備考</Label>
              <Input
                id="note"
                value={formData.note}
                onChange={(event) =>
                  setFormData({ ...formData, note: event.target.value })
                }
              />
            </div>
            <Button type="submit">登録</Button>
          </form>
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
                <TableHead>数量</TableHead>
                <TableHead>持参</TableHead>
                <TableHead>所有団</TableHead>
                <TableHead>保管場所</TableHead>
                <TableHead>写真</TableHead>
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
                        <Input
                          type="number"
                          min={1}
                          value={editData.quantity ?? item.quantity}
                          onChange={(event) =>
                            setEditData({
                              ...editData,
                              quantity: Number(event.target.value),
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
                            (editData.bring_to_jamboree ?? item.bring_to_jamboree)
                              ? "yes"
                              : "no"
                          }
                          onChange={(event) =>
                            setEditData({
                              ...editData,
                              bring_to_jamboree: event.target.value === "yes",
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
                    <TableCell>
                      {editingId === item.id ? (
                        <div className="min-w-[160px] space-y-2">
                          {item.image_url ? (
                            <button
                              type="button"
                              className="w-fit cursor-pointer"
                              onClick={() => openPhotoPreview(item)}
                            >
                              <img
                                src={getPhotoUrl(item.image_url)}
                                alt={`${item.name}の写真`}
                                className="h-14 w-14 rounded-md border object-cover transition-opacity hover:opacity-80"
                              />
                            </button>
                          ) : null}
                          <Input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(event) => {
                              const file = event.target.files?.[0] ?? null;
                              setRowPhotoFiles((prev) => ({ ...prev, [item.id]: file }));
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const file = rowPhotoFiles[item.id];
                              if (!file) {
                                alert("画像ファイルを選択してください");
                                return;
                              }
                              uploadItemPhoto(item.id, file);
                            }}
                          >
                            写真アップロード
                          </Button>
                        </div>
                      ) : item.image_url ? (
                        <button
                          type="button"
                          onClick={() => openPhotoPreview(item)}
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
                    <TableCell>
                      {editingId === item.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(item.id)}>
                            保存
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
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
    </AdminGate>
  );
}