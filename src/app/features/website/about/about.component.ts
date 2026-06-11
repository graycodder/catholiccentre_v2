import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { db } from '../../../core/firebase.config';
import { ref, get } from 'firebase/database';

interface Leader {
  id: string;
  name: string;
  role: string;
  credentials: string;
  description: string;
  initials: string;
  avatarColor: string;
  photoUrl?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  credentials: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Header Banner -->
    <section class="about-hero">
      <div class="container text-center animate-fade-in">
        <h1 class="serif-text">OUR HISTORICAL LEGACY</h1>
        <p>Serving Ernakulam's coastal community with dedicated educational leadership since 1977.</p>
      </div>
    </section>

    <!-- Detailed Intro -->
    <section class="section-padding intro-section">
      <div class="container grid-cols-2 intro-grid">
        <div class="intro-text">
          <span class="badge badge-burgundy">About St. Joseph's</span>
          <h2 class="serif-text section-title">Nurturing Minds with Discipline &amp; Value</h2>
          <p>
            St. Joseph's College is a Parallel College coaching students as private candidates for the Higher Secondary of Kerala State Higher Secondary Board and B.A., B.Com., M.A. M.Com. Degree courses conducted by Mahatma Gandhi University, Kottayam. 
          </p>
          <p>
            The College functions in a highly disciplined campus at Catholic Centre, Thoppumpady. We provide excellent infrastructure, including full-time office assistance, well-arranged classrooms, library resources, integrated computer training, an on-campus book stall, canteen facilities, and a spacious auditorium.
          </p>
        </div>

        <div class="features-list glass-card accent-card">
          <h3>Why St. Joseph's Parallel College?</h3>
          <ul class="styled-list">
            <li>
              <span class="material-icons-outlined list-bullet">check_circle</span>
              <div>
                <strong>Excellent Faculty:</strong>
                <p>Passionate and experienced teaching staff guiding students through university curricula.</p>
              </div>
            </li>
            <li>
              <span class="material-icons-outlined list-bullet">check_circle</span>
              <div>
                <strong>Holistic Infrastructure:</strong>
                <p>Equipped with spacious libraries, computer labs, canteens, and a full-size auditorium.</p>
              </div>
            </li>
            <li>
              <span class="material-icons-outlined list-bullet">check_circle</span>
              <div>
                <strong>Value-Driven Campus:</strong>
                <p>Focusing on the integral growth of students with strong ethics and discipline.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Founder & Management -->
    <section class="section-padding history-blocks">
      <div class="container">
        <div class="grid-cols-2 history-grid">
          <!-- Founder -->
          <div class="glass-card founder-card">
            <span class="badge badge-gold">Founder &amp; Visionary</span>
            <h3 class="serif-text font-gold">Rt. Rev. Dr. Joseph Kureethara</h3>
            <p class="role-desc">Bishop of Cochin (1975-1999)</p>
            <p>
              St. Joseph's College was founded in 1977 by Rt. Rev. Dr. Joseph Kureethara. His visionary mind identified the need for high-quality educational opportunities for youth in the Cochin region who lacked access to traditional collegiate systems. He established the institution to cultivate academic excellence alongside spiritual growth.
            </p>
          </div>

          <!-- Diocese -->
          <div class="glass-card diocese-card">
            <span class="badge badge-burgundy">Managing Patronage</span>
            <h3 class="serif-text font-burgundy">Managed by the Diocese of Cochin</h3>
            <p class="role-desc">Established in 1558</p>
            <p>
              As one of the oldest dioceses in India, the Diocese of Cochin has spent over four centuries active in the educational, socio-economic, and cultural integration of the coastal community. Catholic Centre continues this legacy by steering St. Joseph's, ILA, Adhunik, and Fastrack Academies.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Leadership Section -->
    <section class="section-padding leadership-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="gold-gradient-text">OUR LEADERSHIP BOARD</h2>
          <p>Guided by dedicated spiritual scholars and administrative directors.</p>
        </div>

        <div *ngIf="loadingLeaders" class="leaders-loading text-center">
          <span class="material-icons-outlined spin-icon">sync</span>
          <p>Loading leadership board...</p>
        </div>

        <div *ngIf="!loadingLeaders" class="grid-cols-3 leadership-grid">
          <div class="glass-card leader-card text-center" *ngFor="let leader of leaders">
            <!-- Photo if available, else initials avatar -->
            <img *ngIf="leader.photoUrl"
                 [src]="fixDriveUrl(leader.photoUrl)"
                 [alt]="leader.name"
                 class="leader-photo">
            <div *ngIf="!leader.photoUrl"
                 class="avatar-initials"
                 [class.bg-gold]="leader.avatarColor === 'gold' || !leader.avatarColor"
                 [class.bg-accent]="leader.avatarColor === 'accent'">
              {{ leader.initials || getInitials(leader.name) }}
            </div>
            <h4>{{ leader.name }}</h4>
            <p class="leader-role">{{ leader.role }}</p>
            <p class="leader-credentials">{{ leader.credentials }}</p>
            <p class="leader-desc">{{ leader.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Staff & Faculty Section -->
    <section class="section-padding staff-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="gold-gradient-text">FACULTY &amp; STAFF</h2>
          <p>Meet the dedicated educators and support staff who power our academies every day.</p>
        </div>

        <div *ngIf="loadingStaff" class="leaders-loading text-center">
          <span class="material-icons-outlined spin-icon">sync</span>
          <p>Loading staff directory...</p>
        </div>

        <!-- Empty state when no staff found anywhere -->
        <div *ngIf="!loadingStaff && staff.length === 0" class="text-center staff-empty">
          <span class="material-icons-outlined">badge</span>
          <p>Faculty profiles will appear here once added by the administration.</p>
        </div>

        <div *ngIf="!loadingStaff && staff.length > 0" class="staff-grid">
          <div class="glass-card staff-card" *ngFor="let member of staff; let i = index">
            <div class="staff-avatar" [class.staff-avatar-alt]="i % 2 !== 0">
              {{ getInitials(member.name) }}
            </div>
            <div class="staff-info">
              <h4>{{ member.name }}</h4>
              <p class="staff-role">{{ member.role }}</p>
              <p class="staff-credentials">{{ member.credentials }}</p>
              <p class="staff-desc">{{ member.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .about-hero {
      padding: 6rem 0;
      background: linear-gradient(rgba(7, 15, 25, 0.8), rgba(7, 15, 25, 0.98)), url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1470&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .about-hero h1 {
      font-size: 3rem;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }

    .about-hero p {
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .intro-grid {
      gap: 4rem;
      align-items: center;
    }

    .section-title {
      font-size: 2.5rem;
      margin: 1rem 0 1.5rem 0;
    }

    .intro-text p {
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }

    .features-list h3 {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      color: var(--gold);
    }

    .styled-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .styled-list li {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .list-bullet {
      color: var(--gold);
      font-size: 1.5rem;
      margin-top: 0.1rem;
    }

    .styled-list strong {
      color: var(--text-light);
      display: block;
      margin-bottom: 0.25rem;
    }

    .styled-list p {
      font-size: 0.875rem;
      margin: 0;
    }

    .history-blocks {
      background: #040910;
    }

    .history-grid {
      gap: 3rem;
    }

    .role-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .font-gold {
      color: var(--gold);
      font-size: 1.75rem;
      margin-top: 0.5rem;
    }

    .font-burgundy {
      color: #ff5274;
      font-size: 1.75rem;
      margin-top: 0.5rem;
    }

    /* Shared loading state */
    .leaders-loading {
      padding: 4rem 0;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .spin-icon {
      font-size: 2rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Leadership cards */
    .leadership-grid {
      gap: 2.5rem;
    }

    .leader-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2.5rem 2rem;
    }

    .leader-photo {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
      object-position: top center;
      margin-bottom: 1.5rem;
      border: 3px solid var(--gold);
      box-shadow: 0 6px 24px rgba(212, 175, 55, 0.3);
    }

    .avatar-initials {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 700;
      color: #000;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-premium);
    }

    .bg-gold {
      background: linear-gradient(135deg, var(--gold) 0%, #a3811f 100%);
    }

    .bg-accent {
      background: linear-gradient(135deg, #ff5274 0%, var(--accent) 100%);
      color: #fff;
    }

    .leader-card h4 {
      font-size: 1.15rem;
      margin-bottom: 0.25rem;
    }

    .leader-role {
      font-size: 0.85rem;
      color: var(--gold);
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .leader-credentials {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
      margin-bottom: 1rem;
    }

    .leader-desc {
      font-size: 0.85rem;
      margin-bottom: 0;
    }

    /* ── Staff & Faculty Section ── */
    .staff-section {
      background: #040910;
    }

    .staff-empty {
      padding: 4rem 0;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .staff-empty span {
      font-size: 3rem;
    }

    .staff-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.75rem;
      margin-top: 0.5rem;
    }

    .staff-card {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      padding: 1.75rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .staff-card:hover {
      transform: translateY(-3px);
    }

    .staff-avatar {
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--gold) 0%, #a3811f 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      font-weight: 700;
      color: #000;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
    }

    .staff-avatar-alt {
      background: linear-gradient(135deg, #b8001f 0%, #7a0015 100%);
      color: #fff;
      box-shadow: 0 4px 15px rgba(184, 0, 31, 0.2);
    }

    .staff-info {
      flex: 1;
      min-width: 0;
    }

    .staff-info h4 {
      font-size: 1.05rem;
      margin-bottom: 0.2rem;
      line-height: 1.3;
    }

    .staff-role {
      font-size: 0.82rem;
      color: var(--gold);
      font-weight: 600;
      margin-bottom: 0.2rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .staff-credentials {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 500;
      margin-bottom: 0.6rem;
    }

    .staff-desc {
      font-size: 0.83rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin: 0;
    }

    @media (max-width: 992px) {
      .intro-grid { grid-template-columns: 1fr; gap: 2rem; }
      .history-grid { grid-template-columns: 1fr; gap: 2rem; }
      .staff-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AboutComponent implements OnInit {
  leaders: Leader[] = [];
  loadingLeaders = true;

  staff: StaffMember[] = [];
  loadingStaff = true;

  // Fallback static leaders when Firebase is empty
  private defaultLeaders: Leader[] = [
    {
      id: 'default-1',
      name: 'Rev. Fr. Sunny Attapparambil',
      role: 'Principal & Director',
      credentials: 'B.A., B.Th., B.Ed., M.B.A., M.Ed.',
      description: 'Leads academic administration and structural operations of the Catholic Centre.',
      initials: 'SA',
      avatarColor: 'gold'
    },
    {
      id: 'default-2',
      name: 'Rev. Fr. Antony Thamby Thaikkoottathil',
      role: 'Assistant Director',
      credentials: 'M.Ph., M.Th., M.B.A., P.G.H.A.',
      description: 'Expertise in Philosophy, Theology, and Healthcare Management, guiding student welfare.',
      initials: 'AT',
      avatarColor: 'accent'
    },
    {
      id: 'default-3',
      name: 'Rev. Fr. Peter Chadayangad',
      role: 'Vice Principal',
      credentials: 'B.A., M.Th.',
      description: 'Dedicated scholar offering theological insights and academic supervision to candidate batches.',
      initials: 'PC',
      avatarColor: 'gold'
    },
    {
      id: 'default-4',
      name: 'Rev. Dr. Johney Xavier Puthukkattu',
      role: 'Advisory Board',
      credentials: 'B.A., B.Ph., M.Phil., D.D.',
      description: 'Doctorate in Divinity. Committed to community outreach and value education.',
      initials: 'JX',
      avatarColor: 'accent'
    },
    {
      id: 'default-5',
      name: 'Rev. Fr. Martin Delish Vakappadath',
      role: 'Advisory Board',
      credentials: 'B.A., B.Ph., M.Th.',
      description: 'Spiritual guide driving community leadership and the theological orientation of the college.',
      initials: 'MD',
      avatarColor: 'gold'
    },
    {
      id: 'default-6',
      name: 'Rt. Rev. Dr. James Raphael Anaparambil',
      role: 'Apostolic Administrator',
      credentials: 'M.A., S.T.D.',
      description: 'Patron administrator guiding the diocesan educational ministry and campus policies.',
      initials: 'JA',
      avatarColor: 'accent'
    }
  ];

  ngOnInit() {
    this.fetchLeaders();
    this.fetchStaff();
  }

  /**
   * Converts any Google Drive URL to the embeddable lh3.googleusercontent.com format.
   * Fixes old uc?export=view URLs already stored in Firebase.
   */
  fixDriveUrl(url: string): string {
    if (!url || !url.trim()) return '';
    url = url.trim();

    // Helper: ensure lh3 URL has the =s0 size suffix for direct serving
    const ensureSize = (lh3Url: string): string => {
      // Already has a size param (=s<N> or =w<N> etc.) — leave as-is
      if (/=[swh]\d/.test(lh3Url) || lh3Url.endsWith('=s0')) return lh3Url;
      return lh3Url + '=s0';
    };

    // Already correct lh3 format — just ensure size suffix
    if (url.includes('lh3.googleusercontent.com')) return ensureSize(url);

    // Extract ID from /file/d/ID/ format
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}=s0`;

    // Extract ID from ?id= or &id= format
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) return `https://lh3.googleusercontent.com/d/${idMatch[1]}=s0`;

    return url;
  }

  fetchLeaders() {
    this.loadingLeaders = true;
    get(ref(db, 'leadership'))
      .then((snapshot) => {
        const list: Leader[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            list.push({ id: key, ...data[key] } as Leader);
          });
        }
        this.leaders = list.length > 0 ? list : this.defaultLeaders;
        this.loadingLeaders = false;
      })
      .catch((error) => {
        console.error('Error fetching leadership data, using fallback:', error);
        this.leaders = this.defaultLeaders;
        this.loadingLeaders = false;
      });
  }

  fetchStaff() {
    this.loadingStaff = true;
    get(ref(db, 'faculty'))
      .then((snapshot) => {
        const list: StaffMember[] = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.keys(data).forEach((key) => {
            list.push({ id: key, ...data[key] } as StaffMember);
          });
        }
        this.staff = list;
        this.loadingStaff = false;
      })
      .catch((error) => {
        console.error('Error fetching staff data:', error);
        this.staff = [];
        this.loadingStaff = false;
      });
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).filter(p => p.length > 1 && !/^(Rev\.|Fr\.|Dr\.|Rt\.|Mr\.|Ms\.|Mrs\.|Sr\.)$/i.test(p));
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
}
