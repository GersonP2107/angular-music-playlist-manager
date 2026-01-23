import { Routes } from '@angular/router';
import { Home } from './features/home/home';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'playlists', loadComponent: () => import('./features/playlist/playlist-list').then(m => m.PlaylistList) }
];
