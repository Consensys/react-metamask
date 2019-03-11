import Web3 from "web3"; // eslint-disable-line import/no-unresolved

export default class MetaMask {
  static async initialize({ maxListeners } = { maxListeners: 300 }) {
    const instance = await MetaMask.getWeb3();
    const provider = instance.currentProvider;
    provider.setMaxListeners(maxListeners);
    return new MetaMask(provider);
  }

  static async getWeb3() {
    if (window.ethereum) {
      // Modern dapp browsers
      window.web3 = new window.Web3(window.ethereum);
      await window.ethereum.enable();
      return window.web3;
    } else if (window.web3) {
      // Legacy dapp browsers...
      window.web3 = new window.Web3(window.web3.currentProvider);
      return window.web3;
    } else {
      throw new Error("Web3 not initialized");
    }
  }

  constructor(provider) {
    if (!provider) {
      throw new Error("Missing provider");
    }
    this.web3 = new Web3(provider);
  }

  async getWeb3() {
    return this.web3;
  }

  async getAccounts() {
    return new Promise((resolve, reject) => {
      this.web3.eth.getAccounts((err, accounts) => {
        if (err !== null) {
          reject(err);
        } else if (accounts.length === 0) {
          reject(new Error("MetaMask is locked"));
        } else {
          resolve(accounts);
        }
      });
    });
  }
}
