export interface User {
  id: number;
  username: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
