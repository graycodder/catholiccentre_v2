import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-grid">
        <!-- Main Brand Column -->
        <div class="footer-brand">
          <a routerLink="/" class="footer-logo">
            <span class="material-icons-outlined gold-text logo-icon">church</span>
            <h3 class="serif-text">CATHOLIC CENTRE</h3>
          </a>
          <p class="footer-desc">
            Serving the community since 1977. Providing exceptional educational coaching under the Diocese of Cochin.
          </p>
          <div class="social-icons">
            <a href="#" aria-label="Facebook"><span class="material-icons-outlined">facebook</span></a>
            <a href="#" aria-label="Instagram"><span class="material-icons-outlined">camera_alt</span></a>
            <a href="#" aria-label="YouTube"><span class="material-icons-outlined">smart_display</span></a>
          </div>
        </div>

        <!-- Quick Links Column -->
        <div class="footer-links">
          <h4>HELPFUL LINKS</h4>
          <ul>
            <li><a routerLink="/">Home</a></li>
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/services">Our Courses</a></li>
            <li><a routerLink="/blog">News & Blog</a></li>
            <li><a routerLink="/contact">Contact Us</a></li>
            <li><a routerLink="/admin/login">Admin Portal</a></li>
          </ul>
        </div>

        <!-- Academies Column -->
        <div class="footer-links">
          <h4>OUR ACADEMIES</h4>
          <ul>
            <li><a [routerLink]="['/services']" [queryParams]="{ filter: 'college' }">St. Joseph's College</a></li>
            <li><a [routerLink]="['/services']" [queryParams]="{ filter: 'language' }">Language Academy (ILA)</a></li>
            <li><a routerLink="/adhunik">Xtreem Coaching Center</a></li>
            <li><a routerLink="/fastrack">Fastrack Computer Academy</a></li>
          </ul>
        </div>

        <!-- Address & Contact Column -->
        <div class="footer-contact">
          <h4>LOCATION & CONTACT</h4>
          <p class="contact-item">
            <span class="material-icons-outlined gold-text">place</span>
            <span>Catholic Centre, Thoppumpady, Cochin, Ernakulam, Kerala - 682005.</span>
          </p>
          <p class="contact-item">
            <span class="material-icons-outlined gold-text">phone</span>
            <a href="tel:+914842981533">+0 484 298 15 33</a>, <a href="tel:+914842231533">223 15 33</a>
          </p>
          <p class="contact-item">
            <span class="material-icons-outlined gold-text">smartphone</span>
            <span>920 733 15 33, 938 344 71 49</span>
          </p>
          <p class="contact-item">
            <span class="material-icons-outlined gold-text">mail</span>
            <a href="mailto:stjosephscolleget@gmail.com">stjosephscolleget&#64;gmail.com</a>
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-flex">
          <p>&copy; 2026 Cochin Catholic Centre. All Rights Reserved.</p>
          <p>Managed by the Diocese of Cochin</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #040910;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 5rem 0 0 0;
      margin-top: auto;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1.2fr 2fr;
      gap: 3rem;
      padding-bottom: 4rem;
    }

    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--text-light);
    }

    .logo-icon {
      font-size: 2rem;
    }

    .footer-logo h3 {
      font-size: 1.35rem;
      letter-spacing: 0.05em;
    }

    .footer-desc {
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .social-icons {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .social-icons a {
      color: var(--text-muted);
      transition: var(--transition-smooth);
    }

    .social-icons a:hover {
      color: var(--gold);
      transform: translateY(-2px);
    }

    .footer-links h4, .footer-contact h4 {
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      color: var(--text-light);
      margin-bottom: 1.5rem;
      font-weight: 700;
    }

    .footer-links ul {
      list-style: none;
      padding: 0;
    }

    .footer-links li {
      margin-bottom: 0.75rem;
    }

    .footer-links a {
      text-decoration: none;
      color: var(--text-muted);
      font-size: 0.9rem;
      transition: var(--transition-smooth);
    }

    .footer-links a:hover {
      color: var(--gold);
      padding-left: 5px;
    }

    .footer-contact {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .contact-item {
      display: flex;
      gap: 0.75rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .contact-item a {
      color: var(--text-muted);
      text-decoration: none;
      transition: var(--transition-smooth);
    }

    .contact-item a:hover {
      color: var(--gold);
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 1.5rem 0;
      background: #02050a;
    }

    .footer-bottom-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    @media (max-width: 992px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem;
      }
    }

    @media (max-width: 576px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .footer-bottom-flex {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
