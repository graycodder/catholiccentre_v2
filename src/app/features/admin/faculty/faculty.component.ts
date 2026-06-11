import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../../../core/firebase.config';
import { ref, get, push, set, remove } from 'firebase/database';

interface FacultyMember {
  id: string;
  name: string;
  role: string;
  credentials: string;
  description: string;
}

@Component({
  selector: 'app-faculty',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="faculty-admin-wrapper">
      <div class="faculty-admin-grid">

        <!-- Form -->
        <div class="glass-card form-card">
          <h3>{{ isEditing ? 'Edit Staff Member' : 'Register Faculty Member' }}</h3>
          <p class="subtitle">
            {{ isEditing ? 'Update the staff member details below.' : 'Publish academic directors or instructors to the public directories.' }}
          </p>

          <form #facultyForm="ngForm" (ngSubmit)="handlePublish(facultyForm)" class="admin-form">
            <div class="form-group">
              <label class="form-label" for="name">Full Name *</label>
              <input type="text" id="name" name="name" [(ngModel)]="formData.name"
                     required #nameField="ngModel" class="form-control"
                     placeholder="e.g. Rev. Fr. Sunny Attapparambil">
              <span class="error-msg" *ngIf="nameField.invalid && nameField.touched">Faculty name is required</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="role">Designation / Role *</label>
              <input type="text" id="role" name="role" [(ngModel)]="formData.role"
                     required class="form-control"
                     placeholder="e.g. Principal & Director">
            </div>

            <div class="form-group">
              <label class="form-label" for="credentials">Credentials / Degrees *</label>
              <input type="text" id="credentials" name="credentials" [(ngModel)]="formData.credentials"
                     required class="form-control"
                     placeholder="e.g. M.B.A., M.Ed.">
            </div>

            <div class="form-group">
              <label class="form-label" for="description">Short Bio *</label>
              <textarea id="description" name="description" [(ngModel)]="formData.description"
                        required rows="4" class="form-control"
                        placeholder="Describe their academic focus, expertise, or years of service..."></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="facultyForm.invalid || publishing" class="btn-gold publish-btn">
                <span class="material-icons-outlined spin-icon" *ngIf="publishing">sync</span>
                <span>{{ publishing ? 'Saving...' : (isEditing ? 'Update Staff Member' : 'Add Faculty Member') }}</span>
              </button>
              <button type="button" *ngIf="isEditing" (click)="cancelEdit(facultyForm)" class="btn-cancel">
                <span class="material-icons-outlined">close</span>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Table List -->
        <div class="glass-card table-card">
          <h3>Registered Staff Members</h3>

          <div *ngIf="loading" class="text-center table-loading">
            <span class="material-icons-outlined spin-icon">sync</span>
            <p>Loading directories...</p>
          </div>

          <div *ngIf="!loading && faculty.length === 0" class="text-center table-empty">
            <span class="material-icons-outlined">badge</span>
            <p>No faculty profiles stored in database yet. Add one on the left!</p>
          </div>

          <div *ngIf="!loading && faculty.length > 0" class="table-responsive">
            <table class="admin-faculty-table">
              <thead>
                <tr>
                  <th>Name / Degrees</th>
                  <th>Designation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let member of faculty" [class.editing-row]="editingId === member.id">
                  <td>
                    <strong>{{ member.name }}</strong>
                    <p class="credentials-tag">{{ member.credentials }}</p>
                  </td>
                  <td>{{ member.role }}</td>
                  <td>
                    <div class="action-btns">
                      <button (click)="startEdit(member)" class="btn-action edit" title="Edit Profile">
                        <span class="material-icons-outlined">edit</span>
                      </button>
                      <button (click)="deleteMember(member.id)" class="btn-action delete" title="Delete Profile">
                        <span class="material-icons-outlined">delete_outline</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .faculty-admin-wrapper {
      display: flex;
      flex-direction: column;
    }

    .faculty-admin-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 2rem;
      align-items: flex-start;
    }

    .form-card h3, .table-card h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
    }

    .admin-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .publish-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.8rem 0;
    }

    .btn-cancel {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem 1rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-muted);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: var(--transition-smooth);
    }

    .btn-cancel:hover {
      background: rgba(255,255,255,0.08);
      color: var(--text-light);
    }

    .error-msg {
      color: #ff5274;
      font-size: 0.75rem;
      display: block;
      margin-top: 0.25rem;
    }

    .spin-icon {
      font-size: 1.25rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* Table styling */
    .table-loading, .table-empty {
      padding: 4rem 0;
      color: var(--text-muted);
    }

    .table-responsive {
      overflow-x: auto;
      margin-top: 1.5rem;
    }

    .admin-faculty-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .admin-faculty-table th {
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .admin-faculty-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 0.875rem;
      vertical-align: middle;
    }

    .editing-row {
      background: rgba(212, 175, 55, 0.04);
      border-left: 3px solid var(--gold);
    }

    .credentials-tag {
      font-size: 0.75rem;
      color: var(--gold);
      margin: 0.15rem 0 0 0;
      font-weight: 500;
    }

    /* Action buttons */
    .action-btns {
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
      font-size: 1rem;
    }

    .btn-action.edit:hover {
      background: rgba(212, 175, 55, 0.1);
      border-color: var(--gold);
      color: var(--gold);
    }

    .btn-action.delete:hover {
      background: rgba(184, 0, 31, 0.1);
      border-color: var(--accent);
      color: #ff5274;
    }

    @media (max-width: 992px) {
      .faculty-admin-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FacultyComponent implements OnInit {
  faculty: FacultyMember[] = [];
  loading = true;
  publishing = false;
  isEditing = false;
  editingId = '';

  formData = {
    name: '',
    role: '',
    credentials: '',
    description: ''
  };

  ngOnInit() {
    this.loadFaculty();
  }

  loadFaculty() {
    this.loading = true;
    get(ref(db, 'faculty'))
      .then((snapshot) => {
        const list: FacultyMember[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            list.push({ id: key, ...data[key] } as FacultyMember);
          });
        }
        this.faculty = list;
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error fetching faculty list:', error);
        this.loading = false;
      });
  }

  handlePublish(form: any) {
    if (form.invalid) return;
    this.publishing = true;

    if (this.isEditing && this.editingId) {
      // Update existing
      set(ref(db, `faculty/${this.editingId}`), { ...this.formData })
        .then(() => {
          this.publishing = false;
          this.cancelEdit(form);
          this.loadFaculty();
        })
        .catch((error) => {
          this.publishing = false;
          console.error('Error updating faculty member:', error);
        });
    } else {
      // Add new
      const newFacultyRef = push(ref(db, 'faculty'));
      set(newFacultyRef, { ...this.formData })
        .then(() => {
          this.publishing = false;
          form.resetForm();
          this.loadFaculty();
        })
        .catch((error) => {
          this.publishing = false;
          console.error('Error adding faculty doc:', error);
        });
    }
  }

  startEdit(member: FacultyMember) {
    this.isEditing = true;
    this.editingId = member.id;
    this.formData = {
      name: member.name,
      role: member.role,
      credentials: member.credentials,
      description: member.description
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(form: any) {
    this.isEditing = false;
    this.editingId = '';
    form.resetForm();
    this.formData = { name: '', role: '', credentials: '', description: '' };
  }

  deleteMember(id: string) {
    if (confirm('Permanently remove this faculty member from database?')) {
      remove(ref(db, `faculty/${id}`))
        .then(() => this.loadFaculty())
        .catch((error) => console.error('Error deleting faculty profile:', error));
    }
  }
}
