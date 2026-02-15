export interface Leader {
  id: number;
  name: string;
  group_id: number;
  role: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  is_deleted: boolean;
}

export interface LeaderCreate {
  name: string;
  group_id: number;
  role?: string;
  gender?: string;
  phone?: string;
  email?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
}
