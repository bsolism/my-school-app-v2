import { Routes } from "@angular/router";
import { EnrollComponent } from "./enroll/enroll.component";
import { AlumnsComponent } from "./alumns/alumns.component";
import { AlumnScreenFormComponent } from "./alumn-screen-form/alumn-screen-form.component";
import { TransportComponent } from "./transport/transport.component";


export const RegisterRoutes: Routes = [
    {
        path: '',
        children: [
          {
            path: 'enroll',
            component: EnrollComponent,
          },
          {
            path: 'alumns',
            component: AlumnsComponent,
          },
          {
            path: 'alumns/add',
            component: AlumnScreenFormComponent,
          },
          {
            path: 'alumns/edit',
            component: AlumnScreenFormComponent,
          },
          {
            path: 'transport',
            component: TransportComponent,
          },
        ],
      }
]