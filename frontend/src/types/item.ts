export interface Group {
  id: number;
  name: string;
  description: string | null;
}

export interface Category {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface Item {
  id: number;
  name: string;
  category: string;
  status: string;
  quantity: number;
  bring_to_jamboree: boolean;
  location: string;
  owner_group_id: number;
  approved_leader_id: number | null;
  responsible_scout_id: number | null;
  note: string | null;
  group: Group;
}

export interface ItemCreate {
  name: string;
  category: string;
  status: string;
  quantity: number;
  bring_to_jamboree: boolean;
  location: string;
  owner_group_id: number;
  note?: string;
}
