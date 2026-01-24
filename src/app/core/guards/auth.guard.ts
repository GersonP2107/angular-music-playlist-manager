import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('Auth guard executing for:', state.url);

    try {
        // Wait for auth to be fully initialized (session loaded from localStorage)
        console.log('Waiting for auth initialization...');
        await authService.waitForInitialization();
        console.log('Auth initialization wait complete');

        const { data: { session }, error } = await authService.getSession();

        console.log('Session check:', session ? 'Has session' : 'No session', 'Error:', error);

        if (error) {
            console.error('Auth guard error:', error);
            router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
        }

        if (session && session.user) {
            console.log('Auth guard: Access granted for', session.user.email);
            // Session is valid
            return true;
        } else {
            console.log('No valid session found, redirecting to login');
            router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
        }
    } catch (error) {
        console.error('Unexpected error in auth guard:', error);
        router.navigate(['/login']);
        return false;
    }
};
