import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { auth } from './firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    // Check firebase authentication state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true);
      } else {
        router.navigate(['/admin/login']);
        resolve(false);
      }
    });
  });
};
