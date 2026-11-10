import { Routes } from '@angular/router';
import { ProdutoForm } from './produto-form';
import { ProdutoLista } from './produto-lista';

export const routes: Routes = [
  { path: '', redirectTo: 'produtos', pathMatch: 'full' },
  { path: 'produtos', component: ProdutoLista },
  { path: 'produtos/novo', component: ProdutoForm },
  { path: 'produtos/:id', component: ProdutoForm },
  { path: '**', redirectTo: 'produtos' },
];
