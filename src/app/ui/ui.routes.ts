import { AccountComponent } from './account/account.component';
import { AuthGuard } from '../core/auth.guard';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { CreateComponent } from './create/create.component';
import { JoinComponent } from './join/join.component';
import { SponsorComponent } from './sponsor/sponsor.component';
import { EnableReviewComponent } from './enable-review/enable_review.component';
import { FinishComponent } from './finish/finish.component';
import { RateComponent } from './rate/rate.component';
import { CashoutComponent } from './cashout/cashout.component';
import { Routes } from '@angular/router';
export const UiRoute: Routes = [
  { path: '', component: HomeComponent , },
  { path: 'admin', component: AdminComponent , },
  { path: 'create', component: CreateComponent},
  { path: 'join', component: JoinComponent},
  { path: 'sponsor', component: SponsorComponent},
  { path: 'enable-review', component: EnableReviewComponent},
  { path: 'finish', component: FinishComponent},
  { path: 'rate', component: RateComponent},
  { path: 'cashout', component: CashoutComponent},
  { path: 'account', component: AccountComponent}
];


