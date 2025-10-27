import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  standalone: true
})
export class Home {
  constructor(private router: Router) {}

  goToShop(): void {
    this.router.navigate(['/shop']);
  }
}

