import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-create-playlist',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './create-playlist.component.html',
    styleUrl: './create-playlist.component.css'
})
export class CreatePlaylist {
    playlistName: string = '';
    playlistDescription: string = '';
    imageSrc: string | null = null;
    loading = false;

    selectedFile: File | null = null;

    constructor(
        private router: Router,
        private playlistService: PlaylistService,
        private authService: AuthService
    ) { }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => this.imageSrc = e.target?.result as string;
            reader.readAsDataURL(file);
        }
    }

    async uploadImage(userId: string): Promise<string | null> {
        if (!this.selectedFile) return null;

        const fileExt = this.selectedFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await this.playlistService.uploadImage(filePath, this.selectedFile);

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        return this.playlistService.getImageUrl(filePath);
    }

    async save() {
        if (!this.playlistName) return;

        this.loading = true;

        // Get current user
        const { data: { user } } = await this.authService.getUser();

        if (user) {
            let imageUrl: string | null = null;
            if (this.selectedFile) {
                imageUrl = await this.uploadImage(user.id);
            }

            const newPlaylist = {
                name: this.playlistName,
                description: this.playlistDescription,
                user_id: user.id,
                image_url: imageUrl || undefined
            };

            const { error } = await this.playlistService.createPlaylist(newPlaylist);

            this.loading = false;
            if (error) {
                console.error('Error creating playlist', error);
                alert('Error al crear la playlist');
            } else {
                this.router.navigate(['/playlists']);
            }
        } else {
            console.error('User not logged in');
            this.loading = false;
            this.router.navigate(['/login']);
        }
    }

    cancel() {
        this.router.navigate(['/playlists']);
    }
}
