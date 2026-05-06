import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'technicians', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent) },
  { path: 'technicians', loadComponent: () => import('./components/technicians/technician-list/technician-list').then(m => m.TechnicianListComponent), canActivate: [authGuard] },
  { path: 'technicians/new', loadComponent: () => import('./components/technicians/technician-form/technician-form').then(m => m.TechnicianFormComponent), canActivate: [authGuard] },
  { path: 'technicians/:id/edit', loadComponent: () => import('./components/technicians/technician-form/technician-form').then(m => m.TechnicianFormComponent), canActivate: [authGuard] },
  { path: 'assets', loadComponent: () => import('./components/assets/asset-list/asset-list').then(m => m.AssetListComponent), canActivate: [authGuard] },
  { path: 'assets/new', loadComponent: () => import('./components/assets/asset-form/asset-form').then(m => m.AssetFormComponent), canActivate: [authGuard] },
  { path: 'assets/:id/edit', loadComponent: () => import('./components/assets/asset-form/asset-form').then(m => m.AssetFormComponent), canActivate: [authGuard] },
  { path: 'incidents', loadComponent: () => import('./components/incidents/incident-list/incident-list').then(m => m.IncidentListComponent), canActivate: [authGuard] },
  { path: 'incidents/new', loadComponent: () => import('./components/incidents/incident-form/incident-form').then(m => m.IncidentFormComponent), canActivate: [authGuard] },
  { path: 'incidents/:id/edit', loadComponent: () => import('./components/incidents/incident-form/incident-form').then(m => m.IncidentFormComponent), canActivate: [authGuard] },
];
