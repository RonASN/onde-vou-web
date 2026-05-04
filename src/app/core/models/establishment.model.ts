export interface Establishment {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  latitude: number;
  longitude: number;
}

export interface CriarEstabelecimentoRequest {
  nome: string;
  descricao: string;
  categoria: string;
  latitude: number;
  longitude: number;
}

export interface EstabelecimentoFiltro {
  nome?: string;
  categoria?: string;
  page?: number;
  pageSize?: number;
}

export interface GeoFeatureProperties {
  id: number;
  nome: string;
  categoria: string;
  descricao: string;
}

export interface GeoFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] }; // [lng, lat]
  properties: GeoFeatureProperties;
}

export interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}
