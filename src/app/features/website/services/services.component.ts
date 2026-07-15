import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Header Banner -->
    <section class="services-hero">
      <div class="container text-center animate-fade-in">
        <h1 class="serif-text">OUR ACADEMIC PROGRAMS</h1>
        <p>Explore coaching programs for university degrees, international language certifications, and professional career diplomas.</p>
      </div>
    </section>

    <!-- Courses Area -->
    <section class="section-padding courses-section">
      <div class="container">
        <!-- Category Filter Tabs -->
        <div class="filter-tabs">
          <button class="btn-all" [class.active]="activeFilter === 'all'" (click)="setFilter('all')">All Programs</button>
          <button class="btn-college" [class.active]="activeFilter === 'college'" (click)="setFilter('college')">St. Joseph's College</button>
          <button class="btn-fastrack" [class.active]="activeFilter === 'fastrack'" (click)="setFilter('fastrack')">Fastrack Computer Center</button>
          <button class="btn-adhunik" [class.active]="activeFilter === 'adhunik'" (click)="setFilter('adhunik')">Xtreem Coaching Center</button>
          <button class="btn-language" [class.active]="activeFilter === 'language'" (click)="setFilter('language')">ILA</button>
        </div>

        <div *ngIf="loading" class="loading-state text-center">
          <span class="material-icons-outlined spin-icon">sync</span>
          <p>Loading course curricula...</p>
        </div>

        <!-- Course Cards Grid -->
        <div *ngIf="!loading" class="grid-cols-3 courses-grid">
          <div *ngFor="let course of filteredCourses" class="glass-card course-card" [class.gold-border]="course.category === 'language' || course.category === 'fastrack'">
            <!-- Course Image Banner -->
            <div *ngIf="course.imageUrl" class="course-card-image">
              <img [src]="convertGoogleDriveUrl(course.imageUrl)" alt="{{ course.name }}" referrerpolicy="no-referrer">
            </div>

            <div class="card-header-flex">
              <span class="badge" [class.badge-burgundy]="course.category === 'college' || course.category === 'adhunik'" [class.badge-gold]="course.category === 'language' || course.category === 'fastrack'">
                {{ getCategoryLabel(course.category) }}
              </span>
              <span class="course-duration"><span class="material-icons-outlined text-val">schedule</span> {{ course.duration }}</span>
            </div>
            
            <h3 class="course-title">{{ course.name }}</h3>
            <p class="course-desc" *ngIf="course.description && course.description.trim()">
              <span>
                {{ isExpanded(course.id || course.name) ? course.description : getShortDesc(course.description) }}
              </span>
              <button type="button" *ngIf="course.description.length > 120" 
                      (click)="toggleExpand(course.id || course.name)" 
                      class="read-more-btn">
                {{ isExpanded(course.id || course.name) ? 'Read Less' : 'Read More' }}
              </button>
            </p>
            
            <div class="course-meta">
              <p class="eligibility-text">
                <strong>Eligibility:</strong> {{ course.eligibility }}
              </p>
              <div *ngIf="course.highlights && course.highlights.length" class="highlights-box">
                <strong>Highlights:</strong>
                <ul>
                  <li *ngFor="let h of course.highlights.slice(0, 3)">{{ h }}</li>
                </ul>
              </div>
            </div>

            <div class="card-footer">
              <a routerLink="/contact" class="btn-outline apply-btn-card">Apply Now</a>
              <a *ngIf="course.imageUrl" [href]="course.imageUrl" target="_blank" class="brochure-btn-card">
                <span class="material-icons-outlined" style="font-size: 1.1rem; margin-right: 0.25rem;">download</span> Brochure
              </a>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredCourses.length === 0" class="text-center empty-state">
          <span class="material-icons-outlined">sentiment_dissatisfied</span>
          <p>No courses found matching this category.</p>
        </div>
      </div>
    </section>

    <!-- Language Academy Specific Info Banner -->
    <section class="language-academy-banner section-padding" *ngIf="activeFilter === 'all' || activeFilter === 'language'">
      <div class="container banner-grid glass-card gold-card">
        <div class="banner-content">
          <span class="badge badge-gold">German Language Studio</span>
          <h2 class="serif-text">International Language Academy (ILA)</h2>
          <p class="subtitle font-gold italic">Speak the World, Live the Dream: Master a Foreign Language, Open the Doors of Global Opportunities.</p>
          <p>
            For over 450 years, the Cochin Diocese has been a hub of cultural and linguistic exchange. At the Catholic Centre, we carry forward this prestigious legacy. As Cochin’s oldest linguistic centre, we specialize in Indo-European languages, preparing candidates for:
          </p>
          <ul class="cert-list">
            <li><span class="material-icons-outlined gold-text">check</span> Goethe / Telc / ÖSD Certification (A1, A2, B1, B2 level)</li>
            <li><span class="material-icons-outlined gold-text">check</span> Intensive Grammar & Auditory practice</li>
            <li><span class="material-icons-outlined gold-text">check</span> Opportunities for Free Higher Education and Nursing career transitions in Germany</li>
          </ul>
          <a routerLink="/contact" class="btn-gold">Enquire About German Batches</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .services-hero {
      padding: 6rem 0;
      background: linear-gradient(rgba(252, 251, 249, 0.75), rgba(252, 251, 249, 0.96)), url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1470&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-bottom: 1px solid rgba(11, 25, 44, 0.06);
    }

    .services-hero h1 {
      font-size: 3rem;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }

    .filter-tabs {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 4rem;
    }

    .filter-tabs button {
      background: rgba(11, 25, 44, 0.03);
      border: 1px solid rgba(11, 25, 44, 0.08);
      color: var(--text-muted);
      padding: 0.6rem 1.5rem;
      border-radius: 30px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
      transition: var(--transition-smooth);
    }

    .filter-tabs button:hover,
    .filter-tabs button.active {
      background: var(--accent);
      color: var(--text-on-dark);
      border-color: var(--accent);
      box-shadow: var(--shadow-burgundy);
    }

    .filter-tabs button.active[class*="language"],
    .filter-tabs button.active[class*="fastrack"] {
      background: var(--gold);
      color: var(--primary);
      border-color: var(--gold);
      box-shadow: var(--shadow-glow);
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

    /* Course Cards Styling */
    .courses-grid {
      gap: 2.5rem;
    }

    .course-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .course-card-image {
      width: 100%;
      height: 180px;
      border-radius: 12px 12px 0 0;
      overflow: hidden;
      margin: -2rem -2rem 1.5rem -2rem;
      width: calc(100% + 4rem);
      border-bottom: 1px solid rgba(11, 25, 44, 0.08);
    }

    .course-card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .course-card:hover .course-card-image img {
      transform: scale(1.05);
    }

    .course-card.gold-border:hover {
      border-color: var(--gold);
    }

    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .course-duration {
      font-size: 0.8rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .text-val {
      font-size: 1rem;
      color: var(--gold);
    }

    .course-title {
      font-size: 1.35rem;
      margin-bottom: 0.75rem;
      line-height: 1.3;
      min-height: 3.5rem;
      display: flex;
      align-items: flex-end;
    }

    .course-desc {
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      flex-grow: 1;
      min-height: 4.8rem;
    }

    .read-more-btn {
      background: none;
      border: none;
      color: var(--gold);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      margin-left: 0.25rem;
      text-decoration: underline;
      display: inline-block;
      transition: color 0.2s ease;
    }

    .read-more-btn:hover {
      color: var(--text-dark);
    }

    .course-meta {
      border-top: 1px solid rgba(11, 25, 44, 0.08);
      padding-top: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.85rem;
    }

    .eligibility-text {
      margin-bottom: 0.75rem;
    }

    .eligibility-text strong, .highlights-box strong {
      color: var(--text-dark);
    }

    .highlights-box ul {
      list-style-type: square;
      padding-left: 1.25rem;
      margin-top: 0.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      color: var(--text-muted);
    }

    .card-footer {
      margin-top: auto;
      display: flex;
      gap: 0.75rem;
    }

    .apply-btn-card, .brochure-btn-card {
      flex: 1;
      text-align: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 42px;
      font-size: 0.85rem;
      padding: 0.5rem 0.25rem;
    }

    .brochure-btn-card {
      border: 1px solid var(--gold);
      color: var(--gold);
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      transition: var(--transition-smooth);
    }

    .brochure-btn-card:hover {
      background: rgba(212, 175, 55, 0.08);
    }

    /* Language Academy specific banner style */
    .language-academy-banner {
      background: #f4f3ef;
      border-top: 1px solid rgba(11, 25, 44, 0.06);
    }

    .banner-grid {
      padding: 3rem;
    }

    .banner-content {
      max-width: 900px;
    }

    .banner-content h2 {
      font-size: 2.25rem;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: 1.05rem;
      margin-bottom: 1.5rem;
    }

    .cert-list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin: 1.5rem 0 2rem 0;
    }

    .cert-list li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .banner-grid { padding: 2rem 1.5rem; }
      .banner-content h2 { font-size: 1.75rem; }
    }
  `]
})
export class ServicesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  loading = true;
  activeFilter = 'all';
  expandedCourses: Record<string, boolean> = {};

  constructor(private route: ActivatedRoute) {}

  toggleExpand(key: string) {
    this.expandedCourses[key] = !this.expandedCourses[key];
  }

  isExpanded(key: string): boolean {
    return !!this.expandedCourses[key];
  }

  getShortDesc(desc: string): string {
    if (!desc) return '';
    if (desc.length > 120) {
      return desc.substring(0, 110) + '...';
    }
    return desc;
  }

  // Seed fallback courses
  private defaultCourses: Course[] = [
    // St Joseph's college
    {
      name: 'Higher Secondary Tuition',
      category: 'college',
      duration: '2 Years',
      description: 'Comprehensive private coaching for commerce and humanities state boards. Disciplined exam preparation.',
      eligibility: 'SSLC Pass',
      highlights: ['Excellent faculties', 'Regular evaluation tests', 'Individual attention']
    },
    {
      name: 'B.Com. Taxation / Co-operation',
      category: 'college',
      duration: '3 Years (6 Semesters)',
      description: 'Bachelor of Commerce coaching affiliated with Mahatma Gandhi University private candidate syllabus.',
      eligibility: 'Plus Two Pass',
      highlights: ['Tally training included', 'Semestral exam prep guides', 'Doubt clearance sessions']
    },
    {
      name: 'B.A. English / Economics / Sociology',
      category: 'college',
      duration: '3 Years (6 Semesters)',
      description: 'Humanities Degree coaching with intensive lecturing, notes distribution, and essay writing support.',
      eligibility: 'Plus Two Pass',
      highlights: ['Experienced faculty board', 'Language competence training', 'Excellent university results']
    },
    {
      name: 'M.Com. Finance',
      category: 'college',
      duration: '2 Years (4 Semesters)',
      description: 'Postgraduate degree coaching in Commerce, specializing in Financial Control & Management.',
      eligibility: 'B.Com / BBA Pass',
      highlights: ['Advanced accounting models', 'Flexible batch timings', 'Seminar preparations']
    },
    // German Language Academy
    {
      name: 'German Language Course (A1-A2)',
      category: 'language',
      duration: '3-4 Months',
      description: 'Basic language acquisition program covering essential vocabulary, auditory understanding, and sentence structures.',
      eligibility: 'SSLC / Plus Two / Degree',
      highlights: ['Goethe/Telc exam format training', 'Native-level audio materials', 'Grammar absolute focus']
    },
    {
      name: 'German Language Course (B1-B2)',
      category: 'language',
      duration: '4-5 Months',
      description: 'Intermediate Indo-European language training. Crucial for students seeking free university entry or jobs in Germany.',
      eligibility: 'German A2 Complete',
      highlights: ['Speaking confidence modules', 'Mock exams & scoring review', 'Visa interview coaching']
    },
    // Adhunik
    {
      name: 'Nursing Assistant Course',
      category: 'adhunik',
      duration: '6 Months',
      description: 'Professional healthcare preparation in patient care, hospital ethics, elderly palliative assistance, and first aid.',
      eligibility: 'SSLC / Plus Two',
      highlights: ['Government-approved certification', '100% Placement assistance', 'Practical hospital training']
    },
    // Fastrack IT
    {
      name: 'PGDCA (PG Diploma in Computer Applications)',
      category: 'fastrack',
      duration: '1 Year',
      description: 'Government approved Postgraduate Diploma covering programming, databases, web design, and financial tallying.',
      eligibility: 'Any Degree Pass',
      highlights: ['VBA, Python fundamentals', 'Tally Prime with GST', 'Govt. recognized certificate']
    },
    {
      name: 'DCA (Diploma in Computer Applications)',
      category: 'fastrack',
      duration: '6 Months',
      description: 'Government approved IT diploma covering office automation, graphics design, and internet technologies.',
      eligibility: 'Plus Two / SSLC',
      highlights: ['MS Office Suite mastery', 'DTP Photoshop & CorelDraw', 'Useful for clerical govt jobs']
    }
  ];

  ngOnInit() {
    this.fetchCourses();
    this.route.queryParams.subscribe(params => {
      const filterParam = params['filter'];
      if (filterParam && ['college', 'language', 'adhunik', 'fastrack', 'all'].includes(filterParam)) {
        this.activeFilter = filterParam;
        this.filterCoursesList();
      }
    });
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
            fetchedList.push({ id: key, ...data[key] } as Course);
          });
        }

        if (fetchedList.length > 0) {
          this.courses = fetchedList;
        } else {
          // Empty DB: fallback to static array
          this.courses = this.defaultCourses;
        }
        this.filterCoursesList();
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error fetching courses, using fallback static data:', error);
        this.courses = this.defaultCourses;
        this.filterCoursesList();
        this.loading = false;
      });
  }

  setFilter(category: string) {
    this.activeFilter = category;
    this.filterCoursesList();
  }

  filterCoursesList() {
    if (this.activeFilter === 'all') {
      this.filteredCourses = this.courses;
    } else {
      this.filteredCourses = this.courses.filter(c => c.category === this.activeFilter);
    }
  }

  getCategoryLabel(cat: string): string {
    switch (cat) {
      case 'college': return "St. Joseph's College";
      case 'language': return 'ILA';
      case 'adhunik': return 'Xtreem Coaching Center';
      case 'fastrack': return 'Fastrack Computer Center';
      default: return 'General';
    }
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
