import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { db } from '../../../core/firebase.config';
import { ref, get } from 'firebase/database';

interface DashboardStats {
  leadsCount: number;
  coursesCount: number;
  facultyCount: number;
  blogsCount: number;
}

interface LeadSummary {
  id: string;
  name: string;
  phone: string;
  course: string;
  status: string;
  createdDate: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-wrapper">
      <!-- Grid Stats -->
      <div class="grid-cols-4 stats-grid">
        <div class="glass-card stat-card accent-card">
          <div class="stat-content">
            <p class="stat-label">Total Applications</p>
            <h3 class="stat-value">{{ stats.leadsCount }}</h3>
          </div>
          <span class="material-icons-outlined stat-icon">people</span>
        </div>

        <div class="glass-card stat-card gold-card">
          <div class="stat-content">
            <p class="stat-label">Active Courses</p>
            <h3 class="stat-value">{{ stats.coursesCount }}</h3>
          </div>
          <span class="material-icons-outlined stat-icon">school</span>
        </div>

        <div class="glass-card stat-card accent-card">
          <div class="stat-content">
            <p class="stat-label">Faculty & Staff</p>
            <h3 class="stat-value">{{ stats.facultyCount }}</h3>
          </div>
          <span class="material-icons-outlined stat-icon">badge</span>
        </div>

        <div class="glass-card stat-card gold-card">
          <div class="stat-content">
            <p class="stat-label">Published Blogs</p>
            <h3 class="stat-value">{{ stats.blogsCount }}</h3>
          </div>
          <span class="material-icons-outlined stat-icon">article</span>
        </div>
      </div>

      <!-- Main Layout Panels -->
      <div class="dashboard-panels">
        <!-- Recent Leads List -->
        <div class="glass-card list-panel">
          <div class="panel-header">
            <h3>Recent Student Inquiries</h3>
            <a routerLink="/admin/leads" class="btn-outline view-all-btn">View All</a>
          </div>

          <div *ngIf="loadingLeads" class="panel-loading text-center">
            <span class="material-icons-outlined spin-icon">sync</span>
            <p>Loading recent leads...</p>
          </div>

          <div *ngIf="!loadingLeads && recentLeads.length === 0" class="panel-empty text-center">
            <span class="material-icons-outlined">inbox</span>
            <p>No student inquiries received yet.</p>
          </div>

          <div *ngIf="!loadingLeads && recentLeads.length > 0" class="table-responsive">
            <table class="leads-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Phone</th>
                  <th>Course Choice</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let lead of recentLeads">
                  <td><strong>{{ lead.name }}</strong></td>
                  <td>{{ lead.phone }}</td>
                  <td>{{ getCourseLabel(lead.course) }}</td>
                  <td>{{ lead.createdDate }}</td>
                  <td>
                    <span class="status-badge" [class]="lead.status">
                      {{ lead.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="glass-card actions-panel">
          <h3>Administrative Actions</h3>
          <p>Quick shortcuts to update the public website content</p>
          
          <div class="action-buttons-list">
            <a routerLink="/admin/courses" class="action-btn">
              <span class="material-icons-outlined">add_circle_outline</span>
              <div>
                <strong>Add New Course</strong>
                <p>Publish a university degree or language module</p>
              </div>
            </a>
            <a routerLink="/admin/blogs" class="action-btn">
              <span class="material-icons-outlined">campaign</span>
              <div>
                <strong>Publish Announcement</strong>
                <p>Post notices, exams schedules or news</p>
              </div>
            </a>
            <a routerLink="/admin/faculty" class="action-btn">
              <span class="material-icons-outlined">person_add_alt</span>
              <div>
                <strong>Add Staff Member</strong>
                <p>Register directory profiles for teachers/directors</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    /* Stats Cards styling */
    .stats-grid {
      gap: 1.5rem;
    }

    .stat-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }

    .stat-value {
      font-size: 2.25rem;
      margin-top: 0.5rem;
      font-weight: 800;
    }

    .stat-icon {
      font-size: 2.5rem;
      color: var(--gold);
      opacity: 0.8;
    }

    /* Dashboard panels layout */
    .dashboard-panels {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: 2rem;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .view-all-btn {
      padding: 0.4rem 1rem !important;
      font-size: 0.8rem !important;
    }

    .panel-loading, .panel-empty {
      padding: 3rem 0;
      color: var(--text-muted);
    }

    .spin-icon {
      font-size: 2rem;
      animation: spin 1s linear infinite;
      margin-bottom: 0.5rem;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* Table styling */
    .table-responsive {
      overflow-x: auto;
    }

    .leads-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .leads-table th {
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .leads-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 0.9rem;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 4px;
    }

    .status-badge.pending { background: rgba(212, 175, 55, 0.15); color: var(--gold); }
    .status-badge.verified { background: rgba(52, 211, 153, 0.15); color: #34d399; }
    .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #f87171; }

    /* Actions Panel Styling */
    .actions-panel h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .actions-panel p {
      font-size: 0.85rem;
      margin-bottom: 2rem;
    }

    .action-buttons-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      color: var(--text-light);
      text-decoration: none;
      transition: var(--transition-smooth);
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--gold);
      transform: translateX(5px);
    }

    .action-btn span {
      font-size: 2rem;
      color: var(--gold);
    }

    .action-btn strong {
      display: block;
      font-size: 0.9rem;
      margin-bottom: 0.15rem;
    }

    .action-btn p {
      font-size: 0.75rem;
      margin: 0;
      color: var(--text-muted);
    }

    @media (max-width: 1024px) {
      .dashboard-panels {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    leadsCount: 0,
    coursesCount: 0,
    facultyCount: 0,
    blogsCount: 0
  };

  recentLeads: LeadSummary[] = [];
  loadingLeads = true;

  ngOnInit() {
    this.loadStats();
    this.loadRecentLeads();
  }

  loadStats() {
    // Lead Count
    get(ref(db, 'leads')).then(snap => this.stats.leadsCount = snap.exists() ? snap.size : 0);
    // Courses Count
    get(ref(db, 'courses')).then(snap => this.stats.coursesCount = (snap.exists() && snap.size > 0) ? snap.size : 9); // Fallback to seed count
    // Faculty Count
    get(ref(db, 'faculty')).then(snap => this.stats.facultyCount = (snap.exists() && snap.size > 0) ? snap.size : 5); // Fallback to leadership count
    // Blogs Count
    get(ref(db, 'blogs')).then(snap => this.stats.blogsCount = (snap.exists() && snap.size > 0) ? snap.size : 3); // Fallback to seed count
  }

  loadRecentLeads() {
    this.loadingLeads = true;
    get(ref(db, 'leads'))
      .then((snapshot) => {
        const list: LeadSummary[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            list.push({ id: key, ...data[key] } as LeadSummary);
          });
          // Sort by createdAt descending
          list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        }
        this.recentLeads = list.slice(0, 5);
        this.loadingLeads = false;
      })
      .catch((error) => {
        console.error('Error fetching dashboard leads:', error);
        this.loadingLeads = false;
      });
  }

  getCourseLabel(val: string): string {
    if (!val) return 'General Inquiry';
    return val.replace(/-/g, ' ').toUpperCase();
  }
}
