import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../../../core/firebase.config';
import { ref, get, push, set, remove } from 'firebase/database';

interface Course {
  id: string;
  name: string;
  category: 'college' | 'language' | 'adhunik' | 'fastrack';
  duration: string;
  description: string;
  eligibility: string;
  highlights: string[];
  imageUrl?: string;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="courses-admin-wrapper">
      <!-- Grid split: Form & Table -->
      <div class="courses-admin-grid">
        <!-- Course Form -->
        <div class="glass-card form-card">
          <h3>{{ isEditing ? 'Edit Course Offering' : 'Publish New Course' }}</h3>
          <p class="subtitle">Fill out the fields below to {{ isEditing ? 'update this' : 'add a' }} course on the public pages</p>

          <form #courseForm="ngForm" (ngSubmit)="handlePublish(courseForm)" class="admin-form">
            <div class="form-group">
              <label class="form-label" for="name">Course Title *</label>
              <input type="text" id="name" name="name" [(ngModel)]="formData.name" required #nameField="ngModel" class="form-control" placeholder="e.g. B.Com Computer Applications">
              <span class="error-msg" *ngIf="nameField.invalid && nameField.touched">Course title is required</span>
            </div>

            <div class="grid-cols-2 inline-fields">
              <div class="form-group">
                <label class="form-label" for="category">Academy Division *</label>
                <select id="category" name="category" [(ngModel)]="formData.category" required class="form-control">
                  <option value="college">St. Joseph's College</option>
                  <option value="fastrack">Fastrack Computer Center</option>
                  <option value="adhunik">Xtreem Coaching Center</option>
                  <option value="language">ILA</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="duration">Duration Label *</label>
                <input type="text" id="duration" name="duration" [(ngModel)]="formData.duration" required class="form-control" placeholder="e.g. 3 Years (6 Semesters)">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="eligibility">Eligibility Criteria *</label>
              <input type="text" id="eligibility" name="eligibility" [(ngModel)]="formData.eligibility" required class="form-control" placeholder="e.g. Plus Two Pass or Equivalent">
            </div>

            <div class="form-group">
              <label class="form-label" for="description">Course Description</label>
              <textarea id="description" name="description" [(ngModel)]="formData.description" rows="3" class="form-control" placeholder="Briefly describe the course objectives and content..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="highlightsInput">Highlights / Bullet Points</label>
              <input type="text" id="highlightsInput" name="highlightsInput" [(ngModel)]="highlightsInput" class="form-control" placeholder="Separate items with commas (e.g. Govt. Certified, Placement support)">
            </div>

            <!-- Course Image Upload & URL options -->
            <div class="form-group">
              <label class="form-label">
                <span class="material-icons-outlined label-icon">add_photo_alternate</span>
                Course Image / Brochure Image
              </label>

              <!-- Option 1: File selector from computer -->
              <div class="file-upload-container">
                <label class="file-upload-label" for="photoFile">
                  <span class="material-icons-outlined">cloud_upload</span>
                  <span>{{ isUploading ? 'Uploading...' : 'Choose image from computer' }}</span>
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
                <input type="url" id="imageUrl" name="imageUrl" [(ngModel)]="formData.imageUrl"
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
                    Open Google Drive Storage Folder
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
                  Image preview active
                </div>
              </div>
              <div class="photo-preview-error" *ngIf="photoUrlError">
                <span class="material-icons-outlined">error_outline</span>
                Could not load preview. Make sure the file is shared publicly ("Anyone with the link").
              </div>
            </div>

            <button type="submit" [disabled]="courseForm.invalid || publishing || isUploading" class="btn-gold publish-btn">
              <span class="material-icons-outlined spin-icon" *ngIf="publishing">sync</span>
              <span>{{ publishing ? (isEditing ? 'Saving...' : 'Publishing...') : (isEditing ? 'Update Course Offering' : 'Add Course Offering') }}</span>
            </button>
            <button *ngIf="isEditing" type="button" (click)="cancelEdit(courseForm)" class="btn-outline cancel-btn" style="width: 100%; margin-top: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.8rem 0;">
              <span>Cancel Edit</span>
            </button>
          </form>
        </div>

        <!-- Course Table List -->
        <div class="glass-card table-card">
          <div class="table-header-flex">
            <h3>Published Offerings</h3>
            
            <div class="table-filter-wrap">
              <label for="filterCategory" class="filter-label">Filter Category:</label>
              <select id="filterCategory" [(ngModel)]="selectedFilterCategory" class="filter-select">
                <option value="all">All Divisions</option>
                <option value="college">St. Joseph's College</option>
                <option value="fastrack">Fastrack Computer Center</option>
                <option value="adhunik">Xtreem Coaching Center</option>
                <option value="language">ILA</option>
              </select>
            </div>
          </div>
          
          <div *ngIf="loading" class="text-center table-loading">
            <span class="material-icons-outlined spin-icon">sync</span>
            <p>Loading course offerings...</p>
          </div>

          <div *ngIf="!loading && courses.length === 0" class="text-center table-empty">
            <span class="material-icons-outlined">school</span>
            <p>No courses published in database yet. Add one on the left!</p>
          </div>

          <div *ngIf="!loading && courses.length > 0 && getFilteredCourses().length === 0" class="text-center table-empty">
            <span class="material-icons-outlined">filter_list_off</span>
            <p>No courses found matching the selected category filter.</p>
          </div>

          <div *ngIf="!loading && getFilteredCourses().length > 0" class="table-responsive">
            <table class="admin-courses-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let course of getFilteredCourses()">
                  <td>
                    <div class="table-image-container">
                      <img *ngIf="course.imageUrl" [src]="convertGoogleDriveUrl(course.imageUrl)" 
                           alt="{{ course.name }}" class="table-thumb" referrerpolicy="no-referrer">
                      <div *ngIf="!course.imageUrl" class="table-thumb-fallback">
                        <span class="material-icons-outlined">image</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong class="course-title">{{ course.name }}</strong>
                    <p class="desc-preview">{{ getExcerpt(course.description) }}</p>
                  </td>
                  <td>
                    <span class="badge" [class.badge-burgundy]="course.category==='college'||course.category==='adhunik'" [class.badge-gold]="course.category==='language'||course.category==='fastrack'">
                      {{ getCategoryLabel(course.category) }}
                    </span>
                  </td>
                  <td class="course-duration">{{ course.duration }}</td>
                  <td>
                    <div class="actions-flex">
                      <ng-container *ngIf="deleteConfirmId !== course.id">
                        <button (click)="editCourse(course)" class="btn-action edit" title="Edit Course">
                          <span class="material-icons-outlined">edit</span>
                        </button>
                        <button (click)="confirmDelete(course.id)" class="btn-action delete" title="Delete Course">
                          <span class="material-icons-outlined">delete_outline</span>
                        </button>
                      </ng-container>
                      <ng-container *ngIf="deleteConfirmId === course.id">
                        <button (click)="cancelDelete()" class="btn-action cancel-del" title="Cancel Delete">
                          <span class="material-icons-outlined">close</span>
                        </button>
                        <button (click)="deleteCourse(course.id)" class="btn-action confirm-del" title="Confirm Delete">
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
    .courses-admin-wrapper {
      display: flex;
      flex-direction: column;
    }

    .courses-admin-grid {
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

    .inline-fields {
      gap: 1.5rem;
    }

    .admin-form select {
      background: #ffffff;
    }

    .publish-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.8rem 0;
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

    .admin-courses-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .admin-courses-table th {
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .admin-courses-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 0.875rem;
    }

    .course-title {
      color: #000000;
    }

    .course-duration {
      color: #000000;
    }

    .desc-preview {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0.25rem 0 0 0;
    }

    .actions-flex {
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

    /* File upload styles */
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

    /* Photo preview */
    .photo-preview-wrap {
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .photo-preview-img {
      width: 120px;
      height: 72px;
      border-radius: 6px;
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

    /* Table Thumbnail Styles */
    .table-image-container {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .table-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .table-thumb-fallback {
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .table-thumb-fallback span {
      font-size: 1.25rem;
    }

    .table-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .table-header-flex h3 {
      margin-bottom: 0 !important;
    }

    .table-filter-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .filter-select {
      background: #ffffff;
      color: #0b192c;
      border: 1px solid rgba(11, 25, 44, 0.15);
      border-radius: 6px;
      padding: 0.4rem 2rem 0.4rem 0.75rem;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      outline: none;
      transition: var(--transition-smooth);
    }

    .filter-select:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
    }

    @media (max-width: 992px) {
      .courses-admin-grid { grid-template-columns: 1fr; }
      .inline-fields { grid-template-columns: 1fr; gap: 0; }
    }
  `]
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  selectedFilterCategory = 'all';
  loading = true;
  publishing = false;
  isEditing = false;
  editingCourseId: string | null = null;
  deleteConfirmId = '';
  photoPreviewUrl = '';
  photoUrlError = false;
  uploadProgress: number | null = null;
  isUploading = false;
  appsScriptUrl = '';

  formData = {
    name: '',
    category: 'college' as 'college' | 'language' | 'adhunik' | 'fastrack',
    duration: '',
    description: '',
    eligibility: '',
    imageUrl: ''
  };

  highlightsInput = '';

  ngOnInit() {
    this.loadCourses();
    this.loadConfig();
  }

  loadCourses() {
    this.loading = true;
    get(ref(db, 'courses'))
      .then((snapshot) => {
        const list: Course[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            list.push({ id: key, ...data[key] } as Course);
          });
        }
        this.courses = list;
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error fetching courses list:', error);
        this.loading = false;
      });
  }

  editCourse(course: Course) {
    this.isEditing = true;
    this.editingCourseId = course.id;
    this.formData = {
      name: course.name,
      category: course.category,
      duration: course.duration,
      description: course.description || '',
      eligibility: course.eligibility,
      imageUrl: course.imageUrl || ''
    };
    this.highlightsInput = course.highlights ? course.highlights.join(', ') : '';
    this.photoPreviewUrl = course.imageUrl ? this.convertGoogleDriveUrl(course.imageUrl) : '';
    this.photoUrlError = false;
    
    // Scroll form into view for better user experience
    const formElement = document.querySelector('.form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cancelEdit(form: any) {
    this.isEditing = false;
    this.editingCourseId = null;
    this.photoPreviewUrl = '';
    this.photoUrlError = false;
    form.resetForm({
      category: 'college'
    });
    this.highlightsInput = '';
    this.formData.imageUrl = '';
  }

  handlePublish(form: any) {
    if (form.invalid) return;

    this.publishing = true;
    const highlights = this.highlightsInput
      ? this.highlightsInput.split(',').map(h => h.trim()).filter(h => h.length > 0)
      : [];

    if (this.isEditing && this.editingCourseId) {
      const courseRef = ref(db, `courses/${this.editingCourseId}`);
      set(courseRef, {
        ...this.formData,
        description: this.formData.description || '',
        highlights
      })
        .then(() => {
          this.publishing = false;
          this.isEditing = false;
          this.editingCourseId = null;
          this.photoPreviewUrl = '';
          this.photoUrlError = false;
          form.resetForm({
            category: 'college'
          });
          this.highlightsInput = '';
          this.loadCourses();
        })
        .catch((error) => {
          this.publishing = false;
          console.error('Error updating course in Realtime Database:', error);
        });
    } else {
      const coursesRef = ref(db, 'courses');
      const newCourseRef = push(coursesRef);
      set(newCourseRef, {
        ...this.formData,
        description: this.formData.description || '',
        highlights
      })
        .then(() => {
          this.publishing = false;
          this.photoPreviewUrl = '';
          this.photoUrlError = false;
          form.resetForm({
            category: 'college'
          });
          this.highlightsInput = '';
          this.loadCourses();
        })
        .catch((error) => {
          this.publishing = false;
          console.error('Error adding course doc to Realtime Database:', error);
        });
    }
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

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!this.appsScriptUrl) {
      alert('Please configure your Google Apps Script Web App URL first in the Google Drive Upload Configuration section under the Leadership Board page.');
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
        filename: `course_${Date.now()}_${file.name}`,
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
            this.formData.imageUrl = response.url;
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

  confirmDelete(id: string) {
    this.deleteConfirmId = id;
  }

  cancelDelete() {
    this.deleteConfirmId = '';
  }

  deleteCourse(id: string) {
    this.deleteConfirmId = '';
    const courseRef = ref(db, `courses/${id}`);
    remove(courseRef)
      .then(() => {
        // If the deleted course was currently being edited, cancel the edit state
        if (this.isEditing && this.editingCourseId === id) {
          this.isEditing = false;
          this.editingCourseId = null;
          this.highlightsInput = '';
        }
        this.loadCourses();
      })
      .catch((error) => {
        console.error('Error deleting course:', error);
        alert('Failed to delete course: ' + error.message);
      });
  }

  getExcerpt(text: string): string {
    if (!text) return '';
    if (text.length > 80) return text.substring(0, 80) + '...';
    return text;
  }

  getCategoryLabel(cat: string): string {
    switch (cat) {
      case 'college': return "St. Joseph's College";
      case 'language': return 'ILA';
      case 'adhunik': return 'Xtreem Coaching Center';
      case 'fastrack': return 'Fastrack Computer Center';
      default: return cat;
    }
  }

  getFilteredCourses(): Course[] {
    if (this.selectedFilterCategory === 'all') {
      return this.courses;
    }
    return this.courses.filter(course => course.category === this.selectedFilterCategory);
  }
}
