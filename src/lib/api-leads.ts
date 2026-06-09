import { api } from './api';

export interface Lead {
  id: string;
  title: string;
  status: string;
  budget: number | null;
  city: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  broker_name: string | null;
  created_at: string;
  updated_at: string;
  last_edited: string;
}

export interface LeadsListResponse {
  items: Lead[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
  };
}

export interface GetLeadsParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string[];
  date_from?: string;
  date_to?: string;
  sort_dir?: 'asc' | 'desc';
  partner_id?: string;
}

export interface LeadBoardColumn {
  id: string;
  name: string;
  count: number;
  items: Lead[];
}

export interface LeadBoardPipeline {
  id: string;
  name: string;
  sort: number;
  columns: LeadBoardColumn[];
}

export interface LeadBoardResponse {
  pipelines: LeadBoardPipeline[];
  unassigned: {
    count: number;
    items: Lead[];
  };
  meta: {
    total_cards: number;
    board_limit: number;
    pipelines_source: string;
    updated_at: string;
  };
}

export interface GetLeadBoardParams extends GetLeadsParams {
  board_limit?: number;
  pipeline_id?: string;
}

export interface LeadHistoryItem {
  from_status: string | null;
  from_status_name: string | null;
  to_status: string;
  to_status_name: string | null;
  changed_at: string;
  changed_by: string | null;
}

export interface LeadHistoryResponse {
  items: LeadHistoryItem[];
}

export interface LeadDetail extends Lead {
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
  custom_fields: any;
}

export const leadsApi = {
  getLeads: async (params: GetLeadsParams): Promise<LeadsListResponse> => {
    const { data } = await api.get('/leads', { params });
    return data;
  },
  
  getLeadsBoard: async (params: GetLeadBoardParams): Promise<LeadBoardResponse> => {
    const { data } = await api.get('/leads/board', { params });
    return data;
  },
  
  getLeadById: async (id: string, partnerId?: string): Promise<LeadDetail> => {
    const params = partnerId ? { partner_id: partnerId } : undefined;
    const { data } = await api.get(`/leads/${id}`, { params });
    return data;
  },
  
  getLeadHistory: async (id: string, partnerId?: string): Promise<LeadHistoryResponse> => {
    const params = partnerId ? { partner_id: partnerId } : undefined;
    const { data } = await api.get(`/leads/${id}/history`, { params });
    return data;
  },

  getLeadNotes: async (id: string): Promise<any[]> => {
    const { data } = await api.get(`/leads/${id}/notes`);
    return data;
  },

  addLeadNote: async (id: string, text: string): Promise<{ success: boolean }> => {
    const { data } = await api.post(`/leads/${id}/notes`, { text });
    return data;
  },

  createLead: async (payload: { name: string, phone?: string, email?: string, budget?: number, city?: string, comment?: string }): Promise<{ success: boolean, externalLeadId: number }> => {
    const { data } = await api.post('/leads', payload);
    return data;
  },

  getPipelines: async (): Promise<{ items: any[] }> => {
    const { data } = await api.get('/amo-crm/pipelines');
    return data;
  }
};
