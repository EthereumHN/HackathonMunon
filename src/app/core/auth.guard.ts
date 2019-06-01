
import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../core/auth.service';
import { ContractService } from '../services/contract/contract.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    public afAuth: AngularFireAuth,
    public authService: AuthService,
    public contract: ContractService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve) => {
      this.contract.seeAccountInfo()
      .then(user => {
        if (!user) {
            this.router.navigate(['/account/edit']);
          }
      }, err => {
        this.router.navigate(['']);
      });
    });
  }
}
