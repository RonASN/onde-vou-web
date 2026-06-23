import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { empresaGuard } from './core/auth/empresa.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/shell/shell').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        data: { breadcrumb: 'Feed' },
        loadComponent: () => import('./features/feed/feed').then((m) => m.FeedComponent),
      },
      {
        path: 'minhas-avaliacoes',
        data: { breadcrumb: 'Minhas avaliações' },
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/avaliacoes/minhas-avaliacoes').then(
            (m) => m.MinhasAvaliacoesComponent,
          ),
      },
      {
        path: 'meus-cadastros',
        data: { breadcrumb: 'Meus cadastros' },
        canActivate: [authGuard, empresaGuard],
        loadComponent: () =>
          import('./features/estabelecimentos/meus-cadastros').then(
            (m) => m.MeusCadastrosComponent,
          ),
      },
      {
        path: 'cadastrar-estabelecimento',
        data: { breadcrumb: 'Cadastrar estabelecimento' },
        canActivate: [authGuard, empresaGuard],
        loadComponent: () =>
          import('./features/estabelecimentos/cadastrar-estabelecimento/cadastrar-estabelecimento').then(
            (m) => m.CadastrarEstabelecimentoComponent,
          ),
      },
      {
        path: 'estabelecimento/:id',
        data: { breadcrumb: 'Detalhes' },
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/estabelecimentos/detalhes/detalhes').then(
            (m) => m.DetalhesComponent,
          ),
      },
      {
        path: 'favoritos',
        data: { breadcrumb: 'Meus favoritos' },
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/favoritos/favoritos').then((m) => m.FavoritosComponent),
      },
      {
        path: 'mapa',
        data: { breadcrumb: 'Mapa' },
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/estabelecimentos/mapa/mapa').then((m) => m.MapaComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
