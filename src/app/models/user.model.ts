export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'admin';
  createdAt?: Date;
}
