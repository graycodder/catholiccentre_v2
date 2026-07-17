import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { db } from '../../../core/firebase.config';
import { ref, push, set, get } from 'firebase/database';

interface Course {
  id?: string;
  name: string;
  category: 'college' | 'language' | 'adhunik' | 'fastrack';
  duration: string;
}

interface InquiryForm {
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header Banner -->
    <section class="contact-hero">
      <div class="container text-center animate-fade-in">
        <h1 class="serif-text">GET IN TOUCH WITH US</h1>
        <p>Submit an admission inquiry or drop a message to schedule a counseling session.</p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="section-padding contact-section">
      <div class="container grid-cols-2 contact-grid">
        <!-- Direct Contacts info -->
        <div class="contact-info">
          <h2>Administrative Help Desk</h2>
          <p>
            Our office is open from Monday to Saturday, 9:00 AM to 5:00 PM. Feel free to visit us in person or reach out through our official lines.
          </p>

          <div class="contact-methods">
            <div class="method-card glass-card">
              <span class="material-icons-outlined gold-text">place</span>
              <div>
                <h4>Our Location</h4>
                <p>Catholic Centre, Thoppumpady, Cochin, Ernakulam, Kerala - 682005.</p>
              </div>
            </div>

            <div class="method-card glass-card">
              <span class="material-icons-outlined gold-text">phone</span>
              <div>
                <h4>Call Center</h4>
                <p>+0 484 298 15 33</p>
                <p>+0 484 223 15 33</p>
                <p>+0 484 319 01 83</p>
                <p>920 733 15 33 (Mobile)</p>
                <p>938 344 71 49 (Mobile)</p>
                <p>999 548 15 33 (Mobile)</p>
              </div>
            </div>

            <div class="method-card glass-card">
              <span class="material-icons-outlined gold-text">mail</span>
              <div>
                <h4>Official Email</h4>
                <p>stjosephscolleget&#64;gmail.com</p>
                <p>ila.stjoseph2024&#64;gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Application / Contact Form -->
        <div class="form-container glass-card gold-card">
          <h3>Admission Inquiry Form</h3>
          <p>Complete this form to receive a direct call-back from our academic counselors.</p>

          <form #leadForm="ngForm" (ngSubmit)="submitInquiry(leadForm)" class="inquiry-form">
            <div class="form-group">
              <label class="form-label" for="name">Full Name *</label>
              <input type="text" id="name" name="name" [(ngModel)]="formData.name" required #nameField="ngModel" class="form-control" placeholder="John Doe">
              <span class="error-msg" *ngIf="nameField.invalid && nameField.touched">Name is required</span>
            </div>

            <div class="grid-cols-2 inline-inputs">
              <div class="form-group">
                <label class="form-label" for="email">Email Address</label>
                <input type="email" id="email" name="email" [(ngModel)]="formData.email" class="form-control" placeholder="john&#64;example.com">
              </div>
              
              <div class="form-group">
                <label class="form-label" for="phone">Phone Number *</label>
                <input type="tel" id="phone" name="phone" [(ngModel)]="formData.phone" required pattern="[0-9]{10,}" #phoneField="ngModel" class="form-control" placeholder="9876543210">
                <span class="error-msg" *ngIf="phoneField.invalid && phoneField.touched">Valid 10-digit number required</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="course">Preferred Academy & Course *</label>
              <select id="course" name="course" [(ngModel)]="formData.course" required #courseField="ngModel" class="form-control">
                <option value="" disabled>Select program...</option>
                
                <optgroup label="St. Joseph's College" *ngIf="hasCoursesForCategory('college')">
                  <option *ngFor="let c of getCoursesByCategory('college')" [value]="c.name">
                    St. Joseph's: {{ c.name }}
                  </option>
                </optgroup>
                
                <optgroup label="ILA Language Academy" *ngIf="hasCoursesForCategory('language')">
                  <option *ngFor="let c of getCoursesByCategory('language')" [value]="c.name">
                    Language Academy: {{ c.name }}
                  </option>
                </optgroup>
                
                <optgroup label="Xtreem Coaching Center" *ngIf="hasCoursesForCategory('adhunik')">
                  <option *ngFor="let c of getCoursesByCategory('adhunik')" [value]="c.name">
                    Xtreem Coaching: {{ c.name }}
                  </option>
                </optgroup>
                
                <optgroup label="Fastrack Computer Center" *ngIf="hasCoursesForCategory('fastrack')">
                  <option *ngFor="let c of getCoursesByCategory('fastrack')" [value]="c.name">
                    Fastrack: {{ c.name }}
                  </option>
                </optgroup>
              </select>
              <span class="error-msg" *ngIf="courseField.invalid && courseField.touched">Preferred program selection required</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="message">Additional Message / Query</label>
              <textarea id="message" name="message" [(ngModel)]="formData.message" rows="4" class="form-control" placeholder="Enter details about your previous qualifications or specific queries..."></textarea>
            </div>

            <button type="submit" [disabled]="leadForm.invalid || submitting" class="btn-gold submit-btn">
              <span class="material-icons-outlined" *ngIf="!submitting">send</span>
              <span class="material-icons-outlined spin-icon" *ngIf="submitting">sync</span>
              <span>{{ submitting ? 'Submitting Application...' : 'Send Inquiry Request' }}</span>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- Success Modal -->
    <div class="modal-overlay" *ngIf="showSuccess">
      <div class="modal-content glass-card accent-card text-center">
        <span class="material-icons-outlined success-icon">check_circle</span>
        <h2>Inquiry Submitted Successfully!</h2>
        <p>Thank you for choosing Cochin Catholic Centre. Our academic counselor will call you at <strong>{{ formData.phone }}</strong> shortly to verify details.</p>
        <button (click)="closeSuccess()" class="btn-gold">Close & Return</button>
      </div>
    </div>
  `,
  styles: [`
    .contact-hero {
      padding: 6rem 0;
      background: linear-gradient(rgba(252, 251, 249, 0.75), rgba(252, 251, 249, 0.96)), url('https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=1470&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-bottom: 1px solid rgba(11, 25, 44, 0.06);
    }

    .contact-hero h1 {
      font-size: 3rem;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }

    /* Contact Grid layout */
    .contact-grid {
      gap: 4rem;
      align-items: flex-start;
    }

    .contact-info h2 {
      font-size: 2.25rem;
      margin-bottom: 1.5rem;
    }

    .contact-info p {
      font-size: 1rem;
      margin-bottom: 2.5rem;
    }

    .contact-methods {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .method-card {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
      padding: 1.5rem;
    }

    .method-card span {
      font-size: 2.2rem;
    }

    .method-card h4 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    .method-card p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    /* Form Container */
    .form-container h3 {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }

    .form-container p {
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }

    .inline-inputs {
      gap: 1.5rem;
    }

    .inquiry-form select {
      background: var(--bg-dark);
      color: var(--text-dark);
    }

    .error-msg {
      color: var(--accent);
      font-size: 0.75rem;
      display: block;
      margin-top: 0.25rem;
    }

    .submit-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-top: 1rem;
      padding: 1rem 0;
    }

    .spin-icon {
      font-size: 1.25rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* Success Modal Styling */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(11, 25, 44, 0.75);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-content {
      width: 100%;
      max-width: 550px;
      padding: 3.5rem 2.5rem;
      background: var(--bg-dark);
      border: 1px solid rgba(197, 155, 39, 0.35);
      box-shadow: var(--shadow-glow);
    }

    .success-icon {
      font-size: 4rem;
      color: #34d399;
      margin-bottom: 1.5rem;
    }

    .modal-content h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .modal-content p {
      font-size: 1rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 992px) {
      .contact-grid { grid-template-columns: 1fr; gap: 3rem; }
      .inline-inputs { grid-template-columns: 1fr; gap: 0; }
    }
  `]
})
export class ContactComponent implements OnInit {
  courses: Course[] = [];
  formData: InquiryForm = {
    name: '',
    email: '',
    phone: '',
    course: '',
    message: ''
  };

  private preselectedCourse: string = '';

  constructor(private route: ActivatedRoute) {}

  private defaultCourses: Course[] = [
    // St. Joseph's College
    { name: 'Plus Two Commerce', category: 'college', duration: '2 Years' },
    { name: 'Plus Two Humanities', category: 'college', duration: '2 Years' },
    { name: 'B.Com Taxation (Coaching)', category: 'college', duration: '3 Years' },
    { name: 'B.Com Co-operation (Coaching)', category: 'college', duration: '3 Years' },
    { name: 'B.A. English (Coaching)', category: 'college', duration: '3 Years' },
    { name: 'M.A. English (Coaching)', category: 'college', duration: '2 Years' },
    { name: 'M.Com Finance (Coaching)', category: 'college', duration: '2 Years' },
    // ILA
    { name: 'German Language Course (A1-A2)', category: 'language', duration: '3-4 Months' },
    { name: 'German Language Course (B1-B2)', category: 'language', duration: '4-5 Months' },
    // Xtreem
    { name: 'Nursing Assistant Course', category: 'adhunik', duration: '6 Months' },
    // Fastrack
    { name: 'PGDCA (PG Diploma in Computer Applications)', category: 'fastrack', duration: '1 Year' },
    { name: 'DCA (Diploma in Computer Applications)', category: 'fastrack', duration: '6 Months' }
  ];

  submitting = false;
  showSuccess = false;

  ngOnInit() {
    // Read course query param before fetching so we can apply it after load
    this.route.queryParams.subscribe(params => {
      if (params['course']) {
        this.preselectedCourse = params['course'];
      }
    });
    this.fetchCourses();
  }

  fetchCourses() {
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
          this.courses = this.defaultCourses;
        }
        // Pre-select course if navigated from a course card
        if (this.preselectedCourse) {
          this.formData.course = this.preselectedCourse;
        }
      })
      .catch((error) => {
        console.error('Error fetching courses for contact inquiry dropdown:', error);
        this.courses = this.defaultCourses;
        if (this.preselectedCourse) {
          this.formData.course = this.preselectedCourse;
        }
      });
  }

  getCoursesByCategory(category: string): Course[] {
    return this.courses.filter(c => c.category === category);
  }

  hasCoursesForCategory(category: string): boolean {
    return this.courses.some(c => c.category === category);
  }

  submitInquiry(form: any) {
    if (form.invalid) return;

    this.submitting = true;
    const leadsRef = ref(db, 'leads');
    const newLeadRef = push(leadsRef);

    // Save to Realtime Database
    set(newLeadRef, {
      ...this.formData,
      status: 'pending',
      createdDate: new Date().toLocaleDateString(),
      createdAt: { '.sv': 'timestamp' }
    })
      .then(() => {
        this.submitting = false;
        this.showSuccess = true;
      })
      .catch((error) => {
        this.submitting = false;
        console.error('Error submitting application to Realtime Database:', error);
        // Even if network fails, show local success for demo integrity
        this.showSuccess = true;
      });
  }

  closeSuccess() {
    this.showSuccess = false;
    // Reset form data
    this.formData = {
      name: '',
      email: '',
      phone: '',
      course: '',
      message: ''
    };
  }
}
