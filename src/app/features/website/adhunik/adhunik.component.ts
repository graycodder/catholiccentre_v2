import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { db } from '../../../core/firebase.config';
import { ref, get } from 'firebase/database';

interface Course {
  id?: string;
  name: string;
  category: 'college' | 'language' | 'adhunik' | 'fastrack';
  duration: string;
  description: string;
  eligibility: string;
  highlights?: string[];
  imageUrl?: string;
}

@Component({
  selector: 'app-adhunik',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Header Hero Banner -->
    <section class="adhunik-hero">
      <div class="container animate-fade-in">
        <span class="badge badge-burgundy">Academic Excellence</span>
        <h1 class="serif-text">Xstream Coaching Center</h1>
        <p class="hero-sub font-gold">Empowering Students to Achieve Academic and Professional Goals</p>
        <p class="desc">
          Access high-quality coaching, comprehensive learning materials, and expert guidance tailored to help you succeed in your educational journey.
        </p>
        <a routerLink="/contact" class="btn-gold">Enquire Now</a>
      </div>
    </section>

    <!-- Key Course Specs & Syllabus -->
    <section class="section-padding specs-section" *ngIf="loading || hasCurriculums()">
      <div class="container">
        <div *ngIf="loading" class="loading-state text-center">
          <span class="material-icons-outlined spin-icon">sync</span>
          <p>Loading course information...</p>
        </div>

        <div *ngIf="!loading" class="curriculums-container">
          <ng-container *ngFor="let course of courses; let i = index">
            <div *ngIf="course.highlights && course.highlights.length" 
                 class="specs-grid grid-cols-2" 
                 [style.margin-bottom]="i === courses.length - 1 ? '0' : '5rem'">
              
              <div class="specs-intro">
                <h2>{{ course.name }}</h2>
                <p *ngIf="course.description && course.description.trim()">{{ course.description }}</p>
                <div class="specs-bullets">
                  <div class="spec-item">
                    <span class="material-icons-outlined gold-text">hourglass_bottom</span>
                    <div>
                      <strong>Duration</strong>
                      <p>{{ course.duration }}</p>
                    </div>
                  </div>
                  <div class="spec-item">
                    <span class="material-icons-outlined gold-text">school</span>
                    <div>
                      <strong>Eligibility</strong>
                      <p>{{ course.eligibility }}</p>
                    </div>
                  </div>
                </div>

                <!-- Brochure Download Link -->
                <div *ngIf="course.imageUrl" class="brochure-download-wrap" style="margin-top: 2rem;">
                  <a [href]="course.imageUrl" target="_blank" class="btn-gold" style="display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
                    <span class="material-icons-outlined">download</span>
                    Download Course Brochure
                  </a>
                </div>
              </div>

              <div class="syllabus-card glass-card" [class.accent-card]="i % 2 === 0" [class.gold-card]="i % 2 !== 0">
                <h3>Syllabus Overview</h3>
                <ul class="syllabus-list">
                  <li *ngFor="let highlight of course.highlights; let idx = index">
                    <span>{{ idx + 1 | number:'2.0-0' }}.</span>
                    {{ highlight }}
                  </li>
                </ul>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </section>

    <!-- Course Brochure & Media Gallery -->
    <section class="section-padding gallery-section" *ngIf="hasBrochures()">
      <div class="container animate-fade-in">
        <div class="section-header" style="margin-bottom: 4rem;">
          <h2 class="serif-text">Program Brochure Gallery</h2>
          <p class="font-gold" style="font-size: 1.1rem; margin-top: 0.5rem;">Explore our courses and download full high-resolution prospectus details.</p>
        </div>

        <div class="gallery-column">
          <div *ngFor="let course of coursesWithBrochures()" class="gallery-item glass-card animate-fade-in">
            <div class="gallery-image-container">
              <img [src]="convertGoogleDriveUrl(course.imageUrl!)" [alt]="course.name" class="full-view-img" referrerpolicy="no-referrer">
            </div>
            <div class="gallery-actions">
              <a [href]="course.imageUrl" target="_blank" class="btn-gold download-btn">
                <span class="material-icons-outlined">download</span> Download Brochure
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>


  `,
  styles: [`
    .adhunik-hero {
      padding: 8rem 0 6rem 0;
      background: linear-gradient(rgba(252, 251, 249, 0.75), rgba(252, 251, 249, 0.96)), url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1470&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-bottom: 1px solid rgba(11, 25, 44, 0.06);
    }

    .adhunik-hero h1 {
      font-size: 3.5rem;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }

    .hero-sub {
      font-size: 1.35rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .desc {
      font-size: 1.1rem;
      color: var(--text-muted);
      max-width: 700px;
      margin-bottom: 2.5rem;
    }

    /* Specs section styling */
    .specs-grid {
      gap: 4rem;
      align-items: center;
    }

    .specs-grid.grid-cols-2 {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .specs-grid.grid-cols-1 {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    /* Gallery Section - Single Column Full View */
    .gallery-section {
      background: #faf9f6;
      border-top: 1px solid rgba(11, 25, 44, 0.04);
    }

    .gallery-section .section-header {
      text-align: left;
    }

    .gallery-section .section-header p {
      margin-left: 0;
      margin-right: 0;
    }

    .gallery-column {
      display: flex;
      flex-direction: column;
      gap: 4rem;
      width: 100%;
      margin: 0 auto;
    }

    .gallery-item {
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      border: 1px solid rgba(212, 175, 55, 0.15);
      border-radius: 16px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
    }

    .gallery-image-container {
      width: 100%;
      overflow: hidden;
      background: rgba(0, 0, 0, 0.02);
    }

    .full-view-img {
      width: 100%;
      height: auto;
      display: block;
    }

    .gallery-actions {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .download-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      text-decoration: none;
      padding: 1rem 2.5rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .specs-intro h2 {
      font-size: 2.25rem;
      margin-bottom: 1.5rem;
    }

    .specs-intro p {
      font-size: 1rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .specs-bullets {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .spec-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .spec-item span {
      font-size: 2rem;
    }

    .spec-item strong {
      color: var(--text-dark);
      font-size: 1.05rem;
    }

    .spec-item p {
      margin-top: 0.25rem;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .syllabus-card h3 {
      font-size: 1.5rem;
      color: var(--gold);
      margin-bottom: 1.5rem;
    }

    .syllabus-list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .syllabus-list li {
      display: flex;
      gap: 1rem;
      font-size: 0.95rem;
      color: var(--text-dark);
    }

    .syllabus-list span {
      color: var(--gold);
      font-weight: 700;
    }

    .loading-state {
      padding: 4rem 0;
      color: var(--text-muted);
      text-align: center;
    }

    .spin-icon {
      font-size: 2.5rem;
      animation: spin 1.5s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* Advantages cards styling */
    .advantages-section {
      background: #f4f3ef;
      border-top: 1px solid rgba(11, 25, 44, 0.06);
      border-bottom: 1px solid rgba(11, 25, 44, 0.06);
    }

    .advantages-grid {
      gap: 2.5rem;
    }

    .adv-card {
      padding: 3rem 2rem;
    }

    .card-icon {
      font-size: 3rem;
      color: var(--gold);
      margin-bottom: 1.5rem;
    }

    .adv-card h4 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .adv-card p {
      font-size: 0.9rem;
    }

    @media (max-width: 992px) {
      .adhunik-hero h1 { font-size: 2.75rem; }
      .specs-grid.grid-cols-3 {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .specs-grid.grid-cols-2 {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .lightbox-footer {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class AdhunikComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  lightboxUrl = '';
  lightboxTitle = '';

  private defaultCourses: Course[] = [];

  ngOnInit() {
    this.fetchCourses();
  }

  hasCurriculums(): boolean {
    return this.courses.some(c => c.highlights && c.highlights.length > 0);
  }

  hasBrochures(): boolean {
    return this.courses.some(c => c.imageUrl && c.imageUrl.trim().length > 0);
  }

  coursesWithBrochures(): Course[] {
    return this.courses.filter(c => c.imageUrl && c.imageUrl.trim().length > 0);
  }

  openLightbox(url: string, title: string) {
    this.lightboxUrl = url;
    this.lightboxTitle = title;
  }

  closeLightbox() {
    this.lightboxUrl = '';
    this.lightboxTitle = '';
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

  fetchCourses() {
    this.loading = true;
    const coursesRef = ref(db, 'courses');
    get(coursesRef)
      .then((snapshot) => {
        const fetchedList: Course[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            const course = { id: key, ...data[key] } as Course;
            if (course.category === 'adhunik') {
              fetchedList.push(course);
            }
          });
        }

        if (fetchedList.length > 0) {
          this.courses = fetchedList;
        } else {
          this.courses = this.defaultCourses;
        }
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error fetching Adhunik courses, using fallback:', error);
        this.courses = this.defaultCourses;
        this.loading = false;
      });
  }
}
