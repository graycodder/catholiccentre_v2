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
  selector: 'app-ila',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Header Hero Banner -->
    <section class="ila-hero">
      <div class="container animate-fade-in">
        <span class="badge badge-gold">Cochin's Premier Language Studio</span>
        <h1 class="serif-text">International Language Academy (ILA)</h1>
        <p class="hero-sub font-gold">Professional German & European Language Training</p>
        <p class="desc">
          Speak the world, live the dream. Master German language levels (A1 to B2) under expert guidance. We prepare you for Goethe, Telc, and ÖSD certifications, opening pathways for free higher education and nursing careers in Germany.
        </p>
        <a routerLink="/contact" class="btn-gold">Enquire About Batches</a>
      </div>
    </section>

    <!-- Key Course Specs & Syllabus -->
    <section class="section-padding specs-section">
      <div class="container">
        <div class="section-header">
          <h2>Our Language Programs</h2>
          <p>Carefully structured courses designed to prepare you for international certification and career transitions.</p>
        </div>

        <div *ngIf="loading" class="loading-state text-center">
          <span class="material-icons-outlined spin-icon">sync</span>
          <p>Loading course information...</p>
        </div>

        <div *ngIf="!loading && !hasCurriculums()" class="no-courses-state text-center" style="padding: 3rem; background: #ffffff; border-radius: 12px; border: 1px dashed rgba(11, 25, 44, 0.15);">
          <span class="material-icons-outlined" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem; display: block;">school</span>
          <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-dark);">No Courses Added</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem;">Language program offerings are currently being updated. Please check back soon.</p>
        </div>

        <div *ngIf="!loading && hasCurriculums()" class="curriculums-container">
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
                <h3>Course Syllabus & Highlights</h3>
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

    <!-- Features & Placement -->
    <section class="section-padding advantages-section">
      <div class="container">
        <div class="section-header text-center">
          <h2>THE ILA ADVANTAGE</h2>
          <p>Why choose ILA for your foreign language training and global migration aspirations?</p>
        </div>

        <div class="grid-cols-3 advantages-grid">
          <!-- Certification Exam Prep -->
          <div class="glass-card adv-card text-center">
            <span class="material-icons-outlined card-icon">workspace_premium</span>
            <h4>Exam Focused Training</h4>
            <p>Targeted training for Goethe, Telc, and ÖSD certificates with rigorous mock tests and performance feedback.</p>
          </div>

          <!-- Language Lab -->
          <div class="glass-card adv-card text-center">
            <span class="material-icons-outlined card-icon">interpreter_mode</span>
            <h4>Interactive Audio Lab</h4>
            <p>Modern audio-visual modules and speaking labs to build native conversational fluency and correct accent patterns.</p>
          </div>

          <!-- Germany Pathways -->
          <div class="glass-card adv-card text-center">
            <span class="material-icons-outlined card-icon">flight_takeoff</span>
            <h4>Global Career Pathways</h4>
            <p>Complete assistance for university admissions, nurse registration, and visa processing for European countries.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .ila-hero {
      padding: 8rem 0 6rem 0;
      background: linear-gradient(rgba(252, 251, 249, 0.8), rgba(252, 251, 249, 0.97)), url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1470&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-bottom: 1px solid rgba(11, 25, 44, 0.06);
    }

    .ila-hero h1 {
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
    .specs-section .section-header {
      text-align: left;
    }
    
    .specs-section .section-header p {
      margin: 0.5rem 0 0 0;
    }

    .specs-grid {
      gap: 4rem;
      align-items: center;
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
      .ila-hero h1 { font-size: 2.75rem; }
      .specs-grid { grid-template-columns: 1fr; gap: 2rem; }
      .lightbox-footer {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class IlaComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  lightboxUrl = '';
  lightboxTitle = '';

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
            if (course.category === 'language') {
              fetchedList.push(course);
            }
          });
        }

        this.courses = fetchedList;
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error fetching ILA courses:', error);
        this.courses = [];
        this.loading = false;
      });
  }
}
