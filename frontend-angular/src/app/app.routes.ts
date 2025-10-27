import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Shop } from './components/shop/shop';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Profile } from './components/profile/profile';
import { Offers } from './components/offers/offers';
import { Payment } from './components/payment/payment';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'shop', component: Shop },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'offers', component: Offers, canActivate: [authGuard] },
  { path: 'payment', component: Payment, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
