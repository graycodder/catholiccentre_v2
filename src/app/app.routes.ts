import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './shared/layouts/public-layout.component';
import { AdminLayoutComponent } from './shared/layouts/admin-layout.component';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/website/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./features/website/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/website/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'blog',
        loadComponent: () => import('./features/website/blog/blog.component').then(m => m.BlogComponent)
      },
      {
        path: 'adhunik',
        loadComponent: () => import('./features/website/adhunik/adhunik.component').then(m => m.AdhunikComponent)
      },
      {
        path: 'fastrack',
        loadComponent: () => import('./features/website/fastrack/fastrack.component').then(m => m.FastrackComponent)
      },
      {
        path: 'ila',
        loadComponent: () => import('./features/website/ila/ila.component').then(m => m.IlaComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/website/contact/contact.component').then(m => m.ContactComponent)
      }
    ]
  },
  
  // Admin Login route (no sidebar layout)
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login.component').then(m => m.LoginComponent)
  },

  // Protected Admin Dashboard routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'leads',
        loadComponent: () => import('./features/admin/leads/leads.component').then(m => m.LeadsComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./features/admin/courses/courses.component').then(m => m.CoursesComponent)
      },
      {
        path: 'faculty',
        loadComponent: () => import('./features/admin/faculty/faculty.component').then(m => m.FacultyComponent)
      },
      {
        path: 'teachers',
        loadComponent: () => import('./features/admin/teachers/teachers.component').then(m => m.TeachersComponent)
      },
      {
        path: 'blogs',
        loadComponent: () => import('./features/admin/blogs/blogs.component').then(m => m.BlogsComponent)
      },
      {
        path: 'leadership',
        loadComponent: () => import('./features/admin/leadership/leadership.component').then(m => m.LeadershipComponent)
      }
    ]
  },

  // Fallback wildcards
  {
    path: '**',
    redirectTo: ''
  }
];
