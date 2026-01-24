import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _currentUser = new BehaviorSubject<User | null>(null);

    constructor(private supabaseService: SupabaseService) {
        this.loadUser();

        this.supabaseService.client.auth.onAuthStateChange((event, session) => {
            if (session) {
                this._currentUser.next(session.user);
            } else {
                this._currentUser.next(null);
            }
        });
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
