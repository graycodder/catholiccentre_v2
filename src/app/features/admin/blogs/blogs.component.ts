import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { db } from '../../../core/firebase.config';
import { ref, get, push, set, remove } from 'firebase/database';

interface BlogPost {
  id: string;
  title: string;
  tag: string;
  date: string;
  content: string;
  author: string;
  summary?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="blogs-admin-wrapper">
      <div class="blogs-admin-grid">

        <!-- Form Panel -->
        <div class="glass-card form-card">
          <h3>{{ isEditing ? 'Edit Announcement' : 'Create Announcement' }}</h3>
          <p class="subtitle">
            {{ isEditing ? 'Update the blog or announcement details below.' : 'Publish academic notices, board dates, or language batch details.' }}
          </p>

          <form #blogForm="ngForm" (ngSubmit)="handlePublish(blogForm)" class="admin-form">

            <div class="form-group">
              <label class="form-label" for="title">Article Title *</label>
              <input type="text" id="title" name="title" [(ngModel)]="formData.title"
                     required #titleField="ngModel" class="form-control"
                     placeholder="e.g. Admission Registrations open for 2026 Batch">
              <span class="error-msg" *ngIf="titleField.invalid && titleField.touched">Article title is required</span>
            </div>

            <div class="grid-cols-2 inline-fields">
              <div class="form-group">
                <label class="form-label" for="tag">Category Tag *</label>
                <select id="tag" name="tag" [(ngModel)]="formData.tag" required class="form-control">
                  <option value="Admissions">Admissions</option>
                  <option value="Language (ILA)">Language (ILA)</option>
                  <option value="Xtreem Coaching Center">Xtreem Coaching Center</option>
                  <option value="Fastrack">Fastrack IT</option>
                  <option value="General Notice">General Notice</option>
                  <option value="Events">Events &amp; Feast</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="author">Author Designation *</label>
                <input type="text" id="author" name="author" [(ngModel)]="formData.author"
                       required class="form-control"
                       placeholder="e.g. Admin Office or Coordinator">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="summary">Short Summary *</label>
              <input type="text" id="summary" name="summary" [(ngModel)]="formData.summary"
                     required class="form-control"
                     placeholder="Brief summary displayed on the card preview...">
            </div>

            <div class="form-group">
              <label class="form-label" for="content">Full Article Content *</label>
              <textarea id="content" name="content" [(ngModel)]="formData.content"
                        required rows="5" class="form-control"
                        placeholder="Type the full detailed announcement content here..."></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="blogForm.invalid || publishing" class="btn-gold publish-btn">
                <span class="material-icons-outlined spin-icon" *ngIf="publishing">sync</span>
                <span>{{ publishing ? 'Saving...' : (isEditing ? 'Update Announcement' : 'Publish Announcement') }}</span>
              </button>
              <button type="button" *ngIf="isEditing" (click)="cancelEdit(blogForm)" class="btn-cancel">
                <span class="material-icons-outlined">close</span>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Table List -->
        <div class="glass-card table-card">
          <h3>Published News &amp; Notices</h3>

          <div *ngIf="loading" class="text-center table-loading">
            <span class="material-icons-outlined spin-icon">sync</span>
            <p>Loading published feed...</p>
          </div>

          <div *ngIf="!loading && posts.length === 0" class="text-center table-empty">
            <span class="material-icons-outlined">campaign</span>
            <p>No notices published in database yet. Add one on the left!</p>
          </div>

          <div *ngIf="!loading && posts.length > 0" class="table-responsive">
            <table class="admin-blogs-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Tag</th>
                  <th>Published Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let post of posts" [class.editing-row]="editingId === post.id">
                  <td>
                    <strong>{{ post.title }}</strong>
                    <p class="summary-preview" *ngIf="post.summary">{{ post.summary }}</p>
                  </td>
                  <td>
                    <span class="badge badge-gold">{{ post.tag }}</span>
                  </td>
                  <td>{{ post.date }}</td>
                  <td>
                    <div class="action-btns">
                      <ng-container *ngIf="deleteConfirmId !== post.id">
                        <button (click)="startEdit(post)" class="btn-action edit" title="Edit Post">
                          <span class="material-icons-outlined">edit</span>
                        </button>
                        <button (click)="confirmDelete(post.id)" class="btn-action delete" title="Delete Post">
                          <span class="material-icons-outlined">delete_outline</span>
                        </button>
                      </ng-container>
                      <ng-container *ngIf="deleteConfirmId === post.id">
                        <button (click)="cancelDelete()" class="btn-action cancel-del" title="Cancel Delete">
                          <span class="material-icons-outlined">close</span>
                        </button>
                        <button (click)="deletePost(post.id)" class="btn-action confirm-del" title="Confirm Delete">
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
    .blogs-admin-wrapper {
      display: flex;
      flex-direction: column;
    }

    .blogs-admin-grid {
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

    .admin-blogs-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .admin-blogs-table th {
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .admin-blogs-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 0.875rem;
      vertical-align: middle;
    }

    .editing-row {
      background: rgba(212, 175, 55, 0.04);
      border-left: 3px solid var(--gold);
    }

    .summary-preview {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0.25rem 0 0 0;
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
      .blogs-admin-grid { grid-template-columns: 1fr; }
      .inline-fields { grid-template-columns: 1fr; gap: 0; }
    }
  `]
})
export class BlogsComponent implements OnInit {
  posts: BlogPost[] = [];
  loading = true;
  publishing = false;
  isEditing = false;
  editingId = '';
  deleteConfirmId = '';

  formData = {
    title: '',
    tag: 'Admissions',
    author: '',
    summary: '',
    content: ''
  };

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    get(ref(db, 'blogs'))
      .then((snapshot) => {
        const list: BlogPost[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            list.push({ id: key, ...data[key] } as BlogPost);
          });
          // Sort newest first
          list.sort((a: any, b: any) => (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime()));
        }
        this.posts = list;
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error fetching blogs admin list:', error);
        this.loading = false;
      });
  }

  handlePublish(form: any) {
    if (form.invalid) return;
    this.publishing = true;

    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    if (this.isEditing && this.editingId) {
      // Update: preserve original date & createdAt, just update fields
      const existingPost = this.posts.find(p => p.id === this.editingId);
      set(ref(db, `blogs/${this.editingId}`), {
        title: this.formData.title,
        tag: this.formData.tag,
        author: this.formData.author,
        summary: this.formData.summary,
        content: this.formData.content,
        date: existingPost?.date || formattedDate,
        createdAt: existingPost?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
        .then(() => {
          this.publishing = false;
          this.cancelEdit(form);
          this.loadPosts();
        })
        .catch((error) => {
          this.publishing = false;
          console.error('Error updating announcement:', error);
        });
    } else {
      // Create new
      const newBlogRef = push(ref(db, 'blogs'));
      set(newBlogRef, {
        ...this.formData,
        date: formattedDate,
        createdAt: new Date().toISOString()
      })
        .then(() => {
          this.publishing = false;
          form.resetForm({ tag: 'Admissions' });
          this.formData.tag = 'Admissions';
          this.loadPosts();
        })
        .catch((error) => {
          this.publishing = false;
          console.error('Error adding announcement:', error);
        });
    }
  }

  startEdit(post: BlogPost) {
    this.isEditing = true;
    this.editingId = post.id;
    this.formData = {
      title: post.title,
      tag: post.tag,
      author: post.author,
      summary: post.summary || '',
      content: post.content
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(form: any) {
    this.isEditing = false;
    this.editingId = '';
    form.resetForm({ tag: 'Admissions' });
    this.formData = {
      title: '',
      tag: 'Admissions',
      author: '',
      summary: '',
      content: ''
    };
  }

  confirmDelete(id: string) {
    this.deleteConfirmId = id;
  }

  cancelDelete() {
    this.deleteConfirmId = '';
  }

  deletePost(id: string) {
    this.deleteConfirmId = '';
    remove(ref(db, `blogs/${id}`))
      .then(() => this.loadPosts())
      .catch((error) => {
        console.error('Error deleting post:', error);
        alert('Failed to delete post: ' + error.message);
      });
  }
}
