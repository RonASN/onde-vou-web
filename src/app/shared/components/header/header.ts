import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { HlmButtonDirective } from '../../ui/button.directive';
import { AvatarMenuComponent } from '../avatar-menu/avatar-menu';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, HlmButtonDirective, AvatarMenuComponent, ThemeToggleComponent],
  templateUrl: './header.html',
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  @Output() readonly toggleSidebar = new EventEmitter<void>();

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
