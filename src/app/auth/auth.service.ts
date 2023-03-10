import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { Auth } from "./auth-data.model";
import { environment } from "src/environments/environment";

const BACKEND_URL: string = environment.apiUrl + '/user/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  private tokenTimer: NodeJS.Timer;
  private userId: string;
  private isAuthenticated: boolean = false;
  private authStatusListener = new Subject<boolean>()

  constructor(private http: HttpClient, private router: Router) { }

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  createUser(email: string, password: string) {
    const authData: Auth = { email: email, password: password }
    this.http.post<{ message: string, result: any }>(BACKEND_URL + '/signup', authData)
      .subscribe({
        next: (response) => {
          this.router.navigate(['/']);
        }, error: (err) => {
          this.authStatusListener.next(false);
        }
      });
  }

  login(email: string, password: string) {
    const authData: Auth = { email: email, password: password }
    this.http.post<{ token: string, expiresIn: number, userId: string }>(BACKEND_URL + '/login', authData).subscribe({
      next: (response) => {
        this.token = response.token;

        if (this.token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);

          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.userId = response.userId;

          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000); // 1hr from now, * 1000 เพิื่อทำให้เป็น milisecond
          this.saveAuthData(this.token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.authStatusListener.next(false);
      }
    });
  }

  /** Automatic authenticate the user if we got the information for it in our local storage */
  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) return;
    /** Check if the expiration date still in the future  */
    const now = new Date();
    /** เวลาที่จะหมดอายุในอนาคต - กับเวลาปัจจุบัน เช่น หมดอายุตอน 11 โมง แต่ตอนนี่พึ่งจะ 10 โมง ก็คือยังไม่หมดอายุ expiresIn ก็จะเท่ากับ 1 */
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.authStatusListener.next(true);

      this.setAuthTimer(expiresIn / 1000); // หาร 1000 เพื่อแปรเป็น second
    }
  }

  logout() {
    this.token = null;
    this.userId = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  /** @duration = รับค่าเป็น second */
  private setAuthTimer(duration: number) {
    console.log('expire in: ' + duration + ' second');
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000); // * 1000 to convert for milisecond
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString()); // convert to string use .toISOString() for convert to serialized and standardized version of the date, which i then can use to recreate it once i read in the date later.
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expiration) return;
    return {
      token: token,
      expirationDate: new Date(expiration),
      userId: userId
    }
  }
}
