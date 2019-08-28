import { ContractService } from './../../services/contract/contract.service';
import { Component, OnInit, Inject } from '@angular/core';
import { WEB3} from '../../core/web3';
import { ThreeBox } from '../../services/3box.service';
import { MdcSnackbar } from '@angular-mdc/web';
import { DomSanitizer } from '@angular/platform-browser';
import { Identicon } from '../../services/identicon';
import {Md5} from 'ts-md5/dist/md5';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  direction;
  balance: string;
  data;

  constructor(
    @Inject(WEB3) private web3,
    private threebox: ThreeBox,
    private contract: ContractService,
    private snackbar: MdcSnackbar,
    private sanitizer: DomSanitizer) {
   contract.seeAccountInfo().then((value: any) => {
      this.direction = value.originAccount;
      this.balance = value.balance;
      const accounts = this.threebox.getProfile(this.direction);
      console.log(accounts);
      this.getImage();

    }).catch((error: any) => {
      contract.failure('Could\'t get the account data, please check if metamask is running correctly and refresh the page');
    });

  }

  async ngOnInit() {

  }

  /** Open a box and update the current box open in the service */
  public openBox(address?: string) {
    console.log('Doctor');
    return this.threebox.openBox(address);
  }

  /** Set a public key in your profile */
  public setPublicProfile(key: string, value: string) {
    return this.threebox.box.public.set(key, value);
  }

  /** Get a public key in your profile */
  public getPublicProfile(key: string) {
    return this.threebox.box.public.get(key);
  }

  /** Set a private key in your profile */
  public setPrivateProfile(key: string, value: string) {
    return this.threebox.box.private.set(key, value);
  }

  /** Get a private key in your profile */
  public getPrivateProfile(key: string) {
    return this.threebox.box.private.get(key);
  }

  /**
   * Get the profile of an address
   * @param address the address to get the profile from.
   */
  public getProfile(address: string) {
    this.threebox.getProfile(address)
      .then(profile => console.log({profile}));
  }

   getImage() {
    this.data = this.sanitizer.bypassSecurityTrustResourceUrl( (
      'data:image/svg+xml; utf8,'
      + encodeURI(new Identicon( Md5.hashStr(this.direction), {size: 32, format: 'svg'} ).toString(true))
    ));
  }

  navigateTo() {
    window.open('https://metamask.io/');
  }
}


