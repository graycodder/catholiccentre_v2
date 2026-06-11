import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { db } from '../../../core/firebase.config';
import { ref, get } from 'firebase/database';

interface BlogPost {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  tag: string;
  date: string;
  author?: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Header Banner -->
    <section class="blog-hero">
      <div class="container text-center animate-fade-in">
        <h1 class="serif-text">ANNOUNCEMENTS & BLOGS</h1>
        <p>Stay updated with our latest course admission notifications, campus events, and academic announcements.</p>
      </div>
    </section>

    <!-- Blogs Grid -->
    <section class="section-padding blogs-section">
      <div class="container">
        <div *ngIf="loading" class="loading-state text-center">
          <span class="material-icons-outlined spin-icon">sync</span>
          <p>Fetching latest updates...</p>
        </div>

        <div *ngIf="!loading" class="grid-cols-3 blogs-grid">
          <div *ngFor="let post of posts" class="glass-card blog-card">
            <div class="card-meta">
              <span class="badge badge-gold">{{ post.tag }}</span>
              <span class="blog-date">{{ post.date }}</span>
            </div>
            
            <h3 class="blog-title">{{ post.title }}</h3>
            <p class="blog-excerpt">{{ post.summary || getExcerpt(post.content) }}</p>
            
            <div class="blog-footer">
              <span class="author" *ngIf="post.author">By {{ post.author }}</span>
              <button (click)="openPost(post)" class="btn-outline read-btn">Read Full Article</button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && posts.length === 0" class="text-center empty-state">
          <span class="material-icons-outlined">feed</span>
          <p>No announcements or news articles published yet.</p>
        </div>
      </div>
    </section>

    <!-- Modal for reading full post -->
    <div class="modal-overlay" *ngIf="selectedPost" (click)="closePost()">
      <div class="modal-content glass-card gold-card" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closePost()">&times;</button>
        <div class="modal-meta">
          <span class="badge badge-gold">{{ selectedPost.tag }}</span>
          <span>{{ selectedPost.date }}</span>
          <span *ngIf="selectedPost.author" class="modal-author"> | By {{ selectedPost.author }}</span>
        </div>
        <h2 class="serif-text modal-title">{{ selectedPost.title }}</h2>
        <div class="modal-body">
          <p class="formatted-content">{{ selectedPost.content }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .blog-hero {
      padding: 6rem 0;
      background: linear-gradient(rgba(7, 15, 25, 0.85), rgba(7, 15, 25, 0.99)), url('https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1374&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .blog-hero h1 {
      font-size: 3rem;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }

    .loading-state {
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

    /* Blogs grid card */
    .blogs-grid {
      gap: 2.5rem;
    }

    .blog-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .blog-date {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .blog-title {
      font-size: 1.35rem;
      margin-bottom: 1rem;
      line-height: 1.3;
    }

    .blog-excerpt {
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      flex-grow: 1;
      color: var(--text-muted);
    }

    .blog-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 1rem;
    }

    .author {
      font-size: 0.8rem;
      color: var(--gold);
      font-weight: 500;
    }

    .read-btn {
      padding: 0.5rem 1rem !important;
      font-size: 0.8rem !important;
    }

    /* Modal Overlay styling */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(4, 9, 16, 0.85);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-content {
      width: 100%;
      max-width: 800px;
      max-height: 85vh;
      overflow-y: auto;
      position: relative;
      background: #0d1726;
      border: 1px solid rgba(212, 175, 55, 0.3);
      padding: 3rem;
    }

    .modal-close {
      position: absolute;
      top: 1.5rem;
      right: 2rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 2.5rem;
      cursor: pointer;
      line-height: 1;
      transition: var(--transition-smooth);
    }

    .modal-close:hover {
      color: var(--accent);
    }

    .modal-meta {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
    }

    .modal-author {
      color: var(--gold);
    }

    .modal-title {
      font-size: 2.25rem;
      margin-bottom: 2rem;
      line-height: 1.2;
    }

    .formatted-content {
      font-size: 1.05rem;
      line-height: 1.8;
      color: #e2e8f0;
      white-space: pre-wrap;
    }

    @media (max-width: 768px) {
      .modal-content {
        padding: 2rem 1.5rem;
      }
      .modal-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class BlogComponent implements OnInit {
  posts: BlogPost[] = [];
  selectedPost: BlogPost | null = null;
  loading = true;

  // Fallback seed announcements
  private defaultBlogs: BlogPost[] = [
    {
      title: 'Admissions Open for MG University UG/PG Courses 2026-27',
      content: 'St. Joseph\'s College, Thoppumpady is pleased to announce that registrations are open for the academic batch of 2026-27. We offer comprehensive classroom training and private candidate support for the Mahatma Gandhi University undergraduate and postgraduate programs, including B.Com (Taxation & Co-operation), B.A. (English, Economics, Sociology), and M.Com (Finance).\n\nInterested candidates are requested to visit the college administrative office at Catholic Centre or fill out our online contact lead form to request call-back assistance. Admission selection operates on a first-come, first-served basis due to seat limitations.',
      summary: 'Registrations are officially open for B.Com, B.A., and M.Com private coaching candidates under Mahatma Gandhi University for 2026-27.',
      tag: 'Admissions',
      date: 'June 08, 2026',
      author: 'Admin Office'
    },
    {
      title: 'New Intensive German Language Batches starting this Month',
      content: 'The International Language Academy (ILA) at Catholic Centre is scheduling new batches for German A1, A2, and B1 levels starting next Monday. Led by experienced language instructors, the batches focus on basic to professional conversational competence, targeting Goethe/Telc certification.\n\nClasses will run both in morning and afternoon sessions to accommodate working professionals and university students. Register your interest at our help desk today.',
      summary: 'Register for intensive German language certification courses (Goethe A1-B1) commencing next Monday at ILA.',
      tag: 'Language (ILA)',
      date: 'June 05, 2026',
      author: 'ILA Coordinator'
    },
    {
      title: 'Government-Certified Nursing Assistant Admissions Extended',
      content: 'The Adhunik Career Academy has extended its application submission date for the Nursing Assistant course. This program offers full clinical instruction, medical ethics briefings, and dedicated post-program hospital placement. To support students from economically weaker backgrounds, scholarship concessions are available. Contact the Director for fee waiver conditions.',
      summary: 'Adhunik Academy announces extension of application deadlines for the government-approved 6-month Nursing Assistant certificate program.',
      tag: 'Adhunik',
      date: 'June 02, 2026',
      author: 'Director CCC'
    }
  ];

  ngOnInit() {
    this.fetchBlogs();
  }

  fetchBlogs() {
    this.loading = true;
    const blogsRef = ref(db, 'blogs');
    get(blogsRef)
      .then((snapshot) => {
        const fetchedList: BlogPost[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            fetchedList.push({ id: key, ...data[key] } as BlogPost);
          });
        }

        if (fetchedList.length > 0) {
          this.posts = fetchedList;
        } else {
          this.posts = this.defaultBlogs;
        }
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error fetching blogs, using defaults:', error);
        this.posts = this.defaultBlogs;
        this.loading = false;
      });
  }

  getExcerpt(content: string): string {
    if (content.length > 130) {
      return content.substring(0, 130) + '...';
    }
    return content;
  }

  openPost(post: BlogPost) {
    this.selectedPost = post;
  }

  closePost() {
    this.selectedPost = null;
  }
}
