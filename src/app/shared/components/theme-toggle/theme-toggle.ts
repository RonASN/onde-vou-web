import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.html',
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);

  onToggle(): void {
    this.theme.toggle();
  }
}
