import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Establishment } from '../../core/models/establishment.model';
import { EstablishmentService } from '../../core/services/establishment.service';
import { AuthService } from '../../core/auth/auth.service';
import { HlmButtonDirective } from '../../shared/ui/button.directive';

@Component({
  selector: 'app-meus-cadastros',
  standalone: true,
  imports: [RouterLink, HlmButtonDirective],
  templateUrl: './meus-cadastros.html',
  styleUrl: './meus-cadastros.scss',
})
export class MeusCadastrosComponent {
  private readonly service = inject(EstablishmentService);
  private readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly estabelecimentos = signal<Establishment[]>([]);
  readonly hasNone = computed(
    () => !this.loading() && this.estabelecimentos().length === 0 && !this.error(),
  );

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (!user) return;
      this.loading.set(true);
      this.service.getByUsuario(user.id).subscribe({
        next: (list) => {
          this.estabelecimentos.set(list);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Não foi possível carregar seus cadastros.');
          this.loading.set(false);
        },
      });
    });
  }
}
