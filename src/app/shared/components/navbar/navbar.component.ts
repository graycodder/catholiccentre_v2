import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="nav-container">
        <!-- Logo Area -->
        <a routerLink="/" class="nav-logo">
          <img src="logo.png" alt="Catholic Centre Logo" class="logo-img">
          <div class="logo-text">
            <h2 class="serif-text logo-title">CATHOLIC CENTRE</h2>
            <p class="logo-subtitle">THOPPUMPADY</p>
          </div>
        </a>

        <!-- Desktop Navigation links -->
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">Home</a>
          <a routerLink="/about" routerLinkActive="active" class="nav-item">About</a>
          <a routerLink="/courses" routerLinkActive="active" class="nav-item">Courses</a>
          <a routerLink="/college" routerLinkActive="active" class="nav-item">St. Joseph's College</a>
          <a routerLink="/fastrack" routerLinkActive="active" class="nav-item">Fastrack</a>
          <a routerLink="/xtreem" routerLinkActive="active" class="nav-item">Xtreem</a>
          <a routerLink="/ila" routerLinkActive="active" class="nav-item">ILA</a>
          <a routerLink="/blog" routerLinkActive="active" class="nav-item">Blog</a>
          <a routerLink="/contact" routerLinkActive="active" class="nav-item">Contact</a>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-toggle" (click)="toggleMenu()" aria-label="Toggle menu">
          <span class="material-icons-outlined">{{ menuOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-drawer" [class.open]="menuOpen">
        <a routerLink="/" (click)="closeMenu()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="drawer-item">Home</a>
        <a routerLink="/about" (click)="closeMenu()" routerLinkActive="active" class="drawer-item">About Us</a>
        <a routerLink="/courses" (click)="closeMenu()" routerLinkActive="active" class="drawer-item">Courses</a>
        <a routerLink="/college" (click)="closeMenu()" routerLinkActive="active" class="drawer-item">St. Joseph's College</a>
        <a routerLink="/fastrack" (click)="closeMenu()" routerLinkActive="active" class="drawer-item">Fastrack Academy</a>
        <a routerLink="/xtreem" (click)="closeMenu()" routerLinkActive="active" class="drawer-item">Xtreem Coaching Center</a>
        <a routerLink="/ila" (click)="closeMenu()" routerLinkActive="active" class="drawer-item">ILA Language Academy</a>
        <a routerLink="/blog" (click)="closeMenu()" routerLinkActive="active" class="drawer-item">Blog & News</a>
        <a routerLink="/contact" (click)="closeMenu()" routerLinkActive="active" class="drawer-item">Contact Us</a>
        <a routerLink="/contact" (click)="closeMenu()" class="btn-primary drawer-apply">Apply Now</a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 80px;
      z-index: 1000;
      background: rgba(252, 251, 249, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(11, 25, 44, 0.06);
      transition: all 0.3s ease;
    }

    .navbar.scrolled {
      height: 70px;
      background: rgba(252, 251, 249, 0.95);
      box-shadow: 0 10px 30px -10px rgba(11, 25, 44, 0.08);
    }

    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .nav-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .logo-img {
      height: 48px;
      width: auto;
      object-fit: contain;
      transition: height 0.3s ease;
    }

    .navbar.scrolled .logo-img {
      height: 40px;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-size: 1.25rem;
      letter-spacing: 0.05em;
      color: var(--text-dark);
      margin: 0;
      line-height: 1.1;
    }

    .logo-subtitle {
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      color: var(--gold);
      margin: 0;
      font-weight: 700;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-item {
      text-decoration: none;
      color: var(--text-dark);
      font-size: 0.9rem;
      font-weight: 500;
      padding: 0.5rem 0;
      position: relative;
      transition: color 0.3s ease;
    }

    .nav-item:hover {
      color: var(--gold);
    }

    .nav-item::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: var(--gold);
      transition: width 0.3s ease;
    }

    .nav-item:hover::after,
    .nav-item.active::after {
      width: 100%;
    }

    .nav-item.active {
      color: var(--gold);
    }

    .apply-btn {
      padding: 0.6rem 1.2rem !important;
      font-size: 0.85rem !important;
      margin-left: 0.5rem;
    }

    .mobile-toggle {
      display: none;
      background: transparent;
      border: none;
      color: var(--text-dark);
      cursor: pointer;
    }

    .mobile-toggle span {
      font-size: 1.8rem;
    }

    /* Mobile Drawer */
    .mobile-drawer {
      position: fixed;
      top: 80px;
      left: 0;
      width: 100%;
      height: calc(100vh - 80px);
      background: var(--bg-dark);
      z-index: 999;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 0;
      gap: 1.5rem;
      transform: translateY(-100%);
      opacity: 0;
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      border-top: 1px solid rgba(11, 25, 44, 0.06);
    }

    .mobile-drawer.open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    .drawer-item {
      text-decoration: none;
      color: var(--text-dark);
      font-size: 1.25rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      transition: color 0.3s ease;
    }

    .drawer-item:hover,
    .drawer-item.active {
      color: var(--gold);
    }

    .drawer-apply {
      width: 80%;
      max-width: 300px;
      margin-top: 1rem;
    }

    @media (max-width: 1100px) {
      .nav-links {
        gap: 0.75rem;
      }
      .nav-item {
        font-size: 0.85rem;
      }
    }

    @media (max-width: 992px) {
      .nav-links {
        display: none;
      }
      .mobile-toggle {
        display: block;
      }
    }
  `]
})
export class NavbarComponent {
  isScrolled = false;
  menuOpen = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 50;
      });
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
