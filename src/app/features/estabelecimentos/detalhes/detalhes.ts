import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { EstablishmentService } from '../../../core/services/establishment.service';
import { AvaliacaoService } from '../../../core/services/avaliacao.service';
import { FavoritoService } from '../../../core/services/favorito.service';
import { EstabelecimentoDetalhe } from '../../../core/models/establishment.model';
import { Avaliacao, ResumoAvaliacoes } from '../../../core/models/avaliacao.model';
import { HlmButtonDirective } from '../../../shared/ui/button.directive';

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, HlmButtonDirective, DatePipe],
  templateUrl: './detalhes.html',
})
export class DetalhesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly estService = inject(EstablishmentService);
  private readonly avService = inject(AvaliacaoService);
  private readonly favService = inject(FavoritoService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly estabelecimento = signal<EstabelecimentoDetalhe | null>(null);
  readonly avaliacoes = signal<Avaliacao[]>([]);
  readonly resumo = signal<ResumoAvaliacoes | null>(null);
  readonly isFavorito = signal(false);
  readonly loadingFav = signal(false);
  readonly loadingAvaliacao = signal(false);
  readonly avaliacaoError = signal<string | null>(null);
  readonly avaliacaoSucesso = signal(false);

  readonly notaSelecionada = signal(5);

  readonly avaliacoesOrdenadas = computed(() =>
    [...this.avaliacoes()].sort(
      (a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime(),
    ),
  );

  readonly googleMapsUrl = computed(() => {
    const e = this.estabelecimento();
    if (!e) return null;
    return `https://www.google.com/maps?q=${e.latitude},${e.longitude}`;
  });

  readonly form = this.fb.nonNullable.group({
    comentario: ['', Validators.required],
  });

  readonly stars = [1, 2, 3, 4, 5];

  private id!: number;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      detalhes: this.estService.getDetalhes(this.id),
      avaliacoes: this.avService.porEstabelecimento(this.id).pipe(catchError(() => of([]))),
      resumo: this.avService.resumo(this.id).pipe(catchError(() => of(null))),
      favoritos: this.favService.meus().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ detalhes, avaliacoes, resumo, favoritos }) => {
        this.estabelecimento.set(detalhes);
        this.avaliacoes.set(avaliacoes);
        this.resumo.set(resumo);
        this.isFavorito.set(favoritos.some((f) => f.estabelecimentoId === this.id));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os detalhes do estabelecimento.');
        this.loading.set(false);
      },
    });
  }

  toggleFavorito(): void {
    this.loadingFav.set(true);
    if (this.isFavorito()) {
      this.favService.remover(this.id).subscribe({
        next: () => {
          this.isFavorito.set(false);
          this.loadingFav.set(false);
        },
        error: () => this.loadingFav.set(false),
      });
    } else {
      this.favService.adicionar({ estabelecimentoId: this.id }).subscribe({
        next: () => {
          this.isFavorito.set(true);
          this.loadingFav.set(false);
        },
        error: () => this.loadingFav.set(false),
      });
    }
  }

  onSubmitAvaliacao(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loadingAvaliacao.set(true);
    this.avaliacaoError.set(null);
    this.avaliacaoSucesso.set(false);

    this.avService
      .criar({
        nota: this.notaSelecionada(),
        comentario: this.form.getRawValue().comentario,
        estabelecimentoId: this.id,
      })
      .subscribe({
        next: () => {
          this.form.reset({ comentario: '' });
          this.notaSelecionada.set(5);
          this.avaliacaoSucesso.set(true);
          this.loadingAvaliacao.set(false);
          this.refreshAvaliacoes();
        },
        error: () => {
          this.avaliacaoError.set('Não foi possível enviar sua avaliação. Tente novamente.');
          this.loadingAvaliacao.set(false);
        },
      });
  }

  private refreshAvaliacoes(): void {
    forkJoin({
      avaliacoes: this.avService.porEstabelecimento(this.id).pipe(catchError(() => of([]))),
      resumo: this.avService.resumo(this.id).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ avaliacoes, resumo }) => {
        this.avaliacoes.set(avaliacoes);
        this.resumo.set(resumo);
      },
    });
  }
}
