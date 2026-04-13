"use client";

import { useEffect, useState } from "react";
import { Leader, LeaderCreate, Group } from "@/types/leader";
import { AdminGate } from "@/components/admin-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  API_BASE_URL,
  buildAdminHeaders,
  getApiErrorMessage,
} from "@/lib/admin-auth";

export default function AdminLeadersPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Leader>>({});
  const [formData, setFormData] = useState<LeaderCreate>({
    name: "",
    group_id: 0,
    role: "",
    gender: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const params = new URLSearchParams();
        if (includeDeleted) params.append("include_deleted", "true");
        const leadersUrl = `${API_BASE_URL}/api/leaders${params.toString() ? `?${params.toString()}` : ""}`;

        const [leadersResponse, groupsResponse] = await Promise.all([
          fetch(leadersUrl),
          fetch(`${API_BASE_URL}/api/groups`),
        ]);

        const leadersData = leadersResponse.ok ? await leadersResponse.json() : [];
        const groupsData = groupsResponse.ok ? await groupsResponse.json() : [];

        setLeaders(Array.isArray(leadersData) ? leadersData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (error) {
        console.error("指導者データの取得に失敗しました:", error);
      }
    };

    void loadData();
  }, [includeDeleted, refreshKey]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaders`, {
        method: "POST",
        headers: buildAdminHeaders(),
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        alert(await getApiErrorMessage(response, "指導者の登録に失敗しました"));
        return;
      }

      setFormData({
        name: "",
        group_id: 0,
        role: "",
        gender: "",
        phone: "",
        email: "",
      });
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("指導者の登録に失敗しました:", error);
    }
  };

  const filteredLeaders = leaders.filter((leader) => {
    const matchesSearch = leader.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup =
      groupFilter === "all" || leader.group_id === parseInt(groupFilter);
    return matchesSearch && matchesGroup;
  });

  const stats = {
    total: leaders.filter((leader) => !leader.is_deleted).length,
    byGroup: leaders
      .filter((leader) => !leader.is_deleted)
      .reduce((acc, leader) => {
        const group = groups.find((g) => g.id === leader.group_id);
        if (group) {
          acc[group.name] = (acc[group.name] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
  };

  const handleEdit = (leader: Leader) => {
    setEditingId(leader.id);
    setEditData(leader);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (leaderId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaders/${leaderId}`, {
        method: "PUT",
        headers: buildAdminHeaders(),
        body: JSON.stringify(editData),
      });
      if (!response.ok) {
        alert(await getApiErrorMessage(response, "指導者の更新に失敗しました"));
        return;
      }

      setEditingId(null);
      setEditData({});
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("指導者の更新に失敗しました:", error);
    }
  };

  const handleDelete = async (leaderId: number) => {
    if (!confirm("本当に削除しますか？")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/leaders/${leaderId}`, {
        method: "DELETE",
        headers: buildAdminHeaders({ includeContentType: false }),
      });
      if (!response.ok) {
        alert(await getApiErrorMessage(response, "指導者の削除に失敗しました"));
        return;
      }

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("指導者の削除に失敗しました:", error);
    }
  };

  const handleRestore = async (leaderId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaders/${leaderId}/restore`, {
        method: "POST",
        headers: buildAdminHeaders({ includeContentType: false }),
      });
      if (!response.ok) {
        alert(await getApiErrorMessage(response, "指導者の復元に失敗しました"));
        return;
      }

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("指導者の復元に失敗しました:", error);
    }
  };

  return (
    <AdminGate
      title="指導者管理者画面"
      description="指導者の編集や削除はこの管理画面から行います。"
    >
      <h1 className="mb-6 text-xl font-bold sm:text-2xl md:text-3xl">指導者管理</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>総指導者数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold sm:text-3xl">{stats.total}</p>
          </CardContent>
        </Card>
        {Object.entries(stats.byGroup).map(([groupName, count]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle>{groupName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold sm:text-3xl">{count}名</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>新規指導者登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">名前</Label>
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
                <Label htmlFor="group_id">所属団</Label>
                <Select
                  value={formData.group_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, group_id: parseInt(value) })
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
              <div>
                <Label htmlFor="role">役務</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(event) =>
                    setFormData({ ...formData, role: event.target.value })
                  }
                  placeholder="例: 団委員長, 隊長, 副長"
                />
              </div>
              <div>
                <Label htmlFor="gender">性別</Label>
                <Input
                  id="gender"
                  value={formData.gender}
                  onChange={(event) =>
                    setFormData({ ...formData, gender: event.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData({ ...formData, phone: event.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData({ ...formData, email: event.target.value })
                  }
                />
              </div>
            </div>
            <Button type="submit">登録</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>指導者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4">
            <Input
              placeholder="名前で検索..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="max-w-sm"
            />
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="団で絞込" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての団</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(event) => setIncludeDeleted(event.target.checked)}
              />
              削除済みを含める
            </label>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>名前</TableHead>
                <TableHead>所属団</TableHead>
                <TableHead>役務</TableHead>
                <TableHead>性別</TableHead>
                <TableHead>電話</TableHead>
                <TableHead>メール</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaders.map((leader) => {
                const group = groups.find((g) => g.id === leader.group_id);
                const isEditing = editingId === leader.id;
                const isDeleted = leader.is_deleted;
                return (
                  <TableRow key={leader.id}>
                    <TableCell>{leader.id}</TableCell>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          value={editData.name || ""}
                          onChange={(event) =>
                            setEditData({ ...editData, name: event.target.value })
                          }
                          className="w-32"
                        />
                      ) : (
                        leader.name
                      )}
                    </TableCell>
                    <TableCell className="w-32">
                      {isEditing ? (
                        <Select
                          value={(editData.group_id ?? leader.group_id).toString()}
                          onValueChange={(value) =>
                            setEditData({ ...editData, group_id: parseInt(value) })
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="団を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups.map((groupOption) => (
                              <SelectItem key={groupOption.id} value={groupOption.id.toString()}>
                                {groupOption.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        group?.name || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.role || ""}
                          onChange={(event) =>
                            setEditData({ ...editData, role: event.target.value })
                          }
                          className="w-32"
                        />
                      ) : (
                        leader.role || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.gender || ""}
                          onChange={(event) =>
                            setEditData({ ...editData, gender: event.target.value })
                          }
                          className="w-20"
                        />
                      ) : (
                        leader.gender || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.phone || ""}
                          onChange={(event) =>
                            setEditData({ ...editData, phone: event.target.value })
                          }
                          className="w-40"
                        />
                      ) : (
                        leader.phone || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.email || ""}
                          onChange={(event) =>
                            setEditData({ ...editData, email: event.target.value })
                          }
                          className="w-48"
                        />
                      ) : (
                        leader.email || "-"
                      )}
                    </TableCell>
                    <TableCell>{isDeleted ? "削除済み" : "有効"}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(leader.id)}>
                            保存
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            キャンセル
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {isDeleted ? (
                            <Button size="sm" variant="outline" onClick={() => handleRestore(leader.id)}>
                              復元
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" onClick={() => handleEdit(leader)}>
                                編集
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDelete(leader.id)}>
                                削除
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredLeaders.length === 0 ? (
            <p className="py-8 text-center text-gray-500">指導者が見つかりませんでした</p>
          ) : null}
        </CardContent>
      </Card>
    </AdminGate>
  );
}