import { AccountComponent } from './account/account.component';
import { HomeComponent } from './home/home.component';
import { JoinComponent } from './join/join.component';
import { TransactionComponent } from './transaction/transaction.component';
import { Routes } from '@angular/router';
export const UiRoute: Routes = [
  { path: '', component: TransactionComponent },
  { path: 'home', component: HomeComponent},
  { path: 'join', component: JoinComponent},
  { path: 'account', component: AccountComponent}
];


