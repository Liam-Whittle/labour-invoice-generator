import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Invoices', url: '/menu', icon: 'document' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
  ];
  constructor() {}
}
