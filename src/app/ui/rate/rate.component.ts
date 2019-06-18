import { contract } from 'truffle-contract';
import { Component, OnInit } from '@angular/core';
import { ContractService } from './../../services/contract/contract.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MdcSnackbar } from '@angular-mdc/web';

type RateField = 'sendaddress' | 'hackathon_id' | 'participant_id' | 'points';
type FormErrors = {[u in RateField]: string};
@Component({
  selector: 'app-rate',
  templateUrl: './rate.component.html',
  styleUrls: ['./rate.component.scss']
})
export class RateComponent implements OnInit {
  direction: string;
  address: string;
  hackathon_id: string;
  participant_id: string;
  points: string;
  balance: string;
  success: boolean;
  rateDone: boolean;

  rateForm: FormGroup;
  formErrors: FormErrors = {
    sendaddress: '',
    hackathon_id: '',
    participant_id: '',
    points: '',
  };
  validationMessages = {
    sendaddress: {
    required: 'The send address is required ',
    pattern: 'that´s no looks like a valid address',
    minlength: 'a address must have much than 40 characters',
    },
    hackathon_id: {
      required: 'Need a hackathon id and stuff to rate',
      pattern: 'Only support numbers',
    },
    participant_id: {
      required: 'Need a participant id and stuff to rate',
      pattern: 'Only support numbers',
    },
    points: {
      required: 'Need points and stuff to rate',
      max: 'Max points exceeded'
    }
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
    this.rateForm = this.frb.group({
      hackathon_id : ['', [
          Validators.required,
          Validators.pattern(/^[+-]?\d+(\.\d+)?$/),
        ]
      ],
      participant_id : ['', [
          Validators.required,
        ]
      ],
      points : ['', [
          Validators.required,
          Validators.min(0),
          Validators.max(5)
        ]
      ],
    });
    this.rateForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged();
  }

  reset() {
    this.rateForm.reset();
  }

  rateHackathon(e) {
    this.hackathon_id = this.rateForm.value.hackathon_id;
    this.participant_id = this.rateForm.value.participant_id;
    this.points = this.rateForm.value.points;
    this.contract.rateHackathonService(this.direction, this.hackathon_id, this.participant_id, this.points).then((r) => {
      this.contract.succes();
      console.log(r);
    }).catch((e) => {
      this.contract.failure('Rate failed');
    });
  }

  onValueChanged(data?: any) {
    if (!this.rateForm) { return; }
    const form = this.rateForm;
    for (const field in this.formErrors) {
// tslint:disable-next-line: max-line-length
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'points' || field === 'hackathon_id'|| field === 'participant_id')) {
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
