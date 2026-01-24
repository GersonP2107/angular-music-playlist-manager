import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', component: Home, canActivate: [authGuard] },
    { path: 'playlists', loadComponent: () => import('./features/playlist/playlist-list').then(m => m.PlaylistList), canActivate: [authGuard] },
    { path: 'playlists/:id', loadComponent: () => import('./features/playlist/playlist-detail/playlist-detail').then(m => m.PlaylistDetail), canActivate: [authGuard] },
    { path: 'create-playlist', loadComponent: () => import('./features/playlist/create-playlist/create-playlist.component').then(m => m.CreatePlaylist), canActivate: [authGuard] },
    { path: 'search', loadComponent: () => import('./features/search/search').then(m => m.Search), canActivate: [authGuard] },
    { path: 'login', loadComponent: () => import('./features/auth/login').then(m => m.Login) },
];
