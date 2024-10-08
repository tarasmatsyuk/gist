import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';

import {AppComponent} from './app/app.component';
import { importProvidersFrom } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";

bootstrapApplication(AppComponent, {
  providers: [provideProtractorTestingSupport(), importProvidersFrom(HttpClientModule)],
});
