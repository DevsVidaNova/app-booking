export type User = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
  updated_at?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  phone: string;
  role: string;
  user_id: string;
  email: string;
};

export type CreateUserInput = {
  name: string;
  phone: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
};

export type UpdateUserInput = {
  userId: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: 'user' | 'admin';
};

export type ResetPasswordInput = {
  userId: string;
  defaultPassword?: string;
};
