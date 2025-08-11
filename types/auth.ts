export type UserRole = 'admin' | 'funcionario' | 'paciente' | 'investigador' | 'tecnologo';

export interface User {
  id: string;
  nombre: string;
  role: UserRole;
  token?: string;
}
