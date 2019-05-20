import { Injectable } from '@angular/core';
import contract from 'truffle-contract';
import { MdcSnackbar } from '@angular-mdc/web';
import { Subject } from 'rxjs';

declare let require: any;
const Web3 = require('web3');
const hackathonMunon = require('../../../../build/contracts/HackathonMunon.json');

declare let window: any;

@Injectable({
  providedIn: 'root'
})

export class ContractService {
  private web3Provider;
  private contracts: {};
  private accounts: string[];
  public accountsObservable = new Subject<string[]>();

  constructor(private snackbar: MdcSnackbar) {
    if (typeof window.web3 !== 'undefined') {
      this.web3Provider = window.web3.currentProvider;
      console.log(this.web3Provider);
    } else {
      this.web3Provider = new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545');
      // lo cambias por tu numero de puerto en linux es http://localhost:7545
   // } else {
   //   borrar el localhost y usar este si se va a usar en la red de infura
   //   console.log('Un parece que no estas conectado');
   //   Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
   //   this.web3Provider = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/ca2b12f732ef47fcb6b76223b39f8cf3'));
   // Cambiarlo con la private key propia de infura.io
    }

    window.web3 = new Web3(this.web3Provider);
    try{
      this.web3Provider.enable();
      console.log('web3 enabled');
    }catch(error)
    {
      console.log('could not enable web3');
    }
  }

  seeAccountInfo() {
    return new Promise((resolve, reject) => {
      window.web3.eth.getCoinbase((err, account) => {
          if (account === true) {
            console.log('dondt work' + account);
            return reject({name: 'account'});
          } else {
            window.web3.eth.getBalance(account, (error, balance) => {
              if (error === false) {
                return resolve({
                  originAccount: account,
                  balance: (window.web3.utils.fromWei(balance, 'ether'))
                });
              } else {
                console.log(balance);
                return reject({name: 'balance'});
              }
            });
          }
      });
    });
  }

   refreshAccounts() {

    window.web3.eth.getAccounts((err, accs) => {
      console.log('Refreshing accounts');
      if (err === true) {
        console.warn('There was an error fetching your accounts.');
        console.log(err , accs);
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      console.log('ready');
   });
  }

  trasnferEther(originAccount, destinyAccount, amount) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);

      hackathonMunonContract.deployed().then((instance) => {
          return instance.nuevaTransaccion(
            destinyAccount,
            {
              from: originAccount,
              value: window.web3.utils.toWei(amount, 'ether')
            });
        }).then((status) => {
          if (status) {
            return resolve({status: true});
          }
        }).catch((error) => {
          console.log(error);

          return reject('Error transfering Ether');
        });
    });
  }

  createHackathonService(originAccount) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.createEvent(
          {
            from: originAccount,
          });
        }).then((status) => {
          if (status) {
            return resolve(status);
          }
        }).catch((error) => {
          console.log(error);
          return reject('Error creating hackathon');
        });
    });
  }

  joinHackathonService(originAccount, event_id) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.join(
            event_id,
            {
              from: originAccount,
              value: window.web3.utils.toWei('10', 'finney')
            }
          );
        }).then((status) => {
          if (status) {
            return resolve(status);
          }
        }).catch((error) => {
          console.log(error);
          return reject('Error joining hackathon');
        });
    });
  }

  rateHackathonService(originAccount, event_id, participant_id, points) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.rate(
            event_id,
            participant_id,
            points,
            {
              from: originAccount,
            }
          );
        }).then((status) => {
          if (status) {
            return resolve(status);
          }
        }).catch((error) => {
          console.log(error);
          return reject('Error when trying to rate');
        });
    });
  }

  cashoutHackathonService(originAccount, event_id) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.cashOut(
            event_id,
            {
              from: originAccount
            }
          );
        }).then((status) => {
          if (status) {
            return resolve({status: true});
          }
        }).catch((error) => {
          console.log(error);
          return reject('Error cashing out from hackathon');
        });
    });
  }

  failure(message: string) {
    const snackbarRef = this.snackbar.open(message);
    snackbarRef.afterDismiss().subscribe(reason => {});
  }

  succes() {
    const snackbarRef = this.snackbar.open('Transaction complete successfuly');
    snackbarRef.afterDismiss().subscribe(reason => {});
  }

  printSnackbarMessage(message: string) {
    const snackbarRef = this.snackbar.open(message);
    snackbarRef.afterDismiss().subscribe(reason => {});
  }
}
