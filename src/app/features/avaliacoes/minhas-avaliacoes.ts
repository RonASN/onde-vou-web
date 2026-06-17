import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AvaliacaoService } from '../../core/services/avaliacao.service';
import { Avaliacao } from '../../core/models/avaliacao.model';

@Component({
  selector: 'app-minhas-avaliacoes',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './minhas-avaliacoes.html',
})
export class MinhasAvaliacoesComponent implements OnInit {
  private readonly service = inject(AvaliacaoService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly avaliacoes = signal<Avaliacao[]>([]);
  readonly hasNone = computed(
    () => !this.loading() && !this.error() && this.avaliacoes().length === 0,
  );
  readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.service.minhas().subscribe({
      next: (list) => {
        this.avaliacoes.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar suas avaliações.');
        this.loading.set(false);
      },
    });
  }
}

