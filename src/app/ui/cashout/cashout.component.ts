import { contract } from 'truffle-contract';
import { Component, OnInit } from '@angular/core';
import { ContractService } from './../../services/contract/contract.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MdcSnackbar } from '@angular-mdc/web';

type CashoutField = 'sendaddress' | 'event_id';
type FormErrors = {[u in CashoutField]: string};
@Component({
  selector: 'app-cashout',
  templateUrl: './cashout.component.html',
  styleUrls: ['./cashout.component.scss']
})
export class CashoutComponent implements OnInit {
  direction: string;
  address: string;
  event_id: string;
  balance: string;
  success: boolean;
  cashoutDone: boolean;

  cashoutForm: FormGroup;
  formErrors: FormErrors = {
    sendaddress: '',
    event_id: '',
  };
  validationMessages = {
   sendaddress: {
   required: 'The send address is required ',
   pattern: 'that´s no looks like a valid address',
   minlength: 'a address must have much than 40 characters',

   },
   event_id: {
     required: 'Need an event id to cashout',
     pattern: 'Only support numbers',
   },
  };

// tslint:disable-next-line: no-shadowed-variable
  constructor(private frb: FormBuilder, private contract: ContractService, private snackbar: MdcSnackbar) {
   contract.seeAccountInfo().then((value: any) => {
      this.direction = value.originAccount;
      this.balance = value.balance;
    }).catch((error: any) => {
      contract.failure('Could\'t get the account data, please check if metamask is running correctly and refresh the page');
    });
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.cashoutForm = this.frb.group({
      sendaddress: ['', [
          Validators.required,
          Validators.minLength(42),
        ]
      ],
      event_id : ['', [
          Validators.required,
          Validators.pattern(/^[+-]?\d+(\.\d+)?$/),
        ]
      ],
    });
    this.cashoutForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged();
  }

  reset() {
    this.cashoutForm.reset();
  }

  cashoutHackathon(e) {
    this.event_id = this.cashoutForm.value.event_id;
    this.contract.cashoutHackathonService(this.direction, this.event_id).then((r) => {
      this.contract.succes();
    }).catch((e) => {
      this.contract.failure('Cashout failed');
    });
  }

  onValueChanged(data?: any) {
    if (!this.cashoutForm) { return; }
    const form = this.cashoutForm;
    for (const field in this.formErrors) {
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'sendaddress' || field === 'event_id')) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          if (control.errors) {
            for (const key in control.errors) {
              if (Object.prototype.hasOwnProperty.call(control.errors, key) ) {
                this.formErrors[field] += `${(messages as {[key: string]: string})[key]} `;
              }
            }
          }
        }
      }
    }
  }
}
