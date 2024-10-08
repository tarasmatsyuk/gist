import { Component } from "@angular/core";
import { HexagonsViewComponent } from "./components/hexagons-view.component";
import { HttpClientModule } from "@angular/common/http";

@Component({
  imports: [HexagonsViewComponent, HttpClientModule],
  standalone: true,
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {}
