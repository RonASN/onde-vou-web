import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Avaliacao, CriarAvaliacaoRequest, ResumoAvaliacoes } from '../models/avaliacao.model';

@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/avaliacoes`;

  criar(dto: CriarAvaliacaoRequest): Observable<Avaliacao> {
    return this.http.post<Avaliacao>(this.base, dto);
  }

  porEstabelecimento(estabelecimentoId: number): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.base}/estabelecimento/${estabelecimentoId}`);
  }

  resumo(estabelecimentoId: number): Observable<ResumoAvaliacoes> {
    return this.http.get<ResumoAvaliacoes>(`${this.base}/estabelecimento/${estabelecimentoId}/resumo`);
  }

  minhas(): Observable<Avaliacao[]> {
    return this.http.get<Avaliacao[]>(`${this.base}/minhas`);
  }
}
