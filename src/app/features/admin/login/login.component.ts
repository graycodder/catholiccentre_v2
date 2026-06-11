import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { auth } from '../../../core/firebase.config';
import { signInWithEmailAndPassword } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="glass-card gold-card login-card animate-fade-in">
        <div class="login-header text-center">
          <span class="material-icons-outlined gold-text logo-icon">admin_panel_settings</span>
          <h2 class="serif-text">ADMIN PORTAL</h2>
          <p>Cochin Catholic Centre</p>
        </div>

        <form #loginForm="ngForm" (ngSubmit)="handleLogin(loginForm)" class="login-form">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input type="email" id="email" name="email" [(ngModel)]="email" required email #emailField="ngModel" class="form-control" placeholder="admin&#64;catholiccentre.com">
            <span class="error-msg" *ngIf="emailField.invalid && emailField.touched">Please enter a valid email</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input type="password" id="password" name="password" [(ngModel)]="password" required minlength="6" #passField="ngModel" class="form-control" placeholder="••••••••">
            <span class="error-msg" *ngIf="passField.invalid && passField.touched">Password must be at least 6 characters</span>
          </div>

          <div class="error-banner" *ngIf="errorMessage">
            <span class="material-icons-outlined">error_outline</span>
            <span>{{ errorMessage }}</span>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || loading" class="btn-gold login-btn">
            <span class="material-icons-outlined spin-icon" *ngIf="loading">sync</span>
            <span>{{ loading ? 'Signing In...' : 'Access Dashboard' }}</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, #0f1d30 0%, #040910 100%);
      padding: 1.5rem;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 3rem 2.5rem;
    }

    .login-header {
      margin-bottom: 2.5rem;
    }

    .logo-icon {
      font-size: 3.5rem;
      margin-bottom: 0.5rem;
    }

    .login-header h2 {
      font-size: 1.75rem;
      margin-bottom: 0.25rem;
      letter-spacing: 0.05em;
    }

    .login-header p {
      font-size: 0.85rem;
      color: var(--gold);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .error-msg {
      color: #ff5274;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: block;
    }

    .error-banner {
      background: rgba(184, 0, 31, 0.15);
      border: 1px solid rgba(184, 0, 31, 0.3);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #ff5274;
      font-size: 0.85rem;
    }

    .login-btn {
      width: 100%;
      padding: 0.9rem 0;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .spin-icon {
      font-size: 1.25rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private router: Router) {
    // If user is already logged in, go straight to dashboard
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  handleLogin(form: any) {
    if (form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    signInWithEmailAndPassword(auth, this.email, this.password)
      .then(() => {
        this.loading = false;
        this.router.navigate(['/admin/dashboard']);
      })
      .catch((error) => {
        this.loading = false;
        console.error('Login error:', error);
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            this.errorMessage = 'Invalid email or password credentials.';
            break;
          case 'auth/too-many-requests':
            this.errorMessage = 'Access blocked temporarily due to many failed attempts.';
            break;
          default:
            this.errorMessage = 'Authentication failed. Please try again.';
        }
      });
  }
}
