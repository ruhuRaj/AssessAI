export interface User {
  id: string;
  name: string;
  email: string;
  schoolName?: string;
  profileImageUrl?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
