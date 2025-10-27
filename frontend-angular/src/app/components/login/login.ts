import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: Auth, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        alert('Login successful! Welcome back.');
        this.router.navigate(['/shop']);
      },
      error: (err) => {
        this.errorMessage = err.error?.msg || err.error?.error || 'Login failed';
      }
    });
  }
}

