import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy{
  isLoading: boolean = false;
  private authStatusSub: Subscription;

  constructor(private _authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this._authService.getAuthStatusListener().subscribe((authStatus: boolean) => {
      this.isLoading = false;
    });
  }

  onSignup(form: NgForm) {
    if(form.invalid) return;
    const email = form.value.email;
    const password = form.value.password;
    this.isLoading = true;
    this._authService.createUser(email, password);
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
}
