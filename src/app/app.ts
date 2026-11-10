import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <header>Compre Bem</header>
    <main><router-outlet /></main>
  `,
})
export class App {}
