import { Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import {
  divIcon,
  latLng,
  LeafletMouseEvent,
  Map as LeafletMap,
  Marker,
  marker,
  tileLayer,
} from 'leaflet';
import { EstablishmentService } from '../../../core/services/establishment.service';
import { HlmButtonDirective } from '../../../shared/ui/button.directive';
import { HlmInputDirective } from '../../../shared/ui/input.directive';
import { HlmLabelDirective } from '../../../shared/ui/label.directive';

@Component({
  selector: 'app-cadastrar-estabelecimento',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LeafletModule,
    RouterLink,
    HlmButtonDirective,
    HlmInputDirective,
    HlmLabelDirective,
  ],
  templateUrl: './cadastrar-estabelecimento.html',
  styleUrl: './cadastrar-estabelecimento.scss',
})
export class CadastrarEstabelecimentoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(EstablishmentService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(200)]],
    descricao: ['', Validators.required],
    categoria: ['', Validators.required],
    latitude: [null as number | null, Validators.required],
    longitude: [null as number | null, Validators.required],
  });

  readonly categorias = ['Restaurante', 'Bar', 'Cafeteria', 'Pizzaria', 'Padaria', 'Outros'];

  readonly mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors',
      }),
    ],
    zoom: 13,
    center: latLng(-15.79, -47.88),
  };

  private map?: LeafletMap;
  private pin?: Marker;

  private readonly pinIcon = divIcon({
    className: 'ondevou-marker',
    html: `
      <div class="ondevou-marker__pin">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 11.5 7.3 11.76a1 1 0 0 0 1.4 0C13 21.5 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
        </svg>
      </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
  });

  ngOnInit(): void {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.zone.run(() => this._setLocation(pos.coords.latitude, pos.coords.longitude, true));
        },
        () => {
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  }

  onMapReady(map: LeafletMap): void {
    this.map = map;
    map.on('click', (e: LeafletMouseEvent) => {
      this.zone.run(() => this._setLocation(e.latlng.lat, e.latlng.lng));
    });
  }

  useMyLocation(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      this.zone.run(() => this._setLocation(pos.coords.latitude, pos.coords.longitude, true));
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);

    const v = this.form.getRawValue();
    this.service
      .create({
        nome: v.nome,
        descricao: v.descricao,
        categoria: v.categoria,
        latitude: v.latitude!,
        longitude: v.longitude!,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigateByUrl('/meus-cadastros');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 400) {
            this.errorMessage.set(err.error?.mensagem ?? 'Dados inválidos.');
          } else if (err.status === 401) {
            this.errorMessage.set('Sessão expirada. Faça login novamente.');
          } else {
            this.errorMessage.set('Erro ao cadastrar. Tente novamente.');
          }
        },
      });
  }

  private _setLocation(lat: number, lng: number, recenter = false): void {
    this.form.patchValue({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    });
    if (!this.map) return;
    if (this.pin) {
      this.pin.setLatLng([lat, lng]);
    } else {
      this.pin = marker([lat, lng], { icon: this.pinIcon, draggable: true }).addTo(this.map);
      this.pin.on('dragend', () => {
        const ll = this.pin!.getLatLng();
        this.zone.run(() =>
          this.form.patchValue({
            latitude: Number(ll.lat.toFixed(6)),
            longitude: Number(ll.lng.toFixed(6)),
          }),
        );
      });
    }
    if (recenter) this.map.setView([lat, lng], 15);
  }
}
