import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { RoleNom } from '../models/utilisateur.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedRoles = route.data['roles'] as Array<string>;
  const currentUser = authService.currentUser;

  if (!authService.isAuthenticated() || !currentUser || !currentUser.role) {
    return router.parseUrl('/login');
  }

  const userRole = currentUser.role?.nomRole;

  if (expectedRoles && userRole && expectedRoles.includes(userRole)) {
    return true;
  }

  // If not authorized, redirect to their home dashboard
  switch(userRole) {
    case RoleNom.ADMIN: return router.parseUrl('/admin/dashboard');
    case RoleNom.CHEF_PROJET: return router.parseUrl('/chef/dashboard');
    case RoleNom.PILOTE_QUALITE: return router.parseUrl('/pilote/dashboard');
    default: return router.parseUrl('/login');
  }
};
