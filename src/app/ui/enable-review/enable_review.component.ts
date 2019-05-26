import { contract } from 'truffle-contract';
import { Component, OnInit } from '@angular/core';
import { ContractService } from './../../services/contract/contract.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MdcSnackbar } from '@angular-mdc/web';

type EnableReviewField = 'sendaddress' | 'hackathon_id';
type FormErrors = {[u in EnableReviewField]: string};
@Component({
  selector: 'app-enable-reivew',
  templateUrl: './enable_review.component.html',
  styleUrls: ['./enable_review.component.scss']
})
export class EnableReviewComponent implements OnInit {
  direction: string;
  address: string;
  hackathon_id: string;
  balance: string;
  success: boolean;
  enableReviewDone: boolean;

  enableReviewForm: FormGroup;
  formErrors: FormErrors = {
    sendaddress: '',
    hackathon_id: '',
  };
  validationMessages = {
   sendaddress: {
   required: 'The send address is required ',
   pattern: 'that´s no looks like a valid address',
   minlength: 'a address must have much than 40 characters',

   },
   hackathon_id: {
     required: 'Need a hackathon id to enable review',
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
    this.enableReviewForm = this.frb.group({
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
    });
    this.enableReviewForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged();
  }

  reset() {
    this.enableReviewForm.reset();
  }

  enableReviewHackathon(e) {
    this.hackathon_id = this.enableReviewForm.value.hackathon_id;
    this.contract.enableReviewHackathonService(this.direction, this.hackathon_id).then((r) => {
      var hackathon_id = r['logs'][0]['args']['hackathon_id']['words'][0];
      this.contract.printSnackbarMessage("Success! Review for hackathon " + hackathon_id + " is now enabled.");
      console.log(r);
    }).catch((e) => {
      this.contract.failure('Enable reivew failed');
    });
  }

  onValueChanged(data?: any) {
    if (!this.enableReviewForm) { return; }
    const form = this.enableReviewForm;
    for (const field in this.formErrors) {
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field) && (field === 'sendaddress' || field === 'hackathon_id')) {
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
