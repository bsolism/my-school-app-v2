import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from '../auth/guards/auth-guard.guard';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    {
      path: 'login',
      component: LoginLayoutComponent,
      // loadChildren: () => import('./auth/lfs-auth.module').then(x => x.LFSAuthModule),
      // canActivate: [authGuard]
    },
    {
      path: '',
      loadChildren: () => import('./layouts/main.routes').then(x => x.routes),
      canActivate: [authGuard]
      // canLoad: [AuthCanLoadService]
    },
    {
      path: '**',
      redirectTo: 'inicio'
    }
    // {
    //   path: 'inicio',
    //   component: MainLayoutComponent,
    // },
    // {
    //   path: 'login',
    //   component:LoginComponent,
    //   canActivate: [authGuard],
    // },
    // {
    //     path: 'register',
    //     loadChildren: () =>
    //       import('./features/register/register.routes').then(
    //         (x) => x.RegisterRoutes
    //       ),
    // },
    // {
    //   path: 'setting',
    //   loadChildren: () =>
    //     import('./features/settings/course.routes').then(
    //       (x) => x.CoursesRoutes
    //     ),
    // }
];
