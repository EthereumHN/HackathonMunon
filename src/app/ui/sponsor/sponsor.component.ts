import { contract } from 'truffle-contract';
import { Component, OnInit } from '@angular/core';
import { ContractService } from './../../services/contract/contract.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MdcSnackbar } from '@angular-mdc/web';

type SponsorField = 'sendaddress' | 'hackathon_id' | 'sponsorship_value';
type FormErrors = {[u in SponsorField]: string};
@Component({
  selector: 'app-sponsor',
  templateUrl: './sponsor.component.html',
  styleUrls: ['./sponsor.component.scss']
})
export class SponsorComponent implements OnInit {
  direction: string;
  address: string;
  hackathon_id: string;
  sponsorship_value: string;
  balance: string;
  success: boolean;
  sponsorDone: boolean;

  sponsorForm: FormGroup;
  formErrors: FormErrors = {
    sendaddress: '',
    hackathon_id: '',
    sponsorship_value: ''
  };
  validationMessages = {
   sendaddress: {
   required: 'The send address is required ',
   pattern: 'that´s no looks like a valid address',
   minlength: 'a address must have much than 40 characters',

   },
   hackathon_id: {
    required: 'Need a hackathon id to sponsor',
    pattern: 'Only support numbers',
   },
   sponsorship_value: {
    required: 'Need an ether amount to sponsor',
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
    this.sponsorForm = this.frb.group({
      sendaddress: ['', [
          Validators.required,
          Validators.minLength(42),
        ]
      ],
      hackathon_id : ['', [
        Validators.required,
        Validators.pattern(/^[+-]?\d+(\.\d+)?$/),
      ]
      ],
      sponsorship_value : ['', [
          Validators.required,
          Validators.pattern(/^[+-]?\d+(\.\d+)?$/),
        ]
      ],
    });
    this.sponsorForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged();
  }

  reset() {
    this.sponsorForm.reset();
  }

  sponsorHackathon(e) {
    this.hackathon_id = this.sponsorForm.value.hackathon_id;
    this.sponsorship_value = this.sponsorForm.value.sponsorship_value;
    this.contract.sponsorHackathonService(this.direction, this.hackathon_id, this.sponsorship_value).then((r) => {
      var hackathon_id = r['logs'][0]['args']['hackathon_id']['words'][0];
      var sponsorship_value = r['logs'][0]['args']['sponsorship_value']['words'][0];
      this.contract.printSnackbarMessage("Success! You contributed with: " + sponsorship_value + " eth to to hackathon " + hackathon_id);
      console.log(r);
    }).catch((e) => {
      this.contract.failure('Sponsor failed');
    });
  }

  onValueChanged(data?: any) {
    if (!this.sponsorForm) { return; }
    const form = this.sponsorForm;
    for (const field in this.formErrors) {
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'sendaddress' || field === 'hackathon_id' || field === 'sponsorship_value')) {
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
