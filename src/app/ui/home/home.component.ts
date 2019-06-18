import { Component, OnInit } from '@angular/core';
import { ContractService } from './../../services/contract/contract.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  direction: string;
  constructor( private contract: ContractService) {
    contract.seeAccountInfo().then((value: any) => {
       this.direction = value.originAccount;
     }).catch((error: any) => {
       contract.failure('Could\'t get the account data, please check if metamask is running correctly and refresh the page');
     });
   }

  ngOnInit() {
  }

}
