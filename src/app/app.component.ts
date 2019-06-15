import { Component, OnInit } from '@angular/core';
import { ContractService} from './services/contract/contract.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
acount;
  constructor( private contract: ContractService
    ) {}

   ngOnInit() {
  }
}
