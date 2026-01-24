import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        const isBrowser = isPlatformBrowser(this.platformId);

        this.supabase = createClient(environment.supabase.url, environment.supabase.key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage: isBrowser ? localStorage : undefined
            }
        });
    }

    get client() {
        return this.supabase;
    }
}
