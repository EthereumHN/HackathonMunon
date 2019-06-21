require("dotenv").config();
const HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = process.env.MNENOMIC;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    rinkeby: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () =>
        new HDWalletProvider(mnemonic, process.env.rinkeby.infura.io/v3/fcbcb2a5dc574c33be6baa5d697bcf20
          ),
      network_id: "4",
      gas: 4600000,
      gasPrice: 10000000000,
      skipDryRun: true
    },
    mainnet: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () =>
        new HDWalletProvider(mnemonic, "https://mainnet.infura.io/v3/b77387df3b3c41d69d7f106238a391a6"
          ),
      network_id: "1",
      gas: 4600000,
      gasPrice: 10000000000
    }
  },
  compilers: {
    solc: {
      version: "0.5.2",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
