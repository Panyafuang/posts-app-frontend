import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  private authStatusSub: Subscription;

  constructor(private _authService: AuthService) { }

  ngOnInit(): void {
    this.authStatusSub = this._authService.getAuthStatusListener()
    .subscribe((authStatus: boolean) => {
      this.isLoading = false;
    });
  }

  onLogin(form: NgForm) {
    if (form.invalid) return;
    this.isLoading = true;
    this._authService.login(form.value.email, form.value.password);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
