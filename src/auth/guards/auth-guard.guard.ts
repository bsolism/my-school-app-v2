import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { UserStoreService } from '../../app/shared/services/user-store.service';
import { jwtDecode } from 'jwt-decode';
import { Menu } from '../../app/shared/interfaces/menu.interface';
import { CurrentUser } from '../../app/shared/interfaces/current-user.interface';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userStore = inject(UserStoreService);

  const token = localStorage.getItem('auth-ms');

  // Si existe el token, el usuario está autenticado.
  if (token) {
    const decodedUser: any = jwtDecode(token);
    const menus: Menu[] = JSON.parse(decodedUser["http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata"]);
    const currentUser: CurrentUser = {
      usuario: decodedUser.unique_name,
      name: decodedUser.given_name,
      email: decodedUser.email,
      rolId: decodedUser.role,
      menus: menus,
    };
    userStore.setUser(currentUser);

    return true;
  }
  if (userStore.user() !== null) {
    return true;
  }
  return router.navigate(['/login']);
};
