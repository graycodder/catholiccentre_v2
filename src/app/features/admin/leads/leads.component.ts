import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../../../core/firebase.config';
import { ref, get, update, remove } from 'firebase/database';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  status: 'pending' | 'verified' | 'rejected';
  createdDate: string;
}

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="leads-wrapper">
      <!-- Search & Filters -->
      <div class="glass-card controls-card">
        <div class="search-box">
          <span class="material-icons-outlined">search</span>
          <input type="text" [(ngModel)]="searchQuery" (input)="filterLeads()" placeholder="Search by student name or phone...">
        </div>

        <div class="filter-dropdowns">
          <select [(ngModel)]="statusFilter" (change)="filterLeads()" class="filter-select">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Main leads list -->
      <div class="glass-card list-card">
        <div *ngIf="loading" class="text-center panel-loading">
          <span class="material-icons-outlined spin-icon">sync</span>
          <p>Fetching student application files...</p>
        </div>

        <div *ngIf="!loading && filteredLeads.length === 0" class="text-center panel-empty">
          <span class="material-icons-outlined">folder_open</span>
          <p>No student inquiries match the selection criteria.</p>
        </div>

        <div *ngIf="!loading && filteredLeads.length > 0" class="table-responsive">
          <table class="leads-full-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact Info</th>
                <th>Desired Program</th>
                <th>Date Received</th>
                <th>Status</th>
                <th>Action Controls</th>
              </tr>
            </thead>
            <tbody>
              <ng-container *ngFor="let lead of filteredLeads">
                <tr class="lead-row" [class.expanded]="expandedLeadId === lead.id" (click)="toggleExpand(lead.id)">
                  <td>
                    <div class="student-name">
                      <strong>{{ lead.name }}</strong>
                      <span class="material-icons-outlined expand-indicator">
                        {{ expandedLeadId === lead.id ? 'expand_less' : 'expand_more' }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="contact-flex">
                      <span>Ph: {{ lead.phone }}</span>
                      <span class="sub-email" *ngIf="lead.email">{{ lead.email }}</span>
                    </div>
                  </td>
                  <td>{{ getCourseLabel(lead.course) }}</td>
                  <td>{{ lead.createdDate }}</td>
                  <td>
                    <span class="status-badge" [class]="lead.status">
                      {{ lead.status }}
                    </span>
                  </td>
                  <td (click)="$event.stopPropagation()">
                    <div class="action-buttons">
                      <ng-container *ngIf="deleteConfirmId !== lead.id">
                        <button *ngIf="lead.status !== 'verified'" (click)="updateStatus(lead.id, 'verified')" class="btn-action check" title="Mark as Verified">
                          <span class="material-icons-outlined">check_circle</span>
                        </button>
                        <button *ngIf="lead.status !== 'rejected'" (click)="updateStatus(lead.id, 'rejected')" class="btn-action close" title="Mark as Rejected">
                          <span class="material-icons-outlined">cancel</span>
                        </button>
                        <button (click)="confirmDelete(lead.id)" class="btn-action delete" title="Delete Inquiry">
                          <span class="material-icons-outlined">delete_outline</span>
                        </button>
                      </ng-container>
                      <ng-container *ngIf="deleteConfirmId === lead.id">
                        <button (click)="cancelDelete()" class="btn-action cancel-del" title="Cancel Delete">
                          <span class="material-icons-outlined">close</span>
                        </button>
                        <button (click)="deleteLead(lead.id)" class="btn-action confirm-del" title="Confirm Delete">
                          <span class="material-icons-outlined">check</span>
                        </button>
                      </ng-container>
                    </div>
                  </td>
                </tr>

                <!-- Expanded Message row -->
                <tr class="details-row" *ngIf="expandedLeadId === lead.id">
                  <td colspan="6">
                    <div class="expanded-details">
                      <strong>Student Inquiry Message:</strong>
                      <p>{{ lead.message || 'No additional query description provided by the student.' }}</p>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leads-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Controls Styling */
    .controls-card {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 1.5rem;
      align-items: center;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(11, 25, 44, 0.15);
      border-radius: 8px;
      padding: 0.6rem 1rem;
      color: var(--text-muted);
    }
 
    .search-box input {
      background: transparent;
      border: none;
      color: var(--text-dark);
      width: 100%;
      font-size: 0.95rem;
    }
 
    .search-box input:focus {
      outline: none;
    }
 
    .filter-select {
      background: #ffffff;
      border: 1px solid rgba(11, 25, 44, 0.15);
      color: var(--text-dark);
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      cursor: pointer;
    }

    /* Table styling */
    .panel-loading, .panel-empty {
      padding: 4rem 0;
      color: var(--text-muted);
    }

    .spin-icon {
      font-size: 2.5rem;
      animation: spin 1.5s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .leads-full-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .leads-full-table th {
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .lead-row {
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .lead-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .lead-row.expanded {
      background: rgba(184, 0, 31, 0.03);
    }

    .lead-row td {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 0.9rem;
    }

    .student-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .expand-indicator {
      font-size: 1.2rem;
      color: var(--text-muted);
    }

    .contact-flex {
      display: flex;
      flex-direction: column;
    }

    .sub-email {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .status-badge {
      display: inline-block;
      padding: 0.3rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 4px;
    }

    .status-badge.pending { background: rgba(212, 175, 55, 0.15); color: var(--gold); }
    .status-badge.verified { background: rgba(52, 211, 153, 0.15); color: #34d399; }
    .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #f87171; }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .btn-action span {
      font-size: 1.15rem;
    }

    .btn-action.check:hover {
      background: rgba(52, 211, 153, 0.1);
      border-color: #34d399;
      color: #34d399;
    }

    .btn-action.close:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: #f87171;
      color: #f87171;
    }

    .btn-action.delete:hover {
      background: rgba(184, 0, 31, 0.1);
      border-color: var(--accent);
      color: #ff5274;
    }

    .btn-action.cancel-del:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      color: var(--text-light);
    }

    .btn-action.confirm-del {
      background: rgba(184, 0, 31, 0.2);
      border-color: var(--accent);
      color: #ff5274;
    }

    .btn-action.confirm-del:hover {
      background: rgba(184, 0, 31, 0.35);
      box-shadow: 0 0 8px rgba(255, 82, 116, 0.3);
    }

    /* Details Row */
    .details-row td {
      background: rgba(11, 25, 44, 0.03);
      border-bottom: 1px solid rgba(11, 25, 44, 0.05);
    }

    .expanded-details {
      padding: 1rem 2rem;
      font-size: 0.9rem;
    }

    .expanded-details strong {
      color: var(--accent);
      display: block;
      margin-bottom: 0.5rem;
    }

    .expanded-details p {
      color: var(--text-dark);
      margin: 0;
      line-height: 1.6;
    }

    @media (max-width: 992px) {
      .controls-card { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class LeadsComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  loading = true;
  deleteConfirmId = '';

  searchQuery = '';
  statusFilter = 'all';
  expandedLeadId: string | null = null;

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads() {
    this.loading = true;
    get(ref(db, 'leads'))
      .then((snapshot) => {
        const list: Lead[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            list.push({ id: key, ...data[key] } as Lead);
          });
          // Sort by createdAt desc
          list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
        }
        this.leads = list;
        this.filterLeads();
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error fetching leads:', error);
        this.loading = false;
      });
  }

  filterLeads() {
    let result = this.leads;

    // Search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        l => l.name.toLowerCase().includes(q) || l.phone.includes(q)
      );
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      result = result.filter(l => l.status === this.statusFilter);
    }

    this.filteredLeads = result;
  }

  toggleExpand(id: string) {
    if (this.expandedLeadId === id) {
      this.expandedLeadId = null;
    } else {
      this.expandedLeadId = id;
    }
  }

  updateStatus(id: string, newStatus: 'verified' | 'rejected') {
    const leadRef = ref(db, `leads/${id}`);
    update(leadRef, { status: newStatus })
      .then(() => {
        const lead = this.leads.find(l => l.id === id);
        if (lead) {
          lead.status = newStatus;
          this.filterLeads();
        }
      })
      .catch((error) => {
        console.error('Error updating status:', error);
      });
  }

  confirmDelete(id: string) {
    this.deleteConfirmId = id;
  }

  cancelDelete() {
    this.deleteConfirmId = '';
  }

  deleteLead(id: string) {
    this.deleteConfirmId = '';
    const leadRef = ref(db, `leads/${id}`);
    remove(leadRef)
      .then(() => {
        this.leads = this.leads.filter(l => l.id !== id);
        this.filterLeads();
        if (this.expandedLeadId === id) {
          this.expandedLeadId = null;
        }
      })
      .catch((error) => {
        console.error('Error deleting lead:', error);
        alert('Failed to delete inquiry: ' + error.message);
      });
  }

  getCourseLabel(val: string): string {
    if (!val) return 'General';
    return val.replace(/-/g, ' ').toUpperCase();
  }
}
