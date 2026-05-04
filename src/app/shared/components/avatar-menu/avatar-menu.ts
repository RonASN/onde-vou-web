import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-avatar-menu',
  standalone: true,
  templateUrl: './avatar-menu.html',
})
export class AvatarMenuComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly auth = inject(AuthService);

  readonly open = signal(false);

  readonly initial = computed(() => {
    const nome = this.auth.currentUser()?.nome ?? '';
    return nome.trim().charAt(0).toUpperCase() || '?';
  });

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  onLogout(): void {
    this.close();
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.open()) return;
    const target = event.target as Node | null;
    if (target && !this.host.nativeElement.contains(target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.open()) this.close();
  }
}
