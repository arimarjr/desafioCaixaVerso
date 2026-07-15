import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Configurações globais do Angular (HttpClient, Router etc.)
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers, // Usa Router + HttpClient + ZoneConfig
  ]
})
.catch((err) => console.error(err));
