export interface Favorito {
  estabelecimentoId: number;
  nome: string;
  categoria: string;
  descricao: string;
  latitude: number;
  longitude: number;
  dataCriacao: string;
}

export interface AdicionarFavoritoRequest {
  estabelecimentoId: number;
}
