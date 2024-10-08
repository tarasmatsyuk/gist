import { inject, Injectable } from "@angular/core";
import { catchError, EMPTY, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { FeatureCollection } from "geojson";

@Injectable({
  providedIn: "root",
})
export class HexagonApiService {
  private url: string = "db/data.json";

  private http: HttpClient = inject(HttpClient);

  load(): Observable<any> {
    return this.http.get<FeatureCollection>(this.url).pipe(
      catchError(() => {
        console.error("Something went wrong");
        return EMPTY;
      }),
    );
  }
}
