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
  profile;
  url;
  constructor(
    @Inject(WEB3) private web3,
    private threebox: ThreeBox,
    private contract: ContractService,
    private snackbar: MdcSnackbar,
    private sanitizer: DomSanitizer) {
   contract.seeAccountInfo().then((value: any) => {
      this.direction = value.originAccount;
      this.balance = value.balance;
      this.profile = this.threebox.getProfile(this.direction).then(response => {
      this.profile = response;
      this.url = (this.profile.image[0].contentUrl['/']);
      }
      );
      this.getImage();
    }).catch((error: any) => {
      contract.failure('Could\'t get the account data, please check if metamask is running correctly and refresh the page');
    });

  }

  async ngOnInit() {
 // this.threebox.getPublicProfile(this.direction).then((response) => console.log(response));

}



  public setPublicProfile(key: string, value: string) {
    return this.threebox.box.public.set(key, value);
  }


  public setPrivateProfile(key: string, value: string) {
    return this.threebox.box.private.set(key, value);
  }

  public getPrivateProfile(key: string) {
    return this.threebox.box.private.get(key);
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


