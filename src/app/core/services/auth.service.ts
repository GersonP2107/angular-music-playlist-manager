import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _currentUser = new BehaviorSubject<User | null>(null);
    private _initialized = new BehaviorSubject<boolean>(false);

    constructor(private supabaseService: SupabaseService) {
        this.initializeAuth();

        this.supabaseService.client.auth.onAuthStateChange((event, session) => {
            if (session) {
                this._currentUser.next(session.user);
            } else {
                this._currentUser.next(null);
            }
        });
    }

    private async initializeAuth() {
        try {
            const { data: { session } } = await this.supabaseService.client.auth.getSession();
            if (session?.user) {
                this._currentUser.next(session.user);
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
        } finally {
            this._initialized.next(true);
        }
    }

    async waitForInitialization(): Promise<void> {
        if (this._initialized.value) {
            return Promise.resolve();
        }
        await firstValueFrom(this._initialized.pipe(filter(initialized => initialized === true)));
    }

    get currentUser$(): Observable<User | null> {
        return this._currentUser.asObservable();
    }

    async loadUser() {
        const { data: { user } } = await this.supabaseService.client.auth.getUser();
        this._currentUser.next(user);
    }

    async getUser() {
        return this.supabaseService.client.auth.getUser();
    }

    async getSession() {
        return this.supabaseService.client.auth.getSession();
    }

    async signUp(email: string, password: string): Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }> {
        return this.supabaseService.client.auth.signUp({
            email,
            password,
        });
    }

    async signIn(email: string, password: string): Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }> {
        return this.supabaseService.client.auth.signInWithPassword({
            email,
            password,
        });
    }

    async signOut(): Promise<{ error: AuthError | null }> {
        return this.supabaseService.client.auth.signOut();
    }
}
