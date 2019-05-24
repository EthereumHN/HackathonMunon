# Hackathon Muñón: Dapp edition

_Hack, review and split the pot!_

Hackathon Muñón: Dapp edition is a decentralized event where creators gather to build, network and have a good time. Every participant is a judge and reviews their peers work to split a pot. The pot is created and distributed in form of Ether with the help of this Ethereum [smart contract](https://github.com/Turupawn/HackathonMunon/blob/master/contracts/HackathonMunon.sol) and Angular frontend.

For more information, visit the [wiki](https://github.com/Turupawn/HackathonMunon/wiki).

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

1. Install truffle, Angular CLI and an Ethereum client. If you don't have a test environment 
  ```bash
  npm install -g truffle
  npm install -g @angular/cli
  npm install -g ganache-cli
  ```

2. Download the box.
  ```bash
  truffle unbox ng-es/angulartruffledapp
  ```

3. Run your Ethereum client. For Ganache CLI:
  ```bash
  ganache-cli
  ```
Note the mnemonic 12-word phrase printed on startup, you will need it later.

4. Compile and migrate your contracts.
  ```bash
  truffle compile && truffle migrate
  ```
5. Change the port  in truffle-config.js
 ```
 change the port in truffle-config.js 8545 in windows the port is 7545 but in linux the defaul port is  8545
  ```

* __Common errors and their solutions__

| Error | Solution |
|-------|----------|
| `Module not found: Error: Can't resolve '../../../../build/contracts/Payment.json'` during `ng serve` | Run `truffle compile` |
| `Error: the tx doesn't have the correct nonce.` in MetaMask | Reset MetaMask: Settings -> Reset Account |
| `Error getting balance; see log.` in UI, with `Error: MetaCoin has not been deployed to detected network (network/artifact mismatch)` in browser console | Ensure you have started ganache, run `truffle migrate` and configured MetaMask to point to ganache | `Error: i cannot see my account or balance` Ensure you are logged in metamask and refresh | If you have a custom rcp in ganache you can change the dir in `src/app/contract/contract.service.ts line21 with your dir `| `Error: [ethjs-rpc] rpc error with payload` in Metamask | You may need upadate Ganache and restart metamask because some old vesions give 0 gas and the transaction is mark as  underpriced |

Developped on top of Quintor's [Angular Truffle Box](https://github.com/Quintor/angular-truffle-box) and ng-es's [Boilerplate](https://github.com/ng-es/Angular-Truffle-Dapp/edit/master/README.md).

## Code contributions welcome!

1. Fork it
2. Add new features
```bash
git checkout -b my-new-feature
git commit -am 'Add some feature'
git push origin my-new-feature
```
3. Create a pull request
