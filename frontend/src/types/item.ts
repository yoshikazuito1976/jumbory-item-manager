export interface Item {
  id: number;
  name: string;
  category: string;
  status: string;
  location: string;
  note: string | null;
}

export interface ItemCreate {
  name: string;
  category: string;
  status: string;
  location: string;
  note?: string;
}
