export interface Avaliacao {
  id: number;
  nota: number;
  comentario: string;
  dataCriacao: string;
  usuarioId: number;
  usuarioNome: string;
  estabelecimentoId: number;
}

export interface MinhaAvaliacao {
  id: number;
  estabelecimentoId: number;
  estabelecimentoNome: string;
  categoria: string;
  nota: number;
  comentario: string;
  dataCriacao: string;
}

export interface CriarAvaliacaoRequest {
  nota: number;
  comentario: string;
  estabelecimentoId: number;
}

export interface ResumoAvaliacoes {
  estabelecimentoId: number;
  mediaNotas: number;
  quantidadeAvaliacoes: number;
}
