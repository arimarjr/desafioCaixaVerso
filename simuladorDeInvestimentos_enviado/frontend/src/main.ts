import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Configurações globais do Angular (HttpClient, Router etc.)
import { appConfig } from './app/app.config';

// Chart.js / ng2-charts
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,               // Usa Router + HttpClient + ZoneConfig
    provideCharts(withDefaultRegisterables()) // Suporte aos gráficos
  ]
})
.catch((err) => console.error(err));
