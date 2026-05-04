import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CriarEstabelecimentoRequest,
  EstabelecimentoFiltro,
  Establishment,
  GeoFeatureCollection,
} from '../models/establishment.model';

@Injectable({ providedIn: 'root' })
export class EstablishmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/Estabelecimento`;

  getGeo(): Observable<GeoFeatureCollection> {
    return this.http.get<GeoFeatureCollection>(`${this.base}/geo`);
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
