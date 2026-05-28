import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule],
  template: `
    <router-outlet></router-outlet>
    <ngx-spinner bdColor="rgba(0, 0, 0, 0.8)" size="medium" color="#14b8a6" type="ball-pulse-sync" [fullScreen]="true">
      <p style="color: white"> Chargement... </p>
    </ngx-spinner>
  `
})
export class AppComponent {
  title = 'suivi-qualite';
}
