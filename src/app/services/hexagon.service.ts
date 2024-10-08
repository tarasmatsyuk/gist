import proj4 from "proj4";
import { Injectable } from "@angular/core";
import * as L from "leaflet";

const EPSG_3857 = "EPSG:3857";
const EPSG_4326 = "EPSG:4326";

@Injectable({
  providedIn: "root",
})
export class HexagonService {
  convert(coordinates: Array<number>): Array<number> {
    const [lng, lat] = proj4(EPSG_3857, EPSG_4326, coordinates);
    return [lat, lng];
  }

  getPolygon(geoBoundaries: number[][], color: string): L.Polygon {
    return L.polygon(
      geoBoundaries.map(([lng, lat]) => [lng, lat]),
      {
        fillOpacity: 0.1,
        opacity: 0.5,
        weight: 1,
        color: `#${color}`,
      },
    );
  }
}
