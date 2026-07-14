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
  selector: 'app-adhunik',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Header Hero Banner -->
    <section class="adhunik-hero">
      <div class="container animate-fade-in">
        <span class="badge badge-burgundy">Government Recognized</span>
        <h1 class="serif-text">Xtreem Coaching Center</h1>
        <p class="hero-sub font-gold">Nursing Assistant Certificate Program & Palliative Patient Care</p>
        <p class="desc">
          Acquire the essential clinical skills, first-aid certificates, and geriatric healthcare expertise to begin your nursing support career. We guarantee 100% job placements upon successful completion.
        </p>
        <a routerLink="/contact" class="btn-gold">Enquire Now</a>
      </div>
    </section>

    <!-- Key Course Specs & Syllabus -->
    <section class="section-padding specs-section">
      <div class="container">
        <div *ngIf="loading" class="loading-state text-center">
          <span class="material-icons-outlined spin-icon">sync</span>
          <p>Loading course information...</p>
        </div>

        <div *ngIf="!loading" class="curriculums-container">
          <div *ngFor="let course of courses; let i = index" class="specs-grid grid-cols-2" [style.margin-bottom]="i === courses.length - 1 ? '0' : '5rem'">
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
        </div>
      </div>
    </section>

    <!-- Features & Placement -->
    <section class="section-padding advantages-section">
      <div class="container">
        <div class="section-header text-center">
          <h2>XTREEM ADVANTAGES</h2>
          <p>We do not just teach; we shape career opportunities with direct tie-ups and hands-on modules.</p>
        </div>

        <div class="grid-cols-3 advantages-grid">
          <!-- Hospital training -->
          <div class="glass-card adv-card text-center">
            <span class="material-icons-outlined card-icon">local_hospital</span>
            <h4>Hands-on Clinicals</h4>
            <p>Practical sessions in leading local hospitals to familiarize students with dynamic ward scenarios.</p>
          </div>

          <!-- Government Certificate -->
          <div class="glass-card adv-card text-center">
            <span class="material-icons-outlined card-icon">workspace_premium</span>
            <h4>Government Approved</h4>
            <p>Valued certifications recognized by healthcare agencies and hospital networks across the state.</p>
          </div>

          <!-- Placements -->
          <div class="glass-card adv-card text-center">
            <span class="material-icons-outlined card-icon">hired</span>
            <h4>100% Placements</h4>
            <p>Active placement drives linking successful graduates directly to employment positions.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .adhunik-hero {
      padding: 8rem 0 6rem 0;
      background: linear-gradient(rgba(11, 25, 44, 0.75), rgba(7, 15, 25, 0.98)), url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1470&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
      color: var(--text-light);
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
      color: var(--text-light);
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
      background: #040910;
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
      .specs-grid { grid-template-columns: 1fr; gap: 2rem; }
    }
  `]
})
export class AdhunikComponent implements OnInit {
  courses: Course[] = [];
  loading = true;

  private defaultCourses: Course[] = [
    {
      name: 'Nursing Assistant Course',
      category: 'adhunik',
      duration: '6 Months',
      description: 'Professional healthcare preparation in patient care, hospital ethics, elderly palliative assistance, and first aid.',
      eligibility: 'SSLC / Plus Two',
      highlights: [
        'General Anatomy & Patient Hygiene Management',
        'Vital Signs Recording & Medication Schedules',
        'First-Aid and Emergency Critical Support',
        'Geriatric (Elderly) Palliative Nursing and Ethics',
        'Hospital Dressing, Sterilization & Equipment Handling',
        'Practical Internship in Multi-Speciality Clinics'
      ]
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
