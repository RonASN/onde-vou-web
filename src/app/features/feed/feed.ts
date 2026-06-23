import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FeedItem, EstabelecimentoProximo, FeedFiltro } from '../../core/models/establishment.model';
import { EstablishmentService } from '../../core/services/establishment.service';
import { HlmButtonDirective } from '../../shared/ui/button.directive';
import { HlmInputDirective } from '../../shared/ui/input.directive';

const PAGE_SIZE = 9;
const CATEGORIAS = ['Todas','Restaurante', 'Bar', 'Cafeteria', 'Pizzaria', 'Padaria'];

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, HlmButtonDirective, HlmInputDirective],
  templateUrl: './feed.html',
})
export class FeedComponent implements OnInit, OnDestroy {
  private readonly service = inject(EstablishmentService);
  private readonly destroy$ = new Subject<void>();

  readonly categorias = CATEGORIAS;
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly raioControl = new FormControl(5, { nonNullable: true });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly items = signal<FeedItem[]>([]);
  readonly paginaAtual = signal(1);
  readonly totalPaginas = signal(1);
  readonly totalRegistros = signal(0);
  readonly categoriaAtiva = signal('Todas');
  readonly modoProximos = signal(false);
  readonly proximos = signal<EstabelecimentoProximo[]>([]);
  readonly loadingLocalizacao = signal(false);

  readonly pages = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));
  readonly hasItems = computed(() => !this.loading() && this.items().length > 0);
  readonly hasNone = computed(
    () => !this.loading() && !this.error() && this.items().length === 0 && !this.modoProximos(),
  );

  ngOnInit(): void {
    this.loadFeed();
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginaAtual.set(1);
        this.modoProximos.set(false);
        this.loadFeed();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCategoryChange(cat: string): void {
    this.categoriaAtiva.set(cat);
    this.paginaAtual.set(1);
    this.modoProximos.set(false);
    this.loadFeed();
  }

  changePage(p: number): void {
    this.paginaAtual.set(p);
    this.loadFeed();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadFeed(): void {
    this.loading.set(true);
    this.error.set(null);

    const filtro: FeedFiltro = { page: this.paginaAtual(), pageSize: PAGE_SIZE };
    const nome = this.searchControl.value.trim();
    if (nome) filtro.nome = nome;
    const cat = this.categoriaAtiva();
    if (cat !== 'Todas') filtro.categoria = cat;

    this.service.feed(filtro).subscribe({
      next: (res) => {
        this.items.set(res.itens);
        this.totalPaginas.set(res.totalPaginas);
        this.totalRegistros.set(res.totalRegistros);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os estabelecimentos.');
        this.loading.set(false);
      },
    });
  }

  buscarProximos(): void {
    if (!('geolocation' in navigator)) {
      this.error.set('Geolocalização não disponível neste navegador.');
      return;
    }
    this.loadingLocalizacao.set(true);
    this.error.set(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const raio = Math.min(150, Math.max(1, this.raioControl.value));
        this.service.proximos(latitude, longitude, raio).subscribe({
          next: (list) => {
            this.proximos.set(list);
            this.modoProximos.set(true);
            this.loadingLocalizacao.set(false);
          },
          error: () => {
            this.error.set('Não foi possível buscar estabelecimentos próximos.');
            this.loadingLocalizacao.set(false);
          },
        });
      },
      () => {
        this.error.set('Não foi possível obter sua localização. Verifique as permissões.');
        this.loadingLocalizacao.set(false);
      },
      { enableHighAccuracy: true },
    );
  }

  voltarFeed(): void {
    this.modoProximos.set(false);
    this.proximos.set([]);
    this.loadFeed();
  }
}

