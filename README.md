# @tokenfoundry/react-metamask

> MetaMask context for React, **compatible with hooks!**

## Install

This module requires `web3` as an external dependency. For compatibility reasons please use the fixed version stated in this project.

```sh
yarn install @tokenfoundry/react-metamask web3@=1.0.0-beta.37
```

## Usage

### Immediate or not

When rendering the `Provider` you can set `immediate` to `true` (_default_) or `false`.

- `immediate={true}`: Forces MetaMask at the start (opens user prompt).
- `immediate={false}`: Requires user to call the action openMetaMask from the context's consumer to be able to load `web3` instances and their accounts.

### Example

Create a file with the instantiation of MetaMask's Context:

```js
// metamask.js
import { createMetaMaskContext } from "@tokenfoundry/react-metamask";

const MetaMaskContext = createMetaMaskContext();
export default MetaMaskContext;
```

Then make sure to render the `Provider` on the top entry file of your app:

```js
// App.js
import React from "react";

import MetaMaskContext from "./metamask";

export default function App() {
  return (
    <div>
      <MetaMaskContext.Provider immediate>
        ...
      </MetaMaskContext.Provider>
    </div>
  )
}
```

Finally use the context wherever you need:

```js
// MetaMaskButton.js
import React, { useContext } from "react";

import MetaMaskContext from "./metamask";

export default function MetaMaskButton() {
  const { web3, accounts, error, awaiting, openMetaMask } = useContext(
    MetaMaskContext,
  );

  function handleButtonClick() {
    alert(`Web3 (${web3.version}) is enabled`);
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
        UNHANDLED ERROR: {error.message}
      </button>
    );
  } else if (!web3 && awaiting) {
    return (
      <button type="button" onClick={openMetaMask}>
        MetaMask is loading...
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
```

## License

MIT
