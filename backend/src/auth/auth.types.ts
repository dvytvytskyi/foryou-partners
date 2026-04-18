export interface JwtPayload {
  sub: string;
  role: 'partner_user' | 'admin';
  partnerId: string | null;
  email: string;
}

export interface AuthenticatedUser {
  id: string;
  role: 'partner_user' | 'admin';
  partnerId: string | null;
  email: string;
}
