import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  imageUrl?: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

        <div *ngIf="!loading" class="grid-cols-2 blogs-grid">
          <div *ngFor="let post of posts" class="glass-card blog-card">
            <a href="https://cochincatholiccentre.com/blog?id={{ post.id || post.title }}" (click)="openPost(post); $event.preventDefault()" class="blog-card-image-link">
              <div class="blog-card-image">
                <img *ngIf="post.imageUrl" [src]="convertGoogleDriveUrl(post.imageUrl)" alt="{{ post.title }}" referrerpolicy="no-referrer">
                <div *ngIf="!post.imageUrl" class="blog-card-fallback-image">
                  <span class="material-icons-outlined">campaign</span>
                </div>
              </div>
            </a>
            
            <div class="blog-card-content">
              <div class="card-meta">
                <span class="badge badge-gold">{{ post.tag }}</span>
                <span class="blog-date">{{ post.date }}</span>
              </div>
              
              <a href="https://cochincatholiccentre.com/blog?id={{ post.id || post.title }}" (click)="openPost(post); $event.preventDefault()" class="blog-title-link">
                <h3 class="blog-title">{{ post.title }}</h3>
              </a>
              <p class="blog-excerpt">{{ post.summary || getExcerpt(post.content) }}</p>
              
              <div class="blog-footer">
                <span class="author" *ngIf="post.author">By {{ post.author }}</span>
                <div class="blog-actions">
                  <button (click)="shareToWhatsApp(post, $event)" class="btn-share whatsapp-share-btn" title="Share on WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.785 9.785 0 0 0-6.978-2.879C5.819 1 1.393 5.372 1.39 10.801c-.001 1.73.454 3.42 1.316 4.908l-.988 3.613 3.706-.972zm10.194-6.038c-.282-.141-1.67-.824-1.928-.918-.258-.094-.446-.141-.634.141-.188.281-.727.918-.891 1.101-.164.183-.328.207-.61.066-.282-.141-1.188-.438-2.261-1.397-.837-.747-1.402-1.669-1.566-1.95-.164-.282-.018-.434.123-.574.127-.127.282-.328.422-.492.141-.164.188-.282.282-.47.094-.188.047-.353-.023-.494-.071-.141-.634-1.528-.868-2.09-.229-.55-.48-.475-.66-.485-.17-.008-.364-.01-.559-.01-.195 0-.512.073-.78.365-.268.291-1.024 1.002-1.024 2.445 0 1.443 1.049 2.836 1.195 3.03.146.194 2.064 3.15 5.001 4.417.699.301 1.244.481 1.668.615.702.223 1.34.192 1.844.117.562-.083 1.67-.682 1.904-1.34.234-.657.234-1.22.164-1.34-.07-.12-.258-.188-.54-.328z"/>
                    </svg>
                  </button>
                  <a href="https://cochincatholiccentre.com/blog?id={{ post.id || post.title }}" (click)="openPost(post); $event.preventDefault()" class="btn-outline read-btn">Read Full Article</a>
                </div>
              </div>
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
      <div class="modal-content" (click)="$event.stopPropagation()">
        <button class="modal-close" (click)="closePost()">&times;</button>
        
        <div class="modal-inner-container">
          <div class="modal-image-wrap" *ngIf="selectedPost.imageUrl">
            <img [src]="convertGoogleDriveUrl(selectedPost.imageUrl)" alt="{{ selectedPost.title }}" referrerpolicy="no-referrer">
          </div>
          
          <div class="modal-meta">
            <div class="meta-left">
              <span class="badge badge-gold">{{ selectedPost.tag }}</span>
              <span>{{ selectedPost.date }}</span>
              <span *ngIf="selectedPost.author" class="modal-author"> | By {{ selectedPost.author }}</span>
            </div>
            <button (click)="shareToWhatsApp(selectedPost, $event)" class="btn-share-modal whatsapp-share-btn" title="Share on WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.966a9.785 9.785 0 0 0-6.978-2.879C5.819 1 1.393 5.372 1.39 10.801c-.001 1.73.454 3.42 1.316 4.908l-.988 3.613 3.706-.972zm10.194-6.038c-.282-.141-1.67-.824-1.928-.918-.258-.094-.446-.141-.634.141-.188.281-.727.918-.891 1.101-.164.183-.328.207-.61.066-.282-.141-1.188-.438-2.261-1.397-.837-.747-1.402-1.669-1.566-1.95-.164-.282-.018-.434.123-.574.127-.127.282-.328.422-.492.141-.164.188-.282.282-.47.094-.188.047-.353-.023-.494-.071-.141-.634-1.528-.868-2.09-.229-.55-.48-.475-.66-.485-.17-.008-.364-.01-.559-.01-.195 0-.512.073-.78.365-.268.291-1.024 1.002-1.024 2.445 0 1.443 1.049 2.836 1.195 3.03.146.194 2.064 3.15 5.001 4.417.699.301 1.244.481 1.668.615.702.223 1.34.192 1.844.117.562-.083 1.67-.682 1.904-1.34.234-.657.234-1.22.164-1.34-.07-.12-.258-.188-.54-.328z"/>
              </svg>
              <span>Share on WhatsApp</span>
            </button>
          </div>
          <h2 class="serif-text modal-title">{{ selectedPost.title }}</h2>
          <div class="modal-body">
            <p class="formatted-content">{{ selectedPost.content }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .blog-hero {
      padding: 6rem 0;
      background: linear-gradient(rgba(252, 251, 249, 0.75), rgba(252, 251, 249, 0.96)), url('https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1374&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-bottom: 1px solid rgba(11, 25, 44, 0.06);
    }

    .blog-hero h1 {
      font-size: 3rem;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }

    .blog-hero p {
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
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
      padding: 0 !important;
      overflow: hidden;
    }

    .blog-card-image {
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(184, 0, 31, 0.05) 100%);
      border-bottom: 1px solid rgba(11, 25, 44, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .blog-card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .blog-card:hover .blog-card-image img {
      transform: scale(1.05);
    }

    .blog-card-fallback-image {
      color: var(--gold);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .blog-card-fallback-image span {
      font-size: 3rem;
    }

    .blog-card-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
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
      transition: color var(--transition-smooth);
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
      border-top: 1px solid rgba(11, 25, 44, 0.08);
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
      background: rgba(11, 25, 44, 0.95);
      backdrop-filter: blur(10px);
      z-index: 2000;
      overflow-y: auto;
    }

    .modal-content {
      width: 100%;
      min-height: 100vh;
      background: #faf9f6; /* warm ivory light white */
      color: #0b192c; /* dark text for readability */
      padding: 6rem 2rem 4rem 2rem;
      box-sizing: border-box;
      position: relative;
    }

    .modal-inner-container {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
    }

    .modal-image-wrap {
      width: 100%;
      height: 450px;
      overflow: hidden;
      border-radius: 12px;
      margin-bottom: 2.5rem;
      border: 1px solid rgba(212, 175, 55, 0.35);
      box-shadow: 0 10px 30px rgba(11, 25, 44, 0.1);
    }

    .modal-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .modal-close {
      position: fixed;
      top: 2rem;
      right: 3rem;
      background: rgba(11, 25, 44, 0.05);
      border: 1px solid rgba(11, 25, 44, 0.1);
      color: #0b192c;
      font-size: 2rem;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-smooth);
      z-index: 2010;
    }

    .modal-close:hover {
      background: var(--accent);
      color: #ffffff;
      transform: rotate(90deg);
    }

    .modal-meta {
      font-size: 0.9rem;
      color: rgba(11, 25, 44, 0.6);
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .modal-author {
      color: var(--gold-hover);
      font-weight: 600;
    }

    .modal-title {
      font-size: 2.75rem;
      color: #0b192c;
      margin-bottom: 2.5rem;
      line-height: 1.25;
      font-weight: 700;
    }

    .modal-body {
      border-top: 1px solid rgba(11, 25, 44, 0.1);
      padding-top: 2.5rem;
    }

    .formatted-content {
      font-size: 1.15rem;
      line-height: 1.9;
      color: #1e293b;
      white-space: pre-wrap;
      font-family: inherit;
    }

    @media (max-width: 768px) {
      .modal-content {
        padding: 5rem 1.25rem 3rem 1.25rem;
      }
      .modal-inner-container {
        max-width: 100%;
      }
      .modal-image-wrap {
        height: 250px;
        margin-bottom: 1.75rem;
      }
      .modal-title {
        font-size: 2rem;
        margin-bottom: 1.75rem;
      }
      .modal-close {
        top: 1rem;
        right: 1rem;
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
      }
    }

    .blog-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-share {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid rgba(11, 25, 44, 0.15);
      background: transparent;
      color: #25d366; /* WhatsApp Green */
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .btn-share:hover {
      background: rgba(37, 211, 102, 0.1);
      border-color: #25d366;
      transform: translateY(-2px);
    }

    .btn-share svg {
      display: block;
    }

    .meta-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-share-modal {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid rgba(37, 211, 102, 0.3);
      background: rgba(37, 211, 102, 0.05);
      color: #128c7e; /* darker whatsapp green for text readability on light bg */
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .btn-share-modal:hover {
      background: #25d366;
      color: #ffffff;
      border-color: #25d366;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);
    }

    .btn-share-modal svg {
      display: block;
    }

    .blog-title-link {
      text-decoration: none;
      color: inherit;
    }

    .blog-title-link:hover .blog-title {
      color: var(--gold);
    }

    .blog-card-image-link {
      display: block;
      width: 100%;
      cursor: pointer;
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
      id: 'admission-mgu',
      title: 'Admissions Open for MG University UG/PG Courses 2026-27',
      content: 'St. Joseph\'s College, Thoppumpady is pleased to announce that registrations are open for the academic batch of 2026-27. We offer comprehensive classroom training and private candidate support for the Mahatma Gandhi University undergraduate and postgraduate programs, including B.Com (Taxation & Co-operation), B.A. (English, Economics, Sociology), and M.Com (Finance).\n\nInterested candidates are requested to visit the college administrative office at Catholic Centre or fill out our online contact lead form to request call-back assistance. Admission selection operates on a first-come, first-served basis due to seat limitations.',
      summary: 'Registrations are officially open for B.Com, B.A., and M.Com private coaching candidates under Mahatma Gandhi University for 2026-27.',
      tag: 'Admissions',
      date: 'June 08, 2026',
      author: 'Admin Office'
    },
    {
      id: 'german-language',
      title: 'New Intensive German Language Batches starting this Month',
      content: 'The International Language Academy (ILA) at Catholic Centre is scheduling new batches for German A1, A2, and B1 levels starting next Monday. Led by experienced language instructors, the batches focus on basic to professional conversational competence, targeting Goethe/Telc certification.\n\nClasses will run both in morning and afternoon sessions to accommodate working professionals and university students. Register your interest at our help desk today.',
      summary: 'Register for intensive German language certification courses (Goethe A1-B1) commencing next Monday at ILA.',
      tag: 'Language (ILA)',
      date: 'June 05, 2026',
      author: 'ILA Coordinator'
    },
    {
      id: 'nursing-assistant',
      title: 'Government-Certified Nursing Assistant Admissions Extended',
      content: 'The Xtreem Coaching Center has extended its application submission date for the Nursing Assistant course. This program offers full clinical instruction, medical ethics briefings, and dedicated post-program hospital placement. To support students from economically weaker backgrounds, scholarship concessions are available. Contact the Director for fee waiver conditions.',
      summary: 'Xtreem Coaching Center announces extension of application deadlines for the government-approved 6-month Nursing Assistant certificate program.',
      tag: 'Xtreem Coaching',
      date: 'June 02, 2026',
      author: 'Director CCC'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

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
        this.checkQueryParams();
      })
      .catch((error) => {
        console.error('Error fetching blogs, using defaults:', error);
        this.posts = this.defaultBlogs;
        this.loading = false;
        this.checkQueryParams();
      });
  }

  checkQueryParams() {
    this.route.queryParams.subscribe(params => {
      const postId = params['id'];
      if (postId && this.posts.length > 0) {
        const post = this.posts.find(p => p.id === postId || p.title === postId);
        if (post) {
          this.selectedPost = post;
        } else {
          this.selectedPost = null;
        }
      } else if (!postId) {
        this.selectedPost = null;
      }
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: post.id || post.title },
      queryParamsHandling: 'merge'
    });
  }

  closePost() {
    this.selectedPost = null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: null },
      queryParamsHandling: 'merge'
    });
  }

  shareToWhatsApp(post: BlogPost, event: Event) {
    event.stopPropagation();
    const title = post.title;
    const postId = post.id || post.title;
    
    // Use the production domain when sharing so that the URL uses a valid Top-Level Domain (TLD)
    // and is parsed as a clickable link by WhatsApp clients (localhost is not parsed as a hyperlink by WhatsApp).
    const baseOrigin = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'https://cochincatholiccentre.com'
      : window.location.origin;

    const shareUrl = `${baseOrigin}/blog?id=${encodeURIComponent(postId)}`;
    const text = `*Check out this update from Catholic Centre:*\n\n*${title}*\n\n${shareUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
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
}
