import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';

import { Post } from './posts/post.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'mean-stack';

  constructor(private _authService: AuthService){}

  ngOnInit(): void {
    this._authService.autoAuthUser();
  }
}
