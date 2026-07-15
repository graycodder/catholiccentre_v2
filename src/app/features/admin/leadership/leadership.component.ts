import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../../../core/firebase.config';
import { ref, get, push, set, remove } from 'firebase/database';

interface Leader {
  id: string;
  name: string;
  role: string;
  credentials: string;
  description: string;
  initials: string;
  avatarColor: string;
  photoUrl?: string;
}

@Component({
  selector: 'app-leadership',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="leadership-admin-wrapper">
      <div class="leadership-admin-grid">

        <!-- Form Panel -->
        <div class="glass-card form-card">
          <h3>{{ isEditing ? 'Edit Leader Profile' : 'Add Leader Profile' }}</h3>
          <p class="subtitle">
            {{ isEditing ? 'Update the leadership member details below.' : 'Publish a new member to the Leadership Board on the About page.' }}
          </p>

          <form #leaderForm="ngForm" (ngSubmit)="handleSubmit(leaderForm)" class="admin-form">

            <div class="form-group">
              <label class="form-label" for="name">Full Name *</label>
              <input type="text" id="name" name="name" [(ngModel)]="formData.name"
                     required #nameField="ngModel" class="form-control"
                     placeholder="e.g. Rev. Fr. Sunny Attapparambil">
              <span class="error-msg" *ngIf="nameField.invalid && nameField.touched">Full name is required</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="role">Designation / Role *</label>
              <input type="text" id="role" name="role" [(ngModel)]="formData.role"
                     required class="form-control"
                     placeholder="e.g. Principal & Director">
            </div>

            <div class="form-group">
              <label class="form-label" for="credentials">Credentials / Degrees</label>
              <input type="text" id="credentials" name="credentials" [(ngModel)]="formData.credentials"
                     class="form-control"
                     placeholder="e.g. M.B.A., B.Th., M.Ed.">
            </div>

            <div class="form-group">
              <label class="form-label" for="description">Short Bio</label>
              <textarea id="description" name="description" [(ngModel)]="formData.description"
                        rows="3" class="form-control"
                        placeholder="Describe their academic focus, expertise, or years of service..."></textarea>
            </div>

            <!-- Leader Photo Upload & URL options -->
            <div class="form-group">
              <label class="form-label">
                <span class="material-icons-outlined label-icon">add_photo_alternate</span>
                Leader Photograph
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
                    Open Leadership Google Drive
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

            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="initials">Avatar Initials (fallback)</label>
                <input type="text" id="initials" name="initials" [(ngModel)]="formData.initials"
                       maxlength="2" class="form-control"
                       placeholder="e.g. SA">
                <span class="hint-msg">Used when no photo is provided.</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="avatarColor">Avatar Colour (fallback)</label>
                <select id="avatarColor" name="avatarColor" [(ngModel)]="formData.avatarColor" class="form-control">
                  <option value="gold">Gold</option>
                  <option value="accent">Burgundy / Red</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="leaderForm.invalid || saving" class="btn-gold publish-btn">
                <span class="material-icons-outlined spin-icon" *ngIf="saving">sync</span>
                <span>{{ saving ? 'Saving...' : (isEditing ? 'Update Leader Profile' : 'Add Leader Profile') }}</span>
              </button>
              <button type="button" *ngIf="isEditing" (click)="cancelEdit(leaderForm)" class="btn-cancel">
                <span class="material-icons-outlined">close</span>
                <span>Cancel Edit</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Table Panel -->
        <div class="glass-card table-card">
          <h3>Current Leadership Board</h3>

          <div *ngIf="loading" class="text-center table-loading">
            <span class="material-icons-outlined spin-icon">sync</span>
            <p>Loading leadership data...</p>
          </div>

          <div *ngIf="!loading && leaders.length === 0" class="text-center table-empty">
            <span class="material-icons-outlined">supervisor_account</span>
            <p>No leadership profiles found in database. Add one using the form!</p>
          </div>

          <div *ngIf="!loading && leaders.length > 0" class="table-responsive">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name / Credentials</th>
                  <th>Designation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let leader of leaders" [class.editing-row]="editingId === leader.id">
                  <td>
                    <!-- Show photo if available, else initials avatar -->
                    <img *ngIf="leader.photoUrl && !imgError[leader.id]"
                         [src]="convertGoogleDriveUrl(leader.photoUrl)"
                         alt="{{ leader.name }}"
                         referrerpolicy="no-referrer"
                         class="table-photo"
                         (error)="imgError[leader.id] = true">
                    <div *ngIf="!leader.photoUrl || imgError[leader.id]"
                         class="avatar-preview"
                         [class.bg-gold]="leader.avatarColor === 'gold'"
                         [class.bg-accent]="leader.avatarColor === 'accent'">
                      {{ leader.initials || getInitials(leader.name) }}
                    </div>
                  </td>
                  <td>
                    <strong class="member-name">{{ leader.name }}</strong>
                    <p class="credentials-tag">{{ leader.credentials }}</p>
                  </td>
                  <td class="member-role">{{ leader.role }}</td>
                  <td>
                    <div class="action-btns">
                      <ng-container *ngIf="deleteConfirmId !== leader.id">
                        <button (click)="startEdit(leader)" class="btn-action edit" title="Edit Profile">
                          <span class="material-icons-outlined">edit</span>
                        </button>
                        <button (click)="confirmDelete(leader.id)" class="btn-action delete" title="Delete Profile">
                          <span class="material-icons-outlined">delete_outline</span>
                        </button>
                      </ng-container>
                      <ng-container *ngIf="deleteConfirmId === leader.id">
                        <button (click)="cancelDelete()" class="btn-action cancel-del" title="Cancel Delete">
                          <span class="material-icons-outlined">close</span>
                        </button>
                        <button (click)="deleteLeader(leader.id)" class="btn-action confirm-del" title="Confirm Delete">
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
    .leadership-admin-wrapper {
      display: flex;
      flex-direction: column;
    }

    .leadership-admin-grid {
      display: grid;
      grid-template-columns: 1fr 1.6fr;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .hint-msg {
      font-size: 0.72rem;
      color: var(--text-muted);
      display: block;
      margin-top: 0.35rem;
      line-height: 1.4;
    }

    .apps-script-config-wrap {
      margin-bottom: 1.5rem;
    }

    .btn-config-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: var(--gold);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .btn-config-toggle:hover {
      background: rgba(212, 175, 55, 0.1);
      box-shadow: var(--shadow-glow);
    }

    .config-content {
      margin-top: 0.75rem;
      background: rgba(15, 23, 42, 0.95) !important;
      border: 1px solid rgba(212, 175, 55, 0.2) !important;
      padding: 1.25rem !important;
    }

    .config-content h4 {
      color: var(--gold);
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .config-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .config-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .config-input {
      flex: 1;
      font-size: 0.85rem;
      padding: 0.5rem 0.75rem;
    }

    .btn-save-config {
      padding: 0.5rem 1.25rem;
      font-size: 0.85rem;
      border-radius: 8px;
      height: 36px;
    }

    .drive-folder-link-wrap {
      margin-top: 0.75rem;
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
      position: relative;
    }

    .or-separator::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      z-index: 1;
    }

    .or-separator span {
      background: #0f172a; /* matches glass card background */
      padding: 0 0.75rem;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 700;
      position: relative;
      z-index: 2;
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

    /* Photo preview */
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

    /* Table */
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

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .admin-table th {
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .admin-table td {
      padding: 0.85rem 1rem;
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

    /* Avatar Preview (initials fallback) */
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

    .bg-accent {
      background: linear-gradient(135deg, #ff5274 0%, var(--accent) 100%);
      color: #fff !important;
    }

    .credentials-tag {
      font-size: 0.75rem;
      color: var(--gold);
      margin: 0.15rem 0 0 0;
      font-weight: 500;
    }

    /* Action Buttons */
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
      .leadership-admin-grid { grid-template-columns: 1fr; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class LeadershipComponent implements OnInit {
  leaders: Leader[] = [];
  loading = true;
  saving = false;
  isEditing = false;
  editingId = '';
  photoPreviewUrl = '';
  imgError: Record<string, boolean> = {};
  photoUrlError = false;
  uploadProgress: number | null = null;
  isUploading = false;
  appsScriptUrl = '';
  showConfig = false;
  deleteConfirmId = '';

  formData = {
    name: '',
    role: '',
    credentials: '',
    description: '',
    initials: '',
    avatarColor: 'gold',
    photoUrl: ''
  };

  ngOnInit() {
    this.loadLeaders();
    this.loadConfig();
  }

  saveConfig() {
    if (!this.appsScriptUrl || !this.appsScriptUrl.trim()) {
      alert('Please enter a valid Google Apps Script Web App URL.');
      return;
    }
    set(ref(db, 'settings/appsScriptUrl'), this.appsScriptUrl.trim())
      .then(() => {
        alert('Apps Script URL saved successfully!');
        this.showConfig = false;
      })
      .catch((err) => {
        alert('Failed to save configuration: ' + err.message);
      });
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
   *
   * Google's uc?export=view endpoint is blocked for web embedding.
   * The correct format is: https://lh3.googleusercontent.com/d/FILE_ID
   *
   * Handles:
   *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   *   https://drive.google.com/open?id=FILE_ID
   *   https://drive.google.com/uc?export=view&id=FILE_ID  (old broken format)
   */
  convertGoogleDriveUrl(url: string): string {
    if (!url || !url.trim()) return '';
    url = url.trim();

    // Helper: ensure lh3 URL has the =s0 size suffix for direct serving
    const ensureSize = (lh3Url: string): string => {
      if (/=[swh]\d/.test(lh3Url) || lh3Url.endsWith('=s0')) return lh3Url;
      return lh3Url + '=s0';
    };

    // Already correct lh3 format — ensure size suffix
    if (url.includes('lh3.googleusercontent.com')) return ensureSize(url);

    // Extract file ID from /file/d/ID/ format
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      return `https://lh3.googleusercontent.com/d/${fileMatch[1]}=s0`;
    }

    // Extract file ID from ?id=ID or &id=ID format (open?id= and uc?id=)
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}=s0`;
    }

    // Not a recognised Drive URL — return as-is (could be any public image URL)
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

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!this.appsScriptUrl) {
      alert('Please configure your Google Apps Script Web App URL first in the "Google Drive Upload Configuration" section at the bottom of the page.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Photo must be smaller than 15MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('File must be an image');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 10;
    this.photoUrlError = false;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.uploadProgress = 30;
      const base64Data = (reader.result as string).split(',')[1];
      
      const payload = {
        filename: `leader_${Date.now()}_${file.name}`,
        mimeType: file.type,
        base64: base64Data
      };

      this.uploadProgress = 50;

      const xhr = new XMLHttpRequest();
      xhr.open('POST', this.appsScriptUrl, true);
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = 50 + Math.round((e.loaded / e.total) * 45);
          this.uploadProgress = percent;
        }
      };

      xhr.onload = () => {
        this.isUploading = false;
        this.uploadProgress = null;
        
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.status === 'success') {
            this.formData.photoUrl = response.url;
            this.photoPreviewUrl = this.convertGoogleDriveUrl(response.url);
          } else {
            alert('Upload failed: ' + (response.message || 'Unknown error'));
          }
        } catch (err) {
          console.error('Error parsing response:', err, xhr.responseText);
          alert('Upload request sent. If the photo does not preview, please verify your Apps Script URL and Google Drive folder permissions.');
        }
      };

      xhr.onerror = (err) => {
        console.error('XHR Upload error:', err);
        this.isUploading = false;
        this.uploadProgress = null;
        alert('Failed to connect to Apps Script. Please verify the URL and your internet connection.');
      };

      xhr.send(JSON.stringify(payload));
    };

    reader.onerror = (err) => {
      console.error('File reading error:', err);
      this.isUploading = false;
      this.uploadProgress = null;
      alert('Failed to read the file.');
    };
  }

  loadLeaders() {
    this.loading = true;
    this.imgError = {};
    get(ref(db, 'leadership'))
      .then((snapshot) => {
        const list: Leader[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            list.push({ id: key, ...data[key] } as Leader);
          });
        }
        this.leaders = list;
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error loading leadership data:', error);
        this.loading = false;
      });
  }

  handleSubmit(form: any) {
    if (form.invalid) return;
    this.saving = true;

    const rawPhotoUrl = (this.formData.photoUrl || '').trim();
    const convertedPhotoUrl = rawPhotoUrl ? this.convertGoogleDriveUrl(rawPhotoUrl) : '';

    const payload: any = {
      name: this.formData.name,
      role: this.formData.role,
      credentials: this.formData.credentials,
      description: this.formData.description,
      initials: this.formData.initials || this.getInitials(this.formData.name),
      avatarColor: this.formData.avatarColor
    };

    if (convertedPhotoUrl) {
      payload.photoUrl = convertedPhotoUrl;
    }

    if (this.isEditing && this.editingId) {
      set(ref(db, `leadership/${this.editingId}`), payload)
        .then(() => {
          this.saving = false;
          this.cancelEdit(form);
          this.loadLeaders();
        })
        .catch((error) => {
          this.saving = false;
          console.error('Error updating leader:', error);
        });
    } else {
      const newRef = push(ref(db, 'leadership'));
      set(newRef, payload)
        .then(() => {
          this.saving = false;
          form.resetForm();
          this.formData.avatarColor = 'gold';
          this.photoPreviewUrl = '';
          this.loadLeaders();
        })
        .catch((error) => {
          this.saving = false;
          console.error('Error adding leader:', error);
        });
    }
  }

  startEdit(leader: Leader) {
    this.isEditing = true;
    this.editingId = leader.id;
    this.photoUrlError = false;
    this.formData = {
      name: leader.name,
      role: leader.role,
      credentials: leader.credentials,
      description: leader.description,
      initials: leader.initials || '',
      avatarColor: leader.avatarColor || 'gold',
      photoUrl: leader.photoUrl || ''
    };
    // Show preview if existing photo
    this.photoPreviewUrl = leader.photoUrl || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(form: any) {
    this.isEditing = false;
    this.editingId = '';
    this.photoPreviewUrl = '';
    this.photoUrlError = false;
    form.resetForm();
    this.formData = {
      name: '', role: '', credentials: '', description: '',
      initials: '', avatarColor: 'gold', photoUrl: ''
    };
  }

  confirmDelete(id: string) {
    this.deleteConfirmId = id;
  }

  cancelDelete() {
    this.deleteConfirmId = '';
  }

  deleteLeader(id: string) {
    this.deleteConfirmId = '';
    remove(ref(db, `leadership/${id}`))
      .then(() => {
        this.loadLeaders();
      })
      .catch((error) => {
        console.error('Error deleting leader:', error);
        alert('Failed to delete leader: ' + error.message);
      });
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).filter(p => p.length > 1 && !/^(Rev\.|Fr\.|Dr\.|Rt\.|Mr\.|Ms\.|Mrs\.|Sr\.)$/i.test(p));
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
}
