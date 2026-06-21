export interface UserRecord {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  orientation: string;
  interests: string[];
  bio: string | null;
  verification_status: string;
  phone_verified: boolean;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface EventRecord {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  city: string | null;
  start_time: Date;
  end_time: Date;
  price_cents: number;
  capacity: number | null;
  created_by: string | null;
  created_at: Date;
}

export interface JwtPayload {
  sub: string; // user id
  phone: string;
  is_admin: boolean;
}

export interface AuthedUser {
  id: string;
  phone: string;
  is_admin: boolean;
}
