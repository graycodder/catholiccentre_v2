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
  selector: 'app-fastrack',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Header Hero Banner -->
    <section class="fastrack-hero">
      <div class="container animate-fade-in">
        <span class="badge badge-gold">Government Approved Courses</span>
        <h1 class="serif-text">Fastrack IT Academy</h1>
        <p class="hero-sub font-gold">Professional Computer Diplomas & Modern Tech Education</p>
        <p class="desc">
          Enhance your digital credentials with certified courses. From administrative office automation and financial accounting software to modern coding languages like Python, we bridge the gap between education and IT recruitment.
        </p>
        <a routerLink="/contact" class="btn-primary">Enroll Today</a>
      </div>
    </section>

    <!-- Detailed Courses Offered -->
    <section class="section-padding courses-detailed">
      <div class="container">
        <div class="section-header text-center">
          <h2>OUR DIPLOMA CURRICULUMS</h2>
          <p>Carefully structured schedules matching both public sector jobs qualification guidelines and private IT standards.</p>
        </div>

        <div *ngIf="loading" class="loading-state text-center">
          <span class="material-icons-outlined spin-icon">sync</span>
          <p>Loading IT course curriculums...</p>
        </div>

        <div *ngIf="!loading" class="grid-cols-2 curriculums-grid">
          <div *ngFor="let course of courses; let i = index" class="glass-card" [class.gold-card]="i % 2 === 0" [class.accent-card]="i % 2 !== 0">
            <span class="badge" [class.badge-gold]="i % 2 === 0" [class.badge-burgundy]="i % 2 !== 0">
              {{ course.duration.includes('Year') || course.name.toLowerCase().includes('pg') ? 'Postgraduate Level' : 'Diploma Level' }}
            </span>
            <h3>{{ course.name }}</h3>
            <p class="duration-label"><span class="material-icons-outlined">schedule</span> {{ course.duration }}</p>
            <p class="summary" *ngIf="course.description && course.description.trim()">{{ course.description }}</p>
            <div class="topics" *ngIf="course.highlights && course.highlights.length">
              <strong>Syllabus Highlights:</strong>
              <div class="tag-flex">
                <span *ngFor="let highlight of course.highlights" class="topic-tag">{{ highlight }}</span>
              </div>
            </div>
            <p class="elig"><strong>Eligibility:</strong> {{ course.eligibility }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Short term and programming info -->
    <section class="section-padding short-terms">
      <div class="container">
        <div class="grid-cols-2 short-grid">
          <!-- Text info -->
          <div class="short-info-text">
            <h2>Specialized Programming & Career Courses</h2>
            <p>
              Looking to specialize in custom technologies rather than full-length diplomas? Fastrack Academy provides dedicated short-term batches with hands-on practice terminals.
            </p>
            <div class="short-list">
              <div class="short-list-item">
                <span class="material-icons-outlined gold-text">chevron_right</span>
                <div>
                  <strong>Tally Prime & GST Filing:</strong>
                  <p>Master financial reporting, GST invoice generation, ledger accounts, and audit statements. Ideal for B.Com students.</p>
                </div>
              </div>
              <div class="short-list-item">
                <span class="material-icons-outlined gold-text">chevron_right</span>
                <div>
                  <strong>Python & Programming Logic:</strong>
                  <p>Learn core algorithm designs, syntax, file streams, and object-oriented architectures in Python and C++.</p>
                </div>
              </div>
            </div>
            <a routerLink="/contact" class="btn-gold">Request Batch Schedule</a>
          </div>

          <!-- Terminals image representation -->
          <div class="glass-card tech-stack-card accent-card">
            <h3>Our Modern Lab Setup</h3>
            <p>
              Every student gets access to their own training station during lab hours. Fastrack is equipped with high-speed internet and updated software packages.
            </p>
            <div class="tech-icons">
              <div class="tech-icon"><span class="material-icons-outlined">computer</span><p>Personal PC</p></div>
              <div class="tech-icon"><span class="material-icons-outlined">wifi</span><p>High Speed Wi-Fi</p></div>
              <div class="tech-icon"><span class="material-icons-outlined">print</span><p>Printing Services</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .fastrack-hero {
      padding: 8rem 0 6rem 0;
      background: linear-gradient(rgba(11, 25, 44, 0.75), rgba(7, 15, 25, 0.98)), url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1470&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .fastrack-hero h1 {
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

    /* Curriculums grid */
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

    .duration-label span {
      font-size: 1.1rem;
    }

    .summary {
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .topics {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
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
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .elig {
      font-size: 0.9rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 1rem;
      margin: 0;
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

    /* Short term section */
    .short-terms {
      background: #040910;
    }

    .short-grid {
      gap: 4rem;
      align-items: center;
    }

    .short-info-text h2 {
      font-size: 2.25rem;
      margin-bottom: 1.5rem;
    }

    .short-info-text p {
      font-size: 1rem;
      margin-bottom: 2rem;
    }

    .short-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .short-list-item {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .short-list-item span {
      font-size: 1.25rem;
      margin-top: 0.2rem;
    }

    .short-list-item strong {
      color: var(--text-light);
    }

    .short-list-item p {
      margin-top: 0.25rem;
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 0;
    }

    .tech-stack-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--gold);
    }

    .tech-stack-card p {
      font-size: 0.95rem;
      margin-bottom: 2rem;
    }

    .tech-icons {
      display: flex;
      justify-content: space-around;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 2rem;
    }

    .tech-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .tech-icon span {
      font-size: 2rem;
      color: var(--gold);
    }

    .tech-icon p {
      font-size: 0.8rem;
      margin: 0;
      color: var(--text-muted);
    }

    @media (max-width: 992px) {
      .fastrack-hero h1 { font-size: 2.75rem; }
      .curriculums-grid { grid-template-columns: 1fr; gap: 2rem; }
      .short-grid { grid-template-columns: 1fr; gap: 2rem; }
    }
  `]
})
export class FastrackComponent implements OnInit {
  courses: Course[] = [];
  loading = true;

  private defaultCourses: Course[] = [
    {
      name: 'PGDCA (PG Diploma in Computer Applications)',
      category: 'fastrack',
      duration: '1 Year (Two Semesters)',
      description: 'Highly detailed computer applications study designed for graduates aiming to secure administrative clerical roles or technical database positions in municipal departments.',
      eligibility: 'Any University Graduation (B.A., B.Sc., B.Com, etc.)',
      highlights: [
        'MS Office Suite',
        'Tally Prime & GST',
        'C++ & Python',
        'Database (DBMS)',
        'Visual Basic (VBA)',
        'Internet Security'
      ]
    },
    {
      name: 'DCA (Diploma in Computer Applications)',
      category: 'fastrack',
      duration: '6 Months',
      description: 'Perfect introductory course for high school students, college candidates, and clerical job aspirants. Covers operational desktop skills, graphic styling, and accounting packages.',
      eligibility: 'SSLC (10th) or Plus Two (12th)',
      highlights: [
        'Windows & OS Ops',
        'Word, Excel, PowerPoint',
        'DTP Photoshop',
        'CorelDraw',
        'Malayalam/English Typing',
        'Tally Basics'
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
            if (course.category === 'fastrack') {
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
        console.error('Error fetching Fastrack courses, using fallback:', error);
        this.courses = this.defaultCourses;
        this.loading = false;
      });
  }
}
