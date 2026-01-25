import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  user$;
  searchTerm: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user$ = this.authService.currentUser$;
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  onSearch() {
      if (this.searchTerm.trim()) {
          this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
      } else {
          this.router.navigate(['/search']);
      }
  }
}
