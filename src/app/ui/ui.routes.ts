import { AccountComponent } from './account/account.component';
import { HomeComponent } from './home/home.component';
import { CreateComponent } from './create/create.component';
import { JoinComponent } from './join/join.component';
import { RateComponent } from './rate/rate.component';
import { CashoutComponent } from './cashout/cashout.component';
import { TransactionComponent } from './transaction/transaction.component';
import { Routes } from '@angular/router';
export const UiRoute: Routes = [
  { path: '', component: TransactionComponent },
  { path: 'home', component: HomeComponent},
  { path: 'create', component: CreateComponent},
  { path: 'join', component: JoinComponent},
  { path: 'rate', component: RateComponent},
  { path: 'cashout', component: CashoutComponent},
  { path: 'account', component: AccountComponent}
];


