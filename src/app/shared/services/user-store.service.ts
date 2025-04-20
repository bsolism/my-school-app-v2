import { Injectable, signal } from '@angular/core';
import { CurrentUser } from '../interfaces/current-user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  user = signal<CurrentUser | null>(null);

  constructor() { }

  setUser(userData: CurrentUser): void {
    this.user.set(userData);
  }

  getUser(): CurrentUser | null {
    return this.user();
  }

}
