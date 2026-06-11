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
                  <option value="language">Language Academy (German)</option>
                  <option value="adhunik">Adhunik Healthcare</option>
                  <option value="fastrack">Fastrack IT Academy</option>
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
              <label class="form-label" for="description">Course Description *</label>
              <textarea id="description" name="description" [(ngModel)]="formData.description" required rows="3" class="form-control" placeholder="Briefly describe the course objectives and content..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="highlightsInput">Highlights / Bullet Points</label>
              <input type="text" id="highlightsInput" name="highlightsInput" [(ngModel)]="highlightsInput" class="form-control" placeholder="Separate items with commas (e.g. Govt. Certified, Placement support)">
            </div>

            <button type="submit" [disabled]="courseForm.invalid || publishing" class="btn-gold publish-btn">
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
          <h3>Published Offerings</h3>
          
          <div *ngIf="loading" class="text-center table-loading">
            <span class="material-icons-outlined spin-icon">sync</span>
            <p>Loading course offerings...</p>
          </div>

          <div *ngIf="!loading && courses.length === 0" class="text-center table-empty">
            <span class="material-icons-outlined">school</span>
            <p>No courses published in database yet. Add one on the left!</p>
          </div>

          <div *ngIf="!loading && courses.length > 0" class="table-responsive">
            <table class="admin-courses-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let course of courses">
                  <td>
                    <strong>{{ course.name }}</strong>
                    <p class="desc-preview">{{ getExcerpt(course.description) }}</p>
                  </td>
                  <td>
                    <span class="badge" [class.badge-burgundy]="course.category==='college'||course.category==='adhunik'" [class.badge-gold]="course.category==='language'||course.category==='fastrack'">
                      {{ course.category }}
                    </span>
                  </td>
                  <td>{{ course.duration }}</td>
                  <td>
                    <div class="actions-flex">
                      <button (click)="editCourse(course)" class="btn-action edit" title="Edit Course">
                        <span class="material-icons-outlined">edit</span>
                      </button>
                      <button (click)="deleteCourse(course.id)" class="btn-action delete" title="Delete Course">
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
      background: #0f172a;
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

    @media (max-width: 992px) {
      .courses-admin-grid { grid-template-columns: 1fr; }
      .inline-fields { grid-template-columns: 1fr; gap: 0; }
    }
  `]
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  publishing = false;
  isEditing = false;
  editingCourseId: string | null = null;

  formData = {
    name: '',
    category: 'college' as 'college' | 'language' | 'adhunik' | 'fastrack',
    duration: '',
    description: '',
    eligibility: ''
  };

  highlightsInput = '';

  ngOnInit() {
    this.loadCourses();
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
      description: course.description,
      eligibility: course.eligibility
    };
    this.highlightsInput = course.highlights ? course.highlights.join(', ') : '';
    
    // Scroll form into view for better user experience
    const formElement = document.querySelector('.form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cancelEdit(form: any) {
    this.isEditing = false;
    this.editingCourseId = null;
    form.resetForm({
      category: 'college'
    });
    this.highlightsInput = '';
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
        highlights
      })
        .then(() => {
          this.publishing = false;
          this.isEditing = false;
          this.editingCourseId = null;
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
        highlights
      })
        .then(() => {
          this.publishing = false;
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

  deleteCourse(id: string) {
    if (confirm('Permanently delete this course offering from database? This cannot be undone.')) {
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
        });
    }
  }

  getExcerpt(text: string): string {
    if (text.length > 80) return text.substring(0, 80) + '...';
    return text;
  }
}
