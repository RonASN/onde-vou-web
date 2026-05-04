import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs/operators';

interface Crumb {
  readonly label: string;
  readonly url: string | null; // null = não-clicável (último)
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly nav = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.build()),
    ),
    { initialValue: [{ label: 'Home', url: null }] as Crumb[] },
  );

  readonly crumbs = computed<Crumb[]>(() => this.nav());

  private build(): Crumb[] {
    const result: Crumb[] = [{ label: 'Home', url: '/' }];
    let r = this.route.root;
    let url = '';
    while (r.firstChild) {
      r = r.firstChild;
      const snap = r.snapshot;
      if (!snap) break;
      const segment = snap.url.map((s) => s.path).join('/');
      if (segment) url += '/' + segment;
      const label = snap.data['breadcrumb'] as string | undefined;
      if (label) result.push({ label, url: url || '/' });
    }
    if (result.length > 1) {
      result[result.length - 1] = { ...result[result.length - 1], url: null };
    }
    return result;
  }
}
