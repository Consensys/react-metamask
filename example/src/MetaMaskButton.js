import React, { useContext } from "react";

import MetaMaskContext from "./metamask";

export default function MetaMaskButton() {
  const { web3, accounts, error, awaiting, openMetaMask } = useContext(
    MetaMaskContext,
  );

  function handleButtonClick() {
    alert(`Web3 (${web3.version}) is enabled`); // eslint-disable-line no-alert
  }

  if (error && error.notInstalled) {
    return (
      <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">
        Install MetaMask
      </a>
    );
  } else if (error) {
    return (
      <button type="button" onClick={openMetaMask}>
        {error.message}
      </button>
    );
  } else if (!web3 && awaiting) {
    return (
      <button type="button" onClick={openMetaMask}>
        MetaMask loading...
      </button>
    );
  } else if (!web3) {
    return (
      <button type="button" onClick={openMetaMask}>
        Please open and allow MetaMask
      </button>
    );
  } else if (accounts.length === 0) {
    return <button type="button">No Wallet 🦊</button>;
  } else {
    return (
      <button type="button" onClick={handleButtonClick}>
        <code>{accounts[0].slice(0, 16)}</code> 🦊
      </button>
    );
  }
}
