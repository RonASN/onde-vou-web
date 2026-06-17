import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritoService } from '../../core/services/favorito.service';
import { Favorito } from '../../core/models/favorito.model';
import { HlmButtonDirective } from '../../shared/ui/button.directive';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [RouterLink, HlmButtonDirective],
  templateUrl: './favoritos.html',
})
export class FavoritosComponent implements OnInit {
  private readonly service = inject(FavoritoService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly favoritos = signal<Favorito[]>([]);
  readonly hasNone = computed(
    () => !this.loading() && !this.error() && this.favoritos().length === 0,
  );

  ngOnInit(): void {
    this.loadFavoritos();
  }

  loadFavoritos(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.meus().subscribe({
      next: (list) => {
        this.favoritos.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar seus favoritos.');
        this.loading.set(false);
      },
    });
  }

  remover(estabelecimentoId: number): void {
    this.service.remover(estabelecimentoId).subscribe({
      next: () => {
        this.favoritos.update((list) =>
          list.filter((f) => f.estabelecimentoId !== estabelecimentoId),
        );
      },
      error: () => {
        this.error.set('Não foi possível remover o favorito.');
      },
    });
  }
}
