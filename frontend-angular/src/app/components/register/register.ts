import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: true
})
export class Register {
  name = '';
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: Auth, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';
    
    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        alert('Registration successful! Welcome to MarketMesh.');
        this.router.navigate(['/shop']);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || err.error?.error || 'Registration failed';
      }
    });
  }
}

