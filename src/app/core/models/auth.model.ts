import { TipoUsuario } from './user.model';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  tipoUsuario: TipoUsuario;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
}
