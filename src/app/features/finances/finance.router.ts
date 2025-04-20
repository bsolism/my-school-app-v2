import { Routes } from "@angular/router";
import { PagoRecibidoComponent } from "./pago-recibido/pago-recibido.component";

export const FinanceRoutes: Routes = [
    {
        path: '',
        children: [
          {
            path: 'payment-made',
            component: PagoRecibidoComponent,
          }
        ],
      }
]