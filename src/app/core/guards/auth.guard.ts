import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Wait for auth to be fully initialized (session loaded from localStorage)
    await authService.waitForInitialization();

    const { data: { session } } = await authService.getSession();

    if (session) {
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
};
