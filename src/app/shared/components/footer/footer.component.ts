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
          <a routerLink="/" (click)="scrollToTop()" class="footer-logo">
            <img src="logo.png" alt="Catholic Centre Logo" class="logo-img">
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
            <li><a routerLink="/" (click)="scrollToTop()">Home</a></li>
            <li><a routerLink="/about" (click)="scrollToTop()">About Us</a></li>
            <li><a routerLink="/courses" (click)="scrollToTop()">Our Courses</a></li>
            <li><a routerLink="/blog" (click)="scrollToTop()">News & Blog</a></li>
            <li><a routerLink="/contact" (click)="scrollToTop()">Contact Us</a></li>
          </ul>
        </div>

        <!-- Academies Column -->
        <div class="footer-links">
          <h4>OUR ACADEMIES</h4>
          <ul>
            <li><a routerLink="/college" (click)="scrollToTop()">St. Joseph's College</a></li>
            <li><a routerLink="/ila" (click)="scrollToTop()">International Language Academy (ILA)</a></li>
            <li><a routerLink="/xtreem" (click)="scrollToTop()">Xtreem Coaching Center</a></li>
            <li><a routerLink="/fastrack" (click)="scrollToTop()">Fastrack Computer Center</a></li>
          </ul>
        </div>

        <!-- Address & Contact Column -->
        <div class="footer-contact">
          <h4>LOCATION & CONTACT</h4>
          <p class="contact-item">
            <span class="material-icons-outlined gold-text">place</span>
            <span>Catholic Centre, Thoppumpady, Cochin, Ernakulam, Kerala - 682005.</span>
          </p>
          <div class="contact-item">
            <span class="material-icons-outlined gold-text">phone</span>
            <div class="phone-list">
              <div><a href="tel:+914842981533">+0 484 298 15 33</a></div>
              <div><a href="tel:+914842231533">+0 484 223 15 33</a></div>
              <div><a href="tel:+914843190183">+0 484 319 01 83</a></div>
            </div>
          </div>
          <div class="contact-item">
            <span class="material-icons-outlined gold-text">smartphone</span>
            <div class="phone-list">
              <div><a href="tel:+919207331533">920 733 15 33</a> <span class="phone-label">(Mobile)</span></div>
              <div><a href="tel:+919383447149">938 344 71 49</a> <span class="phone-label">(Mobile)</span></div>
              <div><a href="tel:+919995481533">999 548 15 33</a> <span class="phone-label">(Mobile)</span></div>
            </div>
          </div>
          <div class="contact-item">
            <span class="material-icons-outlined gold-text">mail</span>
            <div class="phone-list">
              <div><a href="mailto:stjosephscolleget@gmail.com">stjosephscolleget&#64;gmail.com</a></div>
              <div><a href="mailto:ila.stjoseph2024@gmail.com">ila.stjoseph2024&#64;gmail.com</a></div>
            </div>
          </div>
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
      background: #0b192c;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
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
      color: #ffffff;
    }

    .logo-img {
      height: 40px;
      width: auto;
      object-fit: contain;
    }

    .footer-logo h3 {
      font-size: 1.35rem;
      letter-spacing: 0.05em;
      color: #ffffff;
    }

    .footer-desc {
      font-size: 0.9rem;
      line-height: 1.6;
      color: rgba(248, 250, 252, 0.75);
    }

    .social-icons {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .social-icons a {
      color: rgba(248, 250, 252, 0.6);
      transition: var(--transition-smooth);
    }

    .social-icons a:hover {
      color: var(--gold);
      transform: translateY(-2px);
    }

    .footer-links h4, .footer-contact h4 {
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      color: #ffffff;
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
      color: rgba(248, 250, 252, 0.7);
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
      color: rgba(248, 250, 252, 0.75);
    }

    .contact-item a {
      color: rgba(248, 250, 252, 0.7);
      text-decoration: none;
      transition: var(--transition-smooth);
    }

    .contact-item a:hover {
      color: var(--gold);
    }

    .phone-list {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .phone-label {
      font-size: 0.8rem;
      color: rgba(248, 250, 252, 0.5);
      margin-left: 0.25rem;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 1.5rem 0;
      background: #071120;
    }

    .footer-bottom-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: rgba(248, 250, 252, 0.5);
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
export class FooterComponent {
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
