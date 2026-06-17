import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CriarEstabelecimentoRequest,
  EstabelecimentoDetalhe,
  EstabelecimentoFiltro,
  EstabelecimentoProximo,
  Establishment,
  FeedFiltro,
  FeedPaginado,
  GeoFeatureCollection,
} from '../models/establishment.model';

@Injectable({ providedIn: 'root' })
export class EstablishmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/Estabelecimento`;

  getGeo(): Observable<GeoFeatureCollection> {
    return this.http.get<GeoFeatureCollection>(`${this.base}/geojson`);
  }

  feed(filtro: FeedFiltro = {}): Observable<FeedPaginado> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('Nome', filtro.nome);
    if (filtro.categoria) params = params.set('Categoria', filtro.categoria);
    if (filtro.page != null) params = params.set('Page', String(filtro.page));
    if (filtro.pageSize != null) params = params.set('PageSize', String(filtro.pageSize));
    if (filtro.ordenarPor) params = params.set('OrdenarPor', filtro.ordenarPor);
    return this.http.get<FeedPaginado>(`${this.base}/feed`, { params });
  }

  proximos(latitude: number, longitude: number, raioKm = 5): Observable<EstabelecimentoProximo[]> {
    const params = new HttpParams()
      .set('latitude', String(latitude))
      .set('longitude', String(longitude))
      .set('raioKm', String(raioKm));
    return this.http.get<EstabelecimentoProximo[]>(`${this.base}/proximos`, { params });
  }

  getDetalhes(id: number): Observable<EstabelecimentoDetalhe> {
    return this.http.get<EstabelecimentoDetalhe>(`${this.base}/${id}/detalhes`);
  }

  list(filtro: EstabelecimentoFiltro = {}): Observable<Establishment[]> {
    let params = new HttpParams();
    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.categoria) params = params.set('categoria', filtro.categoria);
    if (filtro.page != null) params = params.set('page', String(filtro.page));
    if (filtro.pageSize != null) params = params.set('pageSize', String(filtro.pageSize));
    return this.http.get<Establishment[]>(this.base, { params });
  }

  getById(id: number): Observable<Establishment> {
    return this.http.get<Establishment>(`${this.base}/${id}`);
  }

  getByUsuario(usuarioId: number): Observable<Establishment[]> {
    return this.http.get<Establishment[]>(`${this.base}/usuario/${usuarioId}`);
  }

  create(dto: CriarEstabelecimentoRequest): Observable<Establishment> {
    return this.http.post<Establishment>(this.base, dto);
  }
}
