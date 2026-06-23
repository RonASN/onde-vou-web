import { Component, inject, NgZone, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { divIcon, latLng, Map as LeafletMap, marker, tileLayer } from 'leaflet';
import { GeoFeature } from '../../../core/models/establishment.model';
import { EstablishmentService } from '../../../core/services/establishment.service';
import { HlmInputDirective } from '../../../shared/ui/input.directive';

const CATEGORIAS = ['Todas', 'Restaurante', 'Bar', 'Cafeteria', 'Pizzaria', 'Padaria'];

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [LeafletModule, ReactiveFormsModule, HlmInputDirective],
  templateUrl: './mapa.html',
  styleUrl: './mapa.scss',
})
export class MapaComponent implements OnInit, OnDestroy {
  private readonly service = inject(EstablishmentService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly destroy$ = new Subject<void>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly categorias = CATEGORIAS;
  readonly categoriaAtiva = signal('Todas');
  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors',
      }),
    ],
    zoom: 12,
    center: latLng(-15.79, -47.88),
  };

  private map?: LeafletMap;
  private geoFeatures: GeoFeature[] = [];
  private geoLoaded = false;

  private readonly pinIcon = divIcon({
    className: 'ondevou-marker',
    html: `<div class="ondevou-marker__pin">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7 11.5 7.3 11.76a1 1 0 0 0 1.4 0C13 21.5 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
      </svg>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 38],
  });

  ngOnInit(): void {
    this.loadGeo();
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.loadGeo());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCategoryChange(cat: string): void {
    this.categoriaAtiva.set(cat);
    this.loadGeo();
  }

  private loadGeo(): void {
    this.loading.set(true);
    this.error.set(null);

    const nome = this.searchControl.value.trim() || undefined;
    const cat = this.categoriaAtiva();
    const categoria = cat === 'Todas' ? undefined : cat;

    this.service.getGeo({ nome, categoria }).subscribe({
      next: (collection) => {
        this.geoFeatures = collection.features;
        this.geoLoaded = true;
        this.loading.set(false);
        if (this.map) {
          this.clearAndRenderMarkers();
        }
      },
      error: () => {
        this.error.set('Não foi possível carregar os estabelecimentos no mapa.');
        this.loading.set(false);
      },
    });
  }

  onMapReady(map: LeafletMap): void {
    this.map = map;
    if (this.geoLoaded) {
      this.clearAndRenderMarkers();
    }
  }

  private clearAndRenderMarkers(): void {
    if (!this.map) return;
    this.map.eachLayer((layer) => {
      if ((layer as { _latlng?: unknown })._latlng !== undefined) {
        this.map!.removeLayer(layer);
      }
    });
    this.createMarkersOnMap();
  }

  private createMarkersOnMap(): void {
    if (!this.map) return;
    this.geoFeatures.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const m = marker(latLng(lat, lng), { icon: this.pinIcon });
      const { id, nome, categoria } = feature.properties;

      m.bindPopup(`
        <div style="min-width:160px;font-family:inherit">
          <strong style="display:block;margin-bottom:4px;font-size:14px">${nome}</strong>
          <span style="display:inline-block;font-size:11px;background:#f3f4f6;color:#374151;border-radius:9999px;padding:1px 8px;margin-bottom:8px">${categoria}</span>
          <br>
          <button id="ver-det-${id}"
            style="width:100%;padding:6px 12px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;font-weight:600">
            Ver Detalhes
          </button>
        </div>
      `);

      m.on('popupopen', () => {
        const btn = document.getElementById(`ver-det-${id}`);
        if (btn) {
          btn.addEventListener(
            'click',
            () => {
              this.zone.run(() => this.router.navigate(['/estabelecimento', id]));
            },
            { once: true },
          );
        }
      });

      m.addTo(this.map!);
    });
  }
}
