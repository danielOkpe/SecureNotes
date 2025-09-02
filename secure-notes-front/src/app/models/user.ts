export interface User {
  id?: number;
  name?: string;
  email: string;
  is_email_verified: boolean;
  created_at: Date;
  updated_at?: Date;
}