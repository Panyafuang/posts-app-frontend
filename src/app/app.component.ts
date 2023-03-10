import { Component, isDevMode, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'mean-stack';

  constructor(private _authService: AuthService) { }

  ngOnInit(): void {
    if (isDevMode()) {
      console.log('Development!');
    } else {
      console.log('Production!');
    }
    this._authService.autoAuthUser();
  }
}
