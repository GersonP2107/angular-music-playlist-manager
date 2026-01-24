import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-create-playlist',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './create-playlist.component.html',
    styleUrl: './create-playlist.component.css'
})
export class CreatePlaylist implements OnInit {
    playlistName: string = '';
    playlistDescription: string = '';
    imageSrc: string | null = null;
    loading = false;
    isEditing = false;
    playlistId: string | null = null;

    selectedFile: File | null = null;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private playlistService: PlaylistService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    async ngOnInit() {
        this.playlistId = this.route.snapshot.paramMap.get('id');
        if (this.playlistId) {
            this.isEditing = true;
            this.loading = true;
            const { data, error } = await this.playlistService.getPlaylist(this.playlistId);
            if (data) {
                this.playlistName = data.name;
                this.playlistDescription = data.description || '';
                this.imageSrc = data.image_url || null;
            } else {
                console.error('Error loading playlist for edit', error);
                this.router.navigate(['/playlists']);
            }
            this.loading = false;
            // Force change detection safely
            if (this.cdr) {
                this.cdr.markForCheck();
            }
        }
    }

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
            } else if (this.isEditing) {
                // Keep existing image if no new one selected
                imageUrl = this.imageSrc;
            }

            const playlistData: any = {
                name: this.playlistName,
                description: this.playlistDescription,
            };

            if (imageUrl) {
                playlistData.image_url = imageUrl;
            }

            let result;
            if (this.isEditing && this.playlistId) {
                result = await this.playlistService.updatePlaylist(this.playlistId, playlistData);
            } else {
                playlistData.user_id = user.id;
                result = await this.playlistService.createPlaylist(playlistData);
            }

            const { error } = result;

            this.loading = false;
            if (error) {
                console.error('Error saving playlist', error);
                alert('Error al guardar la playlist');
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
