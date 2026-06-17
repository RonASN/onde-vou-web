import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TipoUsuario } from '../../../core/models/user.model';

interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: 'home' | 'map' | 'heart' | 'star' | 'briefcase';
  readonly visible: () => boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  @Output() readonly navigate = new EventEmitter<void>();

  readonly isEmpresa = computed(() => this.auth.currentUser()?.tipoUsuario === TipoUsuario.Empresa);

  readonly items: NavItem[] = [
    {
      label: 'Feed',
      path: '/',
      icon: 'home',
      visible: () => this.auth.isAuthenticated(),
    },
    {
      label: 'Mapa',
      path: '/estabelecimentos/mapa',
      icon: 'map',
      visible: () => this.auth.isAuthenticated(),
    },
    {
      label: 'Favoritos',
      path: '/favoritos',
      icon: 'heart',
      visible: () => this.auth.isAuthenticated(),
    },
    {
      label: 'Minhas avaliações',
      path: '/minhas-avaliacoes',
      icon: 'star',
      visible: () => this.auth.isAuthenticated(),
    },
    {
      label: 'Meus cadastros',
      path: '/meus-cadastros',
      icon: 'briefcase',
      visible: () => this.isEmpresa(),
    },
  ];

  onClick(): void {
    this.navigate.emit();
  }
}
