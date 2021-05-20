import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagesComponent } from './pages.component';
import { ClientesComponent } from './clientes/clientes.component';
import { VentasComponent } from './ventas/ventas.component';
import { ProductosComponent } from './productos/productos.component';
import { InformesComponent } from './informes/informes.component';

const routes: Routes = [

  {
      path: 'home',
      component: PagesComponent,
  },
  {
    path: 'clientes',
    component: ClientesComponent,
  },
  {
    path: 'ventas',
    component: VentasComponent,
  },
  {
    path: 'productos',
    component: ProductosComponent,
  },
  {
    path: 'informes',
    component: InformesComponent,
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
