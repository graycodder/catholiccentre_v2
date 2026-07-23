import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../../../core/firebase.config';
import { ref, get, push, set, remove } from 'firebase/database';
import { GoogleDriveService } from '../../../core/services/google-drive.service';

interface Teacher {
  id: string;
  name: string;
  role: string;
  credentials: string;
  description: string;
  photoUrl?: string;
}

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="teachers-admin-wrapper">
      <div class="teachers-admin-grid">

        <!-- Form -->
        <div class="glass-card form-card">
          <h3>{{ isEditing ? 'Edit Teacher Member' : 'Register Honorable Teacher' }}</h3>
          <p class="subtitle">
            {{ isEditing ? 'Update the teacher member details below.' : 'Publish academic educators or instructors to the public directories.' }}
          </p>

          <form #teacherForm="ngForm" (ngSubmit)="handlePublish(teacherForm)" class="admin-form">
            <div class="form-group">
              <label class="form-label" for="name">Full Name *</label>
              <input type="text" id="name" name="name" [(ngModel)]="formData.name"
                     required #nameField="ngModel" class="form-control"
                     placeholder="e.g. Dr. Thomas George">
              <span class="error-msg" *ngIf="nameField.invalid && nameField.touched">Teacher name is required</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="role">Designation / Role *</label>
              <input type="text" id="role" name="role" [(ngModel)]="formData.role"
                     required class="form-control"
                     placeholder="e.g. Senior Instructor">
            </div>

            <div class="form-group">
              <label class="form-label" for="credentials">Credentials / Degrees (Optional)</label>
              <input type="text" id="credentials" name="credentials" [(ngModel)]="formData.credentials"
                     class="form-control"
                     placeholder="e.g. M.A., B.Ed., Ph.D.">
            </div>

            <div class="form-group">
              <label class="form-label" for="description">Short Bio</label>
              <textarea id="description" name="description" [(ngModel)]="formData.description"
                        rows="4" class="form-control"
                        placeholder="Describe their academic focus, expertise, or years of service..."></textarea>
            </div>

            <!-- Teacher Photo Upload & URL options -->
            <div class="form-group">
              <label class="form-label">
                <span class="material-icons-outlined label-icon">add_photo_alternate</span>
                Teacher Photograph
              </label>

              <!-- Option 1: File selector from computer -->
              <div class="file-upload-container">
                <label class="file-upload-label" for="photoFile">
                  <span class="material-icons-outlined">cloud_upload</span>
                  <span>{{ isUploading ? 'Uploading...' : 'Choose photo from computer' }}</span>
                  <input type="file" id="photoFile" accept="image/*" (change)="onFileSelected($event)" class="file-input" [disabled]="isUploading">
                </label>
                
                <!-- Upload Progress Bar -->
                <div class="progress-bar-container" *ngIf="isUploading && uploadProgress !== null">
                  <div class="progress-bar" [style.width.%]="uploadProgress"></div>
                  <span class="progress-text">{{ uploadProgress }}% uploaded</span>
                </div>
              </div>

              <div class="or-separator">
                <span>OR</span>
              </div>

              <!-- Option 2: Paste manual link -->
              <div class="manual-url-container">
                <input type="url" id="photoUrl" name="photoUrl" [(ngModel)]="formData.photoUrl"
                       class="form-control"
                       placeholder="Paste Google Drive share link here..."
                       (ngModelChange)="onPhotoUrlChange($event)">
                <span class="hint-msg">
                  If using Google Drive: Share the file → Copy link → Paste above. We'll convert it automatically.
                </span>

                <div class="drive-folder-link-wrap">
                  <a href="https://drive.google.com/drive/folders/1IJJS_1bU2FrkCbEmIggNcFmRWsFmzdfP?usp=sharing" 
                     target="_blank" 
                     class="btn-drive-link">
                    <span class="material-icons-outlined">folder_shared</span>
                    Open Google Drive Folder
                  </a>
                </div>
              </div>

              <!-- Live photo preview -->
              <div class="photo-preview-wrap" *ngIf="photoPreviewUrl">
                <img [src]="photoPreviewUrl" alt="Preview" class="photo-preview-img"
                     referrerpolicy="no-referrer"
                     (error)="onPreviewError()">
                <div class="preview-label">
                  <span class="material-icons-outlined">check_circle</span>
                  Photo preview active
                </div>
              </div>
              <div class="photo-preview-error" *ngIf="photoUrlError">
                <span class="material-icons-outlined">error_outline</span>
                Could not load preview. Make sure the file is shared publicly ("Anyone with the link").
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="teacherForm.invalid || publishing" class="btn-gold publish-btn">
                <span class="material-icons-outlined spin-icon" *ngIf="publishing">sync</span>
                <span>{{ publishing ? 'Saving...' : (isEditing ? 'Update Teacher Member' : 'Add Teacher Member') }}</span>
              </button>
              <button type="button" *ngIf="isEditing" (click)="cancelEdit(teacherForm)" class="btn-cancel">
                <span class="material-icons-outlined">close</span>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Table List -->
        <div class="glass-card table-card">
          <h3>Registered Honorable Teachers</h3>

          <div *ngIf="loading" class="text-center table-loading">
            <span class="material-icons-outlined spin-icon">sync</span>
            <p>Loading directories...</p>
          </div>

          <div *ngIf="!loading && teachers.length === 0" class="text-center table-empty">
            <span class="material-icons-outlined">badge</span>
            <p>No teacher profiles stored in database yet. Add one on the left!</p>
          </div>

          <div *ngIf="!loading && teachers.length > 0" class="table-responsive">
            <table class="admin-teachers-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name / Degrees</th>
                  <th>Designation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let member of teachers" [class.editing-row]="editingId === member.id">
                  <td>
                    <!-- Show photo if available, else initials avatar -->
                    <img *ngIf="member.photoUrl && !imgError[member.id]"
                         [src]="convertGoogleDriveUrl(member.photoUrl)"
                         alt="{{ member.name }}"
                         referrerpolicy="no-referrer"
                         class="table-photo"
                         (error)="imgError[member.id] = true">
                    <div *ngIf="!member.photoUrl || imgError[member.id]"
                         class="avatar-preview"
                         [class.bg-gold]="true">
                      {{ getInitials(member.name) }}
                    </div>
                  </td>
                  <td>
                    <strong class="member-name">{{ member.name }}</strong>
                    <p class="credentials-tag" *ngIf="member.credentials && member.credentials.trim()">{{ member.credentials }}</p>
                  </td>
                  <td class="member-role">{{ member.role }}</td>
                  <td>
                    <div class="action-btns">
                      <ng-container *ngIf="deleteConfirmId !== member.id">
                        <button (click)="startEdit(member)" class="btn-action edit" title="Edit Profile">
                          <span class="material-icons-outlined">edit</span>
                        </button>
                        <button (click)="confirmDelete(member.id)" class="btn-action delete" title="Delete Profile">
                          <span class="material-icons-outlined">delete_outline</span>
                        </button>
                      </ng-container>
                      <ng-container *ngIf="deleteConfirmId === member.id">
                        <button (click)="cancelDelete()" class="btn-action cancel-del" title="Cancel Delete">
                          <span class="material-icons-outlined">close</span>
                        </button>
                        <button (click)="deleteTeacher(member.id)" class="btn-action confirm-del" title="Confirm Delete">
                          <span class="material-icons-outlined">check</span>
                        </button>
                      </ng-container>
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
    .teachers-admin-wrapper {
      display: flex;
      flex-direction: column;
    }

    .teachers-admin-grid {
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

    .label-icon {
      font-size: 1rem;
      vertical-align: middle;
      margin-right: 0.25rem;
      color: var(--gold);
    }

    .hint-msg {
      font-size: 0.72rem;
      color: var(--text-muted);
      display: block;
      margin-top: 0.35rem;
      line-height: 1.4;
    }

    .file-upload-container {
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 1.25rem;
      text-align: center;
      transition: var(--transition-smooth);
    }

    .file-upload-container:hover {
      border-color: var(--gold);
      background: rgba(212, 175, 55, 0.02);
    }

    .file-upload-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 500;
      transition: var(--transition-smooth);
    }

    .file-upload-label:hover {
      color: var(--text-light);
    }

    .file-upload-label span.material-icons-outlined {
      font-size: 2rem;
      color: var(--gold);
    }

    .file-input {
      display: none;
    }

    .progress-bar-container {
      margin-top: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      height: 6px;
      position: relative;
      overflow: hidden;
    }

    .progress-bar {
      background: linear-gradient(90deg, var(--gold) 0%, #ffdf7a 100%);
      height: 100%;
      width: 0;
      transition: width 0.2s ease;
      border-radius: 4px;
    }

    .progress-text {
      display: block;
      font-size: 0.7rem;
      color: var(--gold);
      margin-top: 0.35rem;
      font-weight: 600;
    }

    .or-separator {
      text-align: center;
      margin: 1.25rem 0;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .btn-drive-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--gold);
      background: rgba(212, 175, 55, 0.08);
      border: 1px dashed rgba(212, 175, 55, 0.3);
      padding: 0.5rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      text-decoration: none;
      transition: var(--transition-smooth);
    }

    .btn-drive-link:hover {
      background: rgba(212, 175, 55, 0.15);
      border-color: var(--gold);
      box-shadow: 0 2px 10px rgba(212, 175, 55, 0.1);
    }

    .btn-drive-link span {
      font-size: 1.1rem;
    }

    .photo-preview-wrap {
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .photo-preview-img {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--gold);
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.25);
    }

    .preview-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: #34d399;
    }

    .preview-label span {
      font-size: 1rem;
      color: #34d399;
    }

    .photo-preview-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      color: #ff5274;
      font-size: 0.78rem;
      line-height: 1.4;
    }

    .photo-preview-error span {
      font-size: 1rem;
      flex-shrink: 0;
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
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .table-loading span, .table-empty span {
      font-size: 2.5rem;
    }

    .table-responsive {
      overflow-x: auto;
      margin-top: 1.5rem;
    }

    .admin-teachers-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .admin-teachers-table th {
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .admin-teachers-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 0.875rem;
      vertical-align: middle;
    }

    .member-name {
      color: #000000;
    }

    .member-role {
      color: #000000;
    }

    .editing-row {
      background: rgba(212, 175, 55, 0.04);
      border-left: 3px solid var(--gold);
    }

    /* Table photo */
    .table-photo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(212, 175, 55, 0.4);
    }

    /* Avatar Preview */
    .avatar-preview {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      color: #000;
    }

    .bg-gold {
      background: linear-gradient(135deg, var(--gold) 0%, #a3811f 100%);
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

    @media (max-width: 992px) {
      .teachers-admin-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class TeachersComponent implements OnInit {
  teachers: Teacher[] = [];
  loading = true;
  publishing = false;
  isEditing = false;
  editingId = '';
  photoPreviewUrl = '';
  imgError: Record<string, boolean> = {};
  photoUrlError = false;
  uploadProgress: number | null = null;
  isUploading = false;
  appsScriptUrl = '';
  deleteConfirmId = '';

  formData = {
    name: '',
    role: '',
    credentials: '',
    description: '',
    photoUrl: ''
  };

  constructor(private googleDriveService: GoogleDriveService) {}

  ngOnInit() {
    this.loadTeachers();
    this.loadConfig();
  }

  loadConfig() {
    get(ref(db, 'settings/appsScriptUrl'))
      .then((snapshot) => {
        if (snapshot.exists()) {
          this.appsScriptUrl = snapshot.val();
        }
      })
      .catch((err) => {
        console.error('Failed to load appsScriptUrl:', err);
      });
  }

  /**
   * Converts any Google Drive sharing URL to an embeddable image URL.
   */
  convertGoogleDriveUrl(url: string): string {
    if (!url || !url.trim()) return '';
    url = url.trim();

    const ensureSize = (lh3Url: string): string => {
      if (/=[swh]\d/.test(lh3Url) || lh3Url.endsWith('=s0')) return lh3Url;
      return lh3Url + '=s0';
    };

    if (url.includes('lh3.googleusercontent.com')) return ensureSize(url);

    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      return `https://lh3.googleusercontent.com/d/${fileMatch[1]}=s0`;
    }

    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}=s0`;
    }

    return url;
  }

  onPhotoUrlChange(value: string) {
    this.photoUrlError = false;
    this.photoPreviewUrl = '';
    if (value && value.trim()) {
      this.photoPreviewUrl = this.convertGoogleDriveUrl(value.trim());
    }
  }

  onPreviewError() {
    this.photoPreviewUrl = '';
    this.photoUrlError = true;
  }

  async onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Photo must be smaller than 15MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('File must be an image');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 20;
    this.photoUrlError = false;

    try {
      this.uploadProgress = 50;
      const result = await this.googleDriveService.uploadFile(file, 'Teachers');
      this.uploadProgress = 100;
      this.formData.photoUrl = result.url;
      this.photoPreviewUrl = result.url;
    } catch (err: any) {
      console.error('Google Drive Upload error:', err);
      alert('Upload failed: ' + (err.message || 'Error uploading file to Google Drive.'));
    } finally {
      this.isUploading = false;
      this.uploadProgress = null;
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).filter(p => p.length > 1 && !/^(Rev\.|Fr\.|Dr\.|Rt\.|Mr\.|Ms\.|Mrs\.|Sr\.)$/i.test(p));
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  loadTeachers() {
    this.loading = true;
    this.imgError = {};
    get(ref(db, 'faculty'))
      .then((snapshot) => {
        const list: Teacher[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            const item = data[key];
            if (item && item.type === 'teacher') {
              list.push({ id: key, ...item } as Teacher);
            }
          });
        }
        this.teachers = list;
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error fetching teachers list:', error);
        this.loading = false;
      });
  }

  handlePublish(form: any) {
    if (form.invalid) return;
    this.publishing = true;

    const rawPhotoUrl = (this.formData.photoUrl || '').trim();
    const convertedPhotoUrl = rawPhotoUrl ? this.convertGoogleDriveUrl(rawPhotoUrl) : '';

    const payload: any = {
      name: this.formData.name,
      role: this.formData.role,
      credentials: this.formData.credentials,
      description: this.formData.description || '',
      type: 'teacher'
    };

    if (convertedPhotoUrl) {
      payload.photoUrl = convertedPhotoUrl;
    }

    if (this.isEditing && this.editingId) {
      // Update existing
      set(ref(db, `faculty/${this.editingId}`), payload)
        .then(() => {
          this.publishing = false;
          this.cancelEdit(form);
          this.loadTeachers();
        })
        .catch((error) => {
          this.publishing = false;
          console.error('Error updating teacher:', error);
        });
    } else {
      // Add new
      const newTeacherRef = push(ref(db, 'faculty'));
      set(newTeacherRef, payload)
        .then(() => {
          this.publishing = false;
          form.resetForm();
          this.photoPreviewUrl = '';
          this.loadTeachers();
        })
        .catch((error) => {
          this.publishing = false;
          console.error('Error adding teacher:', error);
        });
    }
  }

  startEdit(member: Teacher) {
    this.isEditing = true;
    this.editingId = member.id;
    this.photoUrlError = false;
    this.formData = {
      name: member.name,
      role: member.role,
      credentials: member.credentials,
      description: member.description || '',
      photoUrl: member.photoUrl || ''
    };
    this.photoPreviewUrl = member.photoUrl || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(form: any) {
    this.isEditing = false;
    this.editingId = '';
    this.photoPreviewUrl = '';
    this.photoUrlError = false;
    form.resetForm();
    this.formData = { name: '', role: '', credentials: '', description: '', photoUrl: '' };
  }

  confirmDelete(id: string) {
    this.deleteConfirmId = id;
  }

  cancelDelete() {
    this.deleteConfirmId = '';
  }

  deleteTeacher(id: string) {
    this.deleteConfirmId = '';
    remove(ref(db, `faculty/${id}`))
      .then(() => this.loadTeachers())
      .catch((error) => {
        console.error('Error deleting teacher profile:', error);
        alert('Failed to delete teacher member: ' + error.message);
      });
  }
}
