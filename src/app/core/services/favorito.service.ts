import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdicionarFavoritoRequest, Favorito } from '../models/favorito.model';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/favoritos`;

  meus(): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(`${this.base}/meus`);
  }

  adicionar(dto: AdicionarFavoritoRequest): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(this.base, dto);
  }

  remover(estabelecimentoId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${estabelecimentoId}`);
  }
}
