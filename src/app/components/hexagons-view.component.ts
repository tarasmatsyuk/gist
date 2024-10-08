import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
} from "@angular/core";
import * as L from "leaflet";
import { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { HexagonService } from "../services/hexagon.service";
import { HexagonApiService } from "../services/hexagon-api.service";
import { geoToH3, h3ToGeoBoundary } from "h3-js";
import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
} from "geojson";
import { debounce } from "../services/helpers";

const DELAY = 500;

@Component({
  standalone: true,
  selector: "hexagons-view",
  templateUrl: "hexagons-view.component.html",
  styleUrls: ["hexagons-view.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HexagonsViewComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private zoomLevel = 3;
  private zoomLevelMin = 1;
  private zoomLevelMax = 18;
  private h3ResMin = 3;
  private h3ResMax = 8;
  private geo: FeatureCollection;

  private hexagonApiService = inject(HexagonApiService);
  private hexagonService = inject(HexagonService);
  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    this.loadData();
    this.initMap();

    this.map.on("zoomend", () => this.debouncedUpdateHexagons);
  }

  ngOnDestroy(): void {
    this.map.off("zoomend", this.debouncedUpdateHexagons);
  }

  private loadData(): void {
    this.hexagonApiService.load().subscribe((geo: FeatureCollection) => {
      this.geo = geo;
      this.setBounds(geo);
      this.updateHexagons();
      this.cdr.markForCheck();
    });
  }

  private initMap(): void {
    this.map = L.map("map", {
      center: [50, 50],
      zoom: this.zoomLevel,
      minZoom: this.zoomLevelMin,
      maxZoom: this.zoomLevelMax,
    });

    const tile = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: this.zoomLevelMax,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    );

    tile.addTo(this.map);
  }

  private updateHexagons(): void {
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Polygon) {
        this.map.removeLayer(layer);
      }
    });

    const bounds = this.map.getBounds();
    const resolution = this.getHexagonResolution();

    this.geo.features.forEach(
      (feature: Feature<Geometry, GeoJsonProperties>) => {
        const coordinates = (feature.geometry as MultiPolygon).coordinates;
        coordinates.forEach((cords) => {
          cords.forEach((cord) => {
            const [lat, lng] = this.hexagonService.convert(cord[0]);
            if (bounds.contains([lat, lng])) {
              const color = feature.properties?.["COLOR_HEX"] || "EEE";
              const h3Index = geoToH3(lat, lng, resolution);
              const geoBoundaries = h3ToGeoBoundary(h3Index);
              const hexPolygon = this.hexagonService.getPolygon(
                geoBoundaries,
                color,
              );

              hexPolygon.addTo(this.map);
            }
          });
        });
      },
    );
  }

  private setBounds(data: FeatureCollection): void {
    const bounds = L.latLngBounds([]);

    data.features.forEach((feature: Feature<Geometry, GeoJsonProperties>) => {
      const coordinates = (feature.geometry as MultiPolygon).coordinates;
      coordinates.forEach((coordinate) => {
        coordinate.forEach((positions) => {
          const coords = this.hexagonService.convert(positions[0]) as
            | LatLngExpression
            | LatLngBoundsExpression;
          bounds.extend(coords);
        });
      });
    });

    this.map.fitBounds(bounds);
  }

  private getHexagonResolution(): number {
    const zoom = this.map.getZoom();
    const resolution =
      ((zoom - this.zoomLevelMin) / (this.zoomLevelMax - this.zoomLevelMin)) *
        (this.h3ResMax - this.h3ResMin) +
      this.h3ResMin;
    const roundedResolution = Math.round(resolution);
    return Math.max(this.h3ResMin, Math.min(this.h3ResMax, roundedResolution));
  }

  private debouncedUpdateHexagons = debounce(() => {
    this.updateHexagons();
  }, DELAY);
}
