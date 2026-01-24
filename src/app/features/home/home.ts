
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MusicCard {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  greeting: string = '';

  recentlyPlayed: MusicCard[] = [
    { id: 1, title: 'Liked Songs', description: '432 songs', imageUrl: 'https://misc.scdn.co/liked-songs/liked-songs-300.png' },
    { id: 2, title: 'Daily Mix 1', description: 'Made for you', imageUrl: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5eb564e439bb4dc512530df6504/1/en/default' },
    { id: 3, title: 'Top Hits of 2024', description: 'The hottest tracks', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2736e655953049b49c716075677' },
    { id: 4, title: 'Rock Classics', description: 'Legends of Rock', imageUrl: 'https://i.scdn.co/image/ab67616d0000b2738cffb7c6c449c25f483c6b22' }
  ];

  madeForYou: MusicCard[] = [
    { id: 5, title: 'Discover Weekly', description: 'New music every Monday', imageUrl: 'https://newjams-images.scdn.co/image/ab67642000003b204204e38e682d334e320d750c' },
    { id: 6, title: 'Release Radar', description: 'New releases from artists you follow', imageUrl: 'https://newjams-images.scdn.co/image/ab67642000003b20531bd923019313cae6777607' },
    { id: 7, title: 'On Repeat', description: 'Songs you love right now', imageUrl: 'https://daily-mix.scdn.co/covers/on_repeat/PCPM_0000000042.jpg' },
    { id: 8, title: 'Time Capsule', description: 'Your throwback favorites', imageUrl: 'https://i.scdn.co/image/ab67616d0000b27370c3a812239d2c2084c00031' },
    { id: 9, title: 'Summer Vibes', description: 'Chill beats for hot days', imageUrl: 'https://i.scdn.co/image/ab67616d0000b273570624e525046205809ce86e' }
  ];

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
}
