import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { TipoUsuario } from '../../../core/models/user.model';
import { HlmButtonDirective } from '../../../shared/ui/button.directive';
import { HlmInputDirective } from '../../../shared/ui/input.directive';
import { HlmLabelDirective } from '../../../shared/ui/label.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    HlmButtonDirective,
    HlmInputDirective,
    HlmLabelDirective,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  get email() {
    return this.form.controls.email;
  }
  get senha() {
    return this.form.controls.senha;
  }

  onSubmit(): void {
    if (this.loading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, senha } = this.form.getRawValue();

    this.auth.login({ email, senha }).subscribe({
      next: (user) => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }
        const defaultUrl =
          user.tipoUsuario === TipoUsuario.Empresa ? '/meus-cadastros' : '/';
        this.router.navigateByUrl(defaultUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Email ou senha inválidos.');
        } else if (err.status === 400) {
          this.errorMessage.set(err.error?.mensagem ?? 'Dados inválidos.');
        } else {
          this.errorMessage.set('Ocorreu um erro. Tente novamente.');
        }
      },
    });
  }
}
