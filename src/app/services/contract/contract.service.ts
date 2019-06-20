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
  public success: boolean;
  constructor(private snackbar: MdcSnackbar) {
     if (typeof window.web3 === 'undefined' || (typeof window.ethereum !== 'undefined')) {
      this.web3Provider = window.ethereum || window.web3;
      console.log(this.web3Provider);
      window.web3 = new Web3(this.web3Provider);
    } else {
   this.web3Provider = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/b77387df3b3c41d69d7f106238a391a6'));
   //   this.web3Provider = new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545');
      // lo cambias por tu numero de puerto en linux es http://localhost:7545
   // } else {
   //   borrar el localhost y usar este si se va a usar en la red de infura
   //   console.log('Un parece que no estas conectado');
   //   Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
   //   this.web3Provider = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/fcbcb2a5dc574c33be6baa5d697bcf20'));
   // Cambiarlo con la private key propia de infura.io
    }
     try {
      this.web3Provider.enable();
      this.success = true;
      console.log('web3 enabled');
    } catch (error) {
      this.success = false;
      console.log('could not enable web3' + this.success);
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
    console.log('testing');
    console.log(originAccount);

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.createHackathon(
            '',
            '',
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

  joinHackathonService(originAccount, hackathon_id) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.join(
            hackathon_id,
            {
              from: originAccount,
              value: window.web3.utils.toWei('0.03', 'ether')
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

  sponsorHackathonService(originAccount, hackathon_id, sponsorship_value) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.sponsor(
            hackathon_id,
            {
              from: originAccount,
              value: window.web3.utils.toWei(sponsorship_value, 'ether')
            }
          );
        }).then((status) => {
          if (status) {
            return resolve(status);
          }
        }).catch((error) => {
          console.log(error);
          return reject('Error sponsoring hackathon');
        });
    });
  }

  enableReviewHackathonService(originAccount, hackathon_id) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.enableHackathonReview(
            hackathon_id,
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
          return reject('Error enabling review');
        });
    });
  }

  finishHackathonService(originAccount, hackathon_id) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.finishHackathon(
            hackathon_id,
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
          return reject('Error finishing hackathon');
        });
    });
  }

  rateHackathonService(originAccount, hackathon_id, participant_id, points) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.rate(
            hackathon_id,
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

  cashoutHackathonService(originAccount, hackathon_id) {
    const that = this;

    return new Promise((resolve, reject) => {
      const hackathonMunonContract = contract(hackathonMunon);
      hackathonMunonContract.setProvider(that.web3Provider);
      hackathonMunonContract.deployed().then((instance) => {
          return instance.cashOut(
            hackathon_id,
            {
              from: originAccount
            }
          );
        }).then((status) => {
          if (status) {
            return resolve(status);
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
