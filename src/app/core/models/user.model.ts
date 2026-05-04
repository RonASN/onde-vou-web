export enum TipoUsuario {
  Comum = 1,
  Empresa = 2,
}

export interface User {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: TipoUsuario;
  tipoUsuarioDescricao: string;
  dataCriacao: string;
}
