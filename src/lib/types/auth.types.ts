export type UserRole = 'partner_user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  partner_id: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    request_id: string;
  };
}
