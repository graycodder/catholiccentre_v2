import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="container hero-content animate-fade-in">
        <span class="badge badge-gold hero-badge">Admissions Open 2026-27</span>
        <h1 class="serif-text hero-title">St. Joseph's College</h1>
        <p class="hero-subtitle">
          Welcome to St. Joseph's College Thoppumpady! We provide exceptional coaching for Higher Secondary education and degree programs from Mahatma Gandhi University. With our passionate faculty and vibrant campus, you'll thrive and achieve your dreams.
        </p>
        <div class="hero-actions">
          <a routerLink="/services" class="btn-gold">Explore Courses</a>
          <a routerLink="/about" class="btn-outline">About Our History</a>
        </div>
      </div>
    </section>

    <!-- Academies / Offerings Grid -->
    <section class="section-padding academies-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="gold-gradient-text">OUR EDUCATIONAL DIVISIONS</h2>
          <p>We provide multiple specialized streams ranging from MG University degree coaching to language courses and government-certified diplomas.</p>
        </div>

        <div class="grid-cols-4 academy-grid">
          <!-- St. Joseph's Parallel College -->
          <div class="glass-card accent-card">
            <span class="material-icons-outlined card-icon">school</span>
            <h3>St. Joseph's College</h3>
            <p>Higher Secondary coaching & Degree/Postgraduate programs (B.A., B.Com, M.A., M.Com) under MG University.</p>
            <a [routerLink]="['/services']" [queryParams]="{ filter: 'college' }" class="card-link">View Programs &rarr;</a>
          </div>

          <!-- Language Academy -->
          <div class="glass-card gold-card">
            <span class="material-icons-outlined card-icon">translate</span>
            <h3>Language Academy</h3>
            <p>Cochin's oldest linguistic centre. German Language coaching (A1-B2) for Goethe/Telc/ÖSD certifications.</p>
            <a [routerLink]="['/services']" [queryParams]="{ filter: 'language' }" class="card-link">Learn German &rarr;</a>
          </div>

          <!-- Adhunik Professional Courses -->
          <div class="glass-card accent-card">
            <span class="material-icons-outlined card-icon">health_and_safety</span>
            <h3>Xtreem Coaching Center</h3>
            <p>Nursing Assistant training with government certification. 100% job placement assistance guaranteed.</p>
            <a routerLink="/adhunik" class="card-link font-gold">Read More &rarr;</a>
          </div>

          <!-- Fastrack Computer Academy -->
          <div class="glass-card gold-card">
            <span class="material-icons-outlined card-icon">terminal</span>
            <h3>Fastrack IT Academy</h3>
            <p>Government-approved computer diplomas (PGDCA, DCA, PDWD) and programming (Python, C, Web/Graphic Design).</p>
            <a routerLink="/fastrack" class="card-link">View IT Courses &rarr;</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Showcase Section -->
    <section class="section-padding video-section">
      <div class="container">
        <div class="section-header text-center">
          <span class="badge badge-gold">Explore Campus</span>
          <h2 class="serif-text gold-gradient-text">Welcome to St. Joseph's College: Explore Our Campus</h2>
          <p>Take a virtual tour of our college facilities, classroom environment, and campus life.</p>
        </div>
        <div class="video-container glass-card">
          <video controls width="100%" class="campus-video" poster="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1470&auto=format&fit=crop">
            <source src="https://cochincatholiccentre.com/images/ILA%20Final%20new.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>

    <!-- Heavenly Patron & Vision Section -->
    <section class="patron-section section-padding">
      <div class="container patron-grid">
        <div class="patron-image-container">
          <div class="patron-frame">
            <div class="patron-placeholder">
              <span class="material-icons-outlined">church</span>
              <h4>Catholic Centre</h4>
              <p>Thoppumpady, Cochin</p>
            </div>
          </div>
        </div>

        <div class="patron-details glass-card accent-card">
          <span class="badge badge-gold">Established in 1977</span>
          <h2 class="serif-text">Heavenly Patron: St. Joseph</h2>
          <p>
            St. Joseph, known as a man of deep silence, is a powerful intercessor before God. As the foster father of Jesus and protector of the Virgin Mother, he played a vital role in the redemption of the world. In 1870, Pope Pius IX declared St. Joseph the Patron of the Universal Church, recognizing his role as a faithful guardian.
          </p>
          <div class="vision-info">
            <div>
              <h5>Our Aim</h5>
              <p>To impart quality education and character values to coming generations.</p>
            </div>
            <div>
              <h5>Our Motto</h5>
              <p class="serif-text gold-text italic">"To have Life in Fullness"</p>
            </div>
          </div>
          <a routerLink="/about" class="btn-primary">Our Legacy & History</a>
        </div>
      </div>
    </section>

    <!-- Location & Location Callout -->
    <section class="location-section section-padding">
      <div class="container">
        <div class="grid-cols-2 location-grid">
          <div class="location-text-card glass-card">
            <h3>Find Us in Cochin</h3>
            <p>
              Located in the heart of Thoppumpady at the Catholic Centre, our campus offers a serene, disciplined, and spiritual atmosphere optimal for learning.
            </p>
            <p class="address-paragraph">
              <strong>Address:</strong><br>
              Catholic Centre, Cochin, Ernakulam, Kerala - 682005.
            </p>
            <a href="https://maps.app.goo.gl/xFmZpBPCRUe7UdxW6" target="_blank" class="btn-outline location-btn">
              <span class="material-icons-outlined">location_on</span>
              <span>Open in Google Maps</span>
            </a>
          </div>
          <div class="map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.988029517178!2d76.2587595!3d9.934947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080cff15cf1b43%3A0x7d6c81bb65caad!2sCatholic%20Centre!5e0!3m2!1sen!2sin!4v1717904323214!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style="border:0; border-radius:16px; box-shadow: var(--shadow-premium);" 
              allowfullscreen="" 
              loading="lazy">
            </iframe>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-banner">
      <div class="cta-overlay"></div>
      <div class="container cta-content text-center">
        <h2 class="serif-text">Unlock Your Academic Potential Today</h2>
        <p>Admissions are currently open for all academies. Secure your seat now and build a successful global future.</p>
        <a routerLink="/contact" class="btn-gold btn-large">Apply for Admission</a>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      position: relative;
      height: 80vh;
      min-height: 550px;
      display: flex;
      align-items: center;
      background: linear-gradient(rgba(11, 25, 44, 0.6), rgba(7, 15, 25, 0.95)), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1470&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, transparent 30%, var(--bg-dark) 95%);
      pointer-events: none;
    }

    .hero-content {
      position: relative;
      z-index: 10;
      max-width: 800px;
    }

    .hero-badge {
      margin-bottom: 1.5rem;
    }

    .hero-title {
      font-size: 4.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      letter-spacing: -0.03em;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 2.5rem;
    }

    .hero-actions {
      display: flex;
      gap: 1.25rem;
    }

    .section-header {
      max-width: 700px;
      margin: 0 auto 5rem auto;
    }

    .section-header h2 {
      font-size: 2.25rem;
      margin-bottom: 1rem;
    }

    .text-center {
      text-align: center;
    }

    .card-icon {
      font-size: 2.5rem;
      color: var(--gold);
      margin-bottom: 1.25rem;
    }

    .glass-card h3 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .glass-card p {
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }

    .card-link {
      color: var(--text-light);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: var(--transition-smooth);
    }

    .card-link:hover {
      color: var(--gold);
      padding-left: 5px;
    }

    .font-gold {
      color: var(--gold);
    }

    /* Heavenly Patron styling */
    .patron-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: stretch;
    }

    .patron-image-container {
      position: relative;
      height: 100%;
    }

    .patron-frame {
      border: 2px solid var(--border-gold);
      border-radius: 20px;
      padding: 1rem;
      box-shadow: var(--shadow-glow);
      height: 100%;
      display: flex;
    }

    .patron-placeholder {
      background: linear-gradient(135deg, #0e1d35 0%, #060b13 100%);
      border-radius: 16px;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      gap: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.03);
    }

    .patron-placeholder span {
      font-size: 4rem;
      color: var(--gold);
    }

    .patron-placeholder h4 {
      color: var(--text-light);
      font-size: 1.5rem;
    }

    .patron-details {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .patron-details .badge {
      align-self: flex-start;
    }

    .patron-details .btn-primary {
      margin-top: auto;
      align-self: flex-start;
    }

    .patron-details h2 {
      font-size: 2.5rem;
      margin-top: 1rem;
      margin-bottom: 1.5rem;
    }

    .patron-details p {
      font-size: 1rem;
      margin-bottom: 2rem;
    }

    .vision-info {
      display: flex;
      gap: 2rem;
      margin-bottom: 2.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 1.5rem;
    }

    .vision-info h5 {
      font-size: 0.95rem;
      color: var(--gold);
      margin-bottom: 0.5rem;
    }

    .vision-info p {
      font-size: 0.9rem;
      margin-bottom: 0;
    }

    .italic {
      font-style: italic;
    }

    /* Location section styling */
    .location-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: stretch;
      gap: 4rem;
    }

    .location-text-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .location-text-card h3 {
      font-size: 2rem;
      margin-bottom: 1.5rem;
    }

    .address-paragraph {
      margin-top: 1rem;
      margin-bottom: 2rem !important;
      font-size: 0.95rem;
    }

    .location-btn {
      margin-top: auto;
      align-self: flex-start;
    }

    .map-container {
      min-height: 380px;
      height: 100%;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* Video Section styling */
    .video-section {
      background: linear-gradient(180deg, var(--bg-dark) 0%, #080f1b 100%);
    }

    .video-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0.5rem;
      border: 1px solid rgba(212, 175, 55, 0.2);
      box-shadow: var(--shadow-glow);
      border-radius: 20px;
      overflow: hidden;
      background: rgba(13, 23, 38, 0.6);
      backdrop-filter: blur(12px);
    }

    .campus-video {
      display: block;
      width: 100%;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      outline: none;
    }

    /* CTA Banner styling */
    .cta-banner {
      position: relative;
      padding: 7rem 0;
      background: linear-gradient(rgba(184, 0, 31, 0.4), rgba(7, 15, 25, 0.95)), url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1470&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
    }

    .cta-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, transparent 20%, var(--bg-dark) 90%);
    }

    .cta-content {
      position: relative;
      z-index: 10;
      max-width: 800px;
      margin: 0 auto;
    }

    .cta-content h2 {
      font-size: 3rem;
      margin-bottom: 1.5rem;
    }

    .cta-content p {
      font-size: 1.15rem;
      margin-bottom: 2.5rem;
      color: var(--text-light);
      opacity: 0.85;
    }

    .btn-large {
      padding: 1rem 2.5rem !important;
      font-size: 1.05rem !important;
    }

    @media (max-width: 992px) {
      .hero-title { font-size: 3rem; }
      .patron-grid { grid-template-columns: 1fr; gap: 2rem; }
      .location-grid { grid-template-columns: 1fr; gap: 2rem; }
      .cta-content h2 { font-size: 2.25rem; }
    }

    @media (max-width: 576px) {
      .hero-title { font-size: 2.5rem; }
      .hero-actions { flex-direction: column; }
    }
  `]
})
export class HomeComponent {}
