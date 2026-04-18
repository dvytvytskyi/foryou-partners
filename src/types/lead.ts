export interface BoardLeadCard {
  id: string;
  title: string;
  status: string;
  budget: number | null;
  city: string | null;
  contact_name: string | null;
  broker_name: string | null;
  updated_at: string;
}

export interface BoardColumn {
  id: string;
  name: string;
  sort: number;
  count?: number;
  color?: string;
  items?: BoardLeadCard[];
  leads?: BoardLeadCard[];
}

export interface Pipeline {
  id: string;
  name: string;
  sort: number;
  columns: BoardColumn[];
}

export interface BoardResponse {
  pipelines: Pipeline[];
  unassigned?: {
    count: number;
    items: BoardLeadCard[];
  };
}

export interface LeadDetail {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  budget: number | null;
  city: string | null;
  comment: string | null;
  contact: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  broker: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  tags: string[];
  source: string | null;
}

export interface LeadHistoryItem {
  from_status: string | null;
  to_status: string;
  changed_at: string;
  changed_by: string | null;
}

export interface LeadHistoryResponse {
  items: LeadHistoryItem[];
}
