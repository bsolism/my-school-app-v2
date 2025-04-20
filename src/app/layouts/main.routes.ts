import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { HomeComponent } from '../home/home.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    // canActivateChild: [AuthChildGuardService],
    children: [
      {
        path: 'inicio',
        component: HomeComponent,
      },
      {
        path: 'register',
        loadChildren: () =>
          import('../features/register/register.routes').then(
            (x) => x.RegisterRoutes
          ),
      },
      {
        path: 'setting',
        loadChildren: () =>
          import('../features/settings/course.routes').then(
            (x) => x.CoursesRoutes
          ),
      },
      {
        path: 'finance',
        loadChildren: () =>
          import('../features/finances/finance.router').then(
            (x) => x.FinanceRoutes
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'inicio',
  },
];
