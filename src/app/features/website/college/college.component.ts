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
}

@Component({
  selector: 'app-college',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Header Hero Banner -->
    <section class="college-hero">
      <div class="container animate-fade-in">
        <span class="badge badge-gold">MG University Affiliated Coaching</span>
        <h1 class="serif-text">St. Joseph's College</h1>
        <p class="hero-sub font-gold">Higher Secondary & Degree / Postgraduate Coaching</p>
        <p class="desc">
          Established under the Diocese of Cochin, St. Joseph's College Thoppumpady offers rigorous private coaching for Higher Secondary (Plus Two) Commerce & Humanities and university degree programmes affiliated with Mahatma Gandhi University. Our experienced faculty and disciplined learning environment ensure outstanding academic results.
        </p>
        <div class="hero-actions">
          <a routerLink="/contact" class="btn-primary">Apply for Admission</a>
          <a routerLink="/about" class="btn-outline">Our History</a>
        </div>
      </div>
    </section>

    <!-- Stats Strip -->
    <section class="stats-strip">
      <div class="container stats-grid">
        <div class="stat-item">
          <span class="stat-num">45+</span>
          <span class="stat-label">Years of Excellence</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">5000+</span>
          <span class="stat-label">Alumni Graduated</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">95%</span>
          <span class="stat-label">Pass Rate</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">20+</span>
          <span class="stat-label">Expert Faculty</span>
        </div>
      </div>
    </section>

    <!-- Courses Offered -->
    <section class="section-padding courses-detailed">
      <div class="container">
        <div class="section-header">
          <h2>Our Academic Programmes</h2>
          <p class="courses-header-desc">From Higher Secondary coaching to Postgraduate degrees under Mahatma Gandhi University — all under one roof.</p>
        </div>

        <div *ngIf="loading" class="loading-state text-center">
          <span class="material-icons-outlined spin-icon">sync</span>
          <p>Loading academic programmes...</p>
        </div>

        <div *ngIf="!loading" class="grid-cols-2 curriculums-grid">
          <div *ngFor="let course of courses; let i = index"
               class="glass-card"
               [class.gold-card]="i % 2 === 0"
               [class.accent-card]="i % 2 !== 0">
            <span class="badge"
                  [class.badge-gold]="i % 2 === 0"
                  [class.badge-burgundy]="i % 2 !== 0">
              {{ getLevelLabel(course.name) }}
            </span>
            <h3>{{ course.name }}</h3>
            <p class="duration-label">
              <span class="material-icons-outlined">schedule</span> {{ course.duration }}
            </p>
            <p class="summary" *ngIf="course.description && course.description.trim()">{{ course.description }}</p>
            <div class="topics" *ngIf="course.highlights && course.highlights.length">
              <strong>Programme Highlights:</strong>
              <div class="tag-flex">
                <span *ngFor="let highlight of course.highlights" class="topic-tag">{{ highlight }}</span>
              </div>
            </div>
            <p class="elig"><strong>Eligibility:</strong> {{ course.eligibility }}</p>
            <a [routerLink]="['/contact']" [queryParams]="{ course: course.name }" class="apply-card-btn btn-outline">Apply Now &rarr;</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="section-padding why-section">
      <div class="container">
        <div class="grid-cols-2 why-grid">
          <!-- Features list -->
          <div class="why-text">
            <h2>Why Choose St. Joseph's College?</h2>
            <p>
              For over four decades, we have nurtured students to achieve their academic potential. Our coaching model blends rigorous discipline with individual attention.
            </p>
            <div class="feature-list">
              <div class="feature-item">
                <span class="material-icons-outlined gold-text">verified</span>
                <div>
                  <strong>MG University Affiliated</strong>
                  <p>Private candidate programme officially affiliated with Mahatma Gandhi University, Kottayam.</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="material-icons-outlined gold-text">groups</span>
                <div>
                  <strong>Experienced Faculty Board</strong>
                  <p>Dedicated subject experts with decades of teaching experience in university-level coaching.</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="material-icons-outlined gold-text">emoji_events</span>
                <div>
                  <strong>Outstanding Results</strong>
                  <p>Consistent 95%+ pass rate with multiple university rank holders graduating every year.</p>
                </div>
              </div>
              <div class="feature-item">
                <span class="material-icons-outlined gold-text">schedule</span>
                <div>
                  <strong>Flexible Batch Timings</strong>
                  <p>Morning and evening batches to accommodate working students and fresh school graduates alike.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA Card -->
          <div class="glass-card gold-card cta-card">
            <span class="material-icons-outlined cta-icon">school</span>
            <h3>Ready to Begin Your Journey?</h3>
            <p>
              Admissions are currently open for the academic year 2025–2026. Our counselors are available to guide you through the programme selection.
            </p>
            <ul class="cta-checklist">
              <li><span class="material-icons-outlined gold-text">check_circle</span> Free Academic Counseling</li>
              <li><span class="material-icons-outlined gold-text">check_circle</span> Scholarship Guidance</li>
              <li><span class="material-icons-outlined gold-text">check_circle</span> Exam Preparation Kits</li>
            </ul>
            <a routerLink="/contact" class="btn-gold" style="display:block; text-align:center; margin-top: 1.5rem;">
              Book a Counseling Session
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ── Hero ── */
    .college-hero {
      padding: 8rem 0 6rem 0;
      background: linear-gradient(rgba(252, 251, 249, 0.78), rgba(252, 251, 249, 0.97)),
        url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1470&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-bottom: 1px solid rgba(11, 25, 44, 0.06);
    }

    .college-hero h1 {
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
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 750px;
      line-height: 1.75;
      margin-bottom: 2.5rem;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* ── Stats Strip ── */
    .stats-strip {
      background: var(--primary);
      padding: 3rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      text-align: center;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .stat-num {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--gold);
      font-family: var(--font-serif);
    }

    .stat-label {
      font-size: 0.85rem;
      color: rgba(248, 250, 252, 0.7);
      letter-spacing: 0.05em;
      font-weight: 500;
    }

    /* ── Courses Section ── */
    .courses-detailed .section-header {
      margin-bottom: 3rem;
    }

    .courses-header-desc {
      margin-left: 0 !important;
      margin-right: auto !important;
      max-width: 700px;
    }

    .courses-detailed .section-header h2 {
      font-size: 2.25rem;
      margin-bottom: 0.5rem;
    }

    .curriculums-grid {
      gap: 3rem;
    }

    .duration-label {
      font-size: 0.85rem;
      color: var(--gold);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin: 0.5rem 0 1rem 0;
      font-weight: 600;
    }

    .duration-label span { font-size: 1.1rem; }

    .summary {
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .topics {
      border-top: 1px solid rgba(11, 25, 44, 0.08);
      padding-top: 1rem;
      margin-bottom: 1.5rem;
    }

    .topics strong {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 0.75rem;
    }

    .tag-flex {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .topic-tag {
      background: rgba(11, 25, 44, 0.03);
      border: 1px solid rgba(11, 25, 44, 0.08);
      color: var(--text-dark);
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .elig {
      font-size: 0.9rem;
      border-top: 1px solid rgba(11, 25, 44, 0.08);
      padding-top: 1rem;
      margin-bottom: 1.25rem;
    }

    .apply-card-btn {
      display: inline-block;
      font-size: 0.85rem;
      padding: 0.5rem 1.25rem;
      text-align: center;
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

    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* ── Why Section ── */
    .why-section {
      background: #f4f3ef;
      border-top: 1px solid rgba(11, 25, 44, 0.06);
      border-bottom: 1px solid rgba(11, 25, 44, 0.06);
    }

    .why-grid {
      gap: 4rem;
      align-items: center;
    }

    .why-text h2 {
      font-size: 2.25rem;
      margin-bottom: 1rem;
    }

    .why-text > p {
      font-size: 1rem;
      margin-bottom: 2rem;
      line-height: 1.7;
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .feature-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .feature-item span.material-icons-outlined {
      font-size: 1.75rem;
      margin-top: 0.1rem;
      flex-shrink: 0;
    }

    .feature-item strong {
      display: block;
      font-size: 1rem;
      color: var(--text-dark);
      margin-bottom: 0.25rem;
    }

    .feature-item p {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.5;
    }

    /* CTA Card */
    .cta-card {
      text-align: center;
      padding: 3rem 2.5rem;
    }

    .cta-icon {
      font-size: 3.5rem;
      color: var(--gold);
      margin-bottom: 1rem;
    }

    .cta-card h3 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }

    .cta-card > p {
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      color: var(--text-muted);
    }

    .cta-checklist {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      text-align: left;
    }

    .cta-checklist li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      font-weight: 500;
    }

    /* ── Responsive ── */
    @media (max-width: 992px) {
      .college-hero h1 { font-size: 2.5rem; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
      .curriculums-grid { grid-template-columns: 1fr; }
      .why-grid { grid-template-columns: 1fr; gap: 2.5rem; }
    }

    @media (max-width: 576px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .college-hero h1 { font-size: 2rem; }
    }
  `]
})
export class CollegeComponent implements OnInit {
  courses: Course[] = [];
  loading = true;

  private defaultCourses: Course[] = [
    {
      name: 'Higher Secondary Tuition (Plus Two)',
      category: 'college',
      duration: '2 Years',
      description: 'Comprehensive private coaching for Commerce and Humanities streams. Covers full state board syllabus with regular mock tests, disciplined exam preparation, and individual doubt clearance sessions.',
      eligibility: 'SSLC (10th) Pass',
      highlights: ['Commerce & Humanities', 'Regular Evaluation Tests', 'Individual Attention', 'Mock Exams']
    },
    {
      name: 'B.Com Taxation / Co-operation',
      category: 'college',
      duration: '3 Years (6 Semesters)',
      description: 'Bachelor of Commerce coaching for private candidates affiliated with Mahatma Gandhi University. Covers financial accounting, taxation law, auditing, and business management.',
      eligibility: 'Plus Two Pass',
      highlights: ['Tally Training Included', 'Semestral Exam Prep', 'Doubt Clearance', 'Taxation Law']
    },
    {
      name: 'B.A. English / Economics / Sociology',
      category: 'college',
      duration: '3 Years (6 Semesters)',
      description: 'Humanities degree coaching with intensive lecturing, study materials distribution, essay writing support, and comprehensive preparation for MG University examinations.',
      eligibility: 'Plus Two Pass',
      highlights: ['Experienced Faculty Board', 'Language Competence', 'Essay Writing', 'University Results']
    },
    {
      name: 'M.A. English',
      category: 'college',
      duration: '2 Years (4 Semesters)',
      description: 'Postgraduate English coaching covering literary theory, advanced grammar, critical analysis, and comprehensive university exam preparation for MG University.',
      eligibility: 'B.A. English Pass',
      highlights: ['Literary Theory', 'Critical Analysis', 'Seminar Preparation', 'Research Guidance']
    },
    {
      name: 'M.Com Finance',
      category: 'college',
      duration: '2 Years (4 Semesters)',
      description: 'Postgraduate commerce coaching specializing in Financial Control & Management. Covers advanced accounting, financial instruments, corporate law, and strategic management.',
      eligibility: 'B.Com / BBA Pass',
      highlights: ['Advanced Accounting', 'Flexible Batch Timings', 'Seminar Preparations', 'Corporate Law']
    }
  ];

  ngOnInit() {
    this.fetchCourses();
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
            if (course.category === 'college') {
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
        console.error('Error fetching College courses, using fallback:', error);
        this.courses = this.defaultCourses;
        this.loading = false;
      });
  }

  getLevelLabel(name: string): string {
    const n = name.toLowerCase();
    if (n.startsWith('m.') || n.startsWith('m.a') || n.startsWith('m.com')) return 'Postgraduate';
    if (n.startsWith('b.') || n.startsWith('b.com') || n.startsWith('b.a')) return 'Undergraduate';
    return 'Higher Secondary';
  }
}
