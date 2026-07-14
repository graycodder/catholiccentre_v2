import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { auth } from '../../core/firebase.config';
import { signOut } from 'firebase/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-container">
      <!-- Sidebar -->
      <aside class="admin-sidebar" [class.mobile-open]="sidebarOpen">
        <div class="sidebar-header">
          <span class="material-icons-outlined gold-text header-icon">admin_panel_settings</span>
          <div class="header-info">
            <h3>ADMIN PANEL</h3>
            <p>Catholic Centre</p>
          </div>
        </div>

        <nav class="sidebar-menu">
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="menu-item" (click)="closeSidebar()">
            <span class="material-icons-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/admin/leads" routerLinkActive="active" class="menu-item" (click)="closeSidebar()">
            <span class="material-icons-outlined">people</span>
            <span>Applications</span>
          </a>
          <a routerLink="/admin/courses" routerLinkActive="active" class="menu-item" (click)="closeSidebar()">
            <span class="material-icons-outlined">school</span>
            <span>Courses</span>
          </a>
          <a routerLink="/admin/faculty" routerLinkActive="active" class="menu-item" (click)="closeSidebar()">
            <span class="material-icons-outlined">badge</span>
            <span>Faculty & Staff</span>
          </a>
          <a routerLink="/admin/teachers" routerLinkActive="active" class="menu-item" (click)="closeSidebar()">
            <span class="material-icons-outlined">workspace_premium</span>
            <span>Honorable Teachers</span>
          </a>
          <a routerLink="/admin/blogs" routerLinkActive="active" class="menu-item" (click)="closeSidebar()">
            <span class="material-icons-outlined">article</span>
            <span>Blogs & News</span>
          </a>
          <a routerLink="/admin/leadership" routerLinkActive="active" class="menu-item" (click)="closeSidebar()">
            <span class="material-icons-outlined">supervisor_account</span>
            <span>Leadership Board</span>
          </a>
          
          <div class="menu-divider"></div>
          
          <a routerLink="/" class="menu-item public-site-btn" target="_blank">
            <span class="material-icons-outlined">open_in_new</span>
            <span>View Website</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-details" *ngIf="userEmail">
            <span class="material-icons-outlined">account_circle</span>
            <span class="email-text" [title]="userEmail">{{ userEmail }}</span>
          </div>
          <button (click)="handleLogout()" class="logout-btn">
            <span class="material-icons-outlined">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Panel -->
      <div class="admin-main">
        <header class="admin-header">
          <button class="sidebar-toggle" (click)="toggleSidebar()">
            <span class="material-icons-outlined">menu</span>
          </button>
          <h2>{{ activeSection }}</h2>
          <div class="header-spacer"></div>
        </header>

        <main class="admin-content-area">
          <router-outlet (activate)="onRouteActivated()"></router-outlet>
        </main>
      </div>

      <!-- Mobile Overlay -->
      <div class="sidebar-overlay" *ngIf="sidebarOpen" (click)="closeSidebar()"></div>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-dark);
      color: var(--text-light);
    }

    /* Sidebar Styling */
    .admin-sidebar {
      width: 260px;
      background: #060b12;
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 100;
      transition: transform 0.3s ease;
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }

    .header-icon {
      font-size: 2rem;
    }

    .header-info h3 {
      font-size: 1rem;
      letter-spacing: 0.05em;
    }

    .header-info p {
      font-size: 0.75rem;
      color: var(--gold);
      font-weight: 600;
    }

    .sidebar-menu {
      flex: 1;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      transition: var(--transition-smooth);
    }

    .menu-item:hover {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-light);
    }

    .menu-item.active {
      background: rgba(184, 0, 31, 0.1);
      color: #ff5274;
      border-left: 3px solid var(--accent);
    }

    .menu-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.05);
      margin: 1rem 0;
    }

    .public-site-btn {
      border: 1px solid rgba(212, 175, 55, 0.15);
      color: var(--gold);
    }

    .public-site-btn:hover {
      background: rgba(212, 175, 55, 0.05) !important;
      color: var(--gold) !important;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.03);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .user-details {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      overflow: hidden;
      white-space: nowrap;
    }

    .email-text {
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: rgba(184, 0, 31, 0.1);
      color: #ff5274;
      border: 1px solid rgba(184, 0, 31, 0.2);
      padding: 0.6rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: var(--transition-smooth);
    }

    .logout-btn:hover {
      background: var(--accent);
      color: var(--text-light);
    }

    /* Main Area Styling */
    .admin-main {
      margin-left: 260px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .admin-header {
      height: 70px;
      background: #070f19;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0 2rem;
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 90;
    }

    .admin-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .sidebar-toggle {
      display: none;
      background: transparent;
      border: none;
      color: var(--text-light);
      cursor: pointer;
      margin-right: 1rem;
    }

    .admin-content-area {
      padding: 2.5rem;
      flex: 1;
      background-color: #040910;
    }

    /* Mobile Overlay & Responsive drawer */
    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 95;
    }

    @media (max-width: 768px) {
      .admin-sidebar {
        transform: translateX(-100%);
      }

      .admin-sidebar.mobile-open {
        transform: translateX(0);
      }

      .admin-main {
        margin-left: 0;
      }

      .sidebar-toggle {
        display: block;
      }

      .admin-content-area {
        padding: 1.5rem;
      }
    }
  `]
})
export class AdminLayoutComponent {
  sidebarOpen = false;
  activeSection = 'Dashboard';
  userEmail: string | null = null;

  constructor(private router: Router) {
    // Check current auth user
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.userEmail = user.email;
      } else {
        this.userEmail = null;
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  onRouteActivated() {
    // Update breadcrumb section title based on active url path
    const url = this.router.url;
    if (url.includes('/leads')) {
      this.activeSection = 'Applications & Leads';
    } else if (url.includes('/courses')) {
      this.activeSection = 'Course Offerings';
    } else if (url.includes('/faculty')) {
      this.activeSection = 'Faculty & Staff';
    } else if (url.includes('/teachers')) {
      this.activeSection = 'Honorable Teachers';
    } else if (url.includes('/blogs')) {
      this.activeSection = 'Blogs & Announcements';
    } else if (url.includes('/leadership')) {
      this.activeSection = 'Leadership Board Management';
    } else {
      this.activeSection = 'Overview Dashboard';
    }
  }

  handleLogout() {
    signOut(auth).then(() => {
      this.router.navigate(['/admin/login']);
    });
  }
}
