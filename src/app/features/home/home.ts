import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface MusicCard {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  greeting: string = '';

  recentlyPlayed: MusicCard[] = [
    { id: 1, title: 'Liked Songs', description: 'Tus canciones favoritas', imageUrl: 'https://misc.scdn.co/liked-songs/liked-songs-300.png' },
    { id: 2, title: 'Daily Mix 1', description: 'Made for you', imageUrl: '/images/daily-mix.png' },
    { id: 3, title: 'Top Hits of 2024', description: 'The hottest tracks', imageUrl: '/images/top-hits.png' },
    { id: 4, title: 'Rock Classics', description: 'Legends of Rock', imageUrl: '/images/rock-classics.png' }
  ];

  madeForYou: MusicCard[] = [
    { id: 5, title: 'Discover Weekly', description: 'New music every Monday', imageUrl: '/images/discover-weekly.png' },
    { id: 6, title: 'Release Radar', description: 'New releases from artists you follow', imageUrl: '/images/release-radar.png' },
    { id: 7, title: 'On Repeat', description: 'Songs you love right now', imageUrl: '/images/on-repeat.png' },
    { id: 8, title: 'Time Capsule', description: 'Your throwback favorites', imageUrl: '/images/time-capsule.png' },
    { id: 9, title: 'Summer Vibes', description: 'Chill beats for hot days', imageUrl: '/images/summer-vibes.png' }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.setGreeting();
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Buenos días';
    } else if (hour < 18) {
      this.greeting = 'Buenas tardes';
    } else {
      this.greeting = 'Buenas noches';
    }
  }

  navigateTo(item: MusicCard) {
    if (item.title === 'Liked Songs') {
      this.router.navigate(['/liked-songs']);
    } else {
      // For now, other cards can just hold
      console.log('Clicked', item.title);
    }
  }
}
