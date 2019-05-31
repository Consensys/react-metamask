# @tokenfoundry/react-metamask

> MetaMask context for React, **compatible with hooks!**

## Install

This module requires `web3` as an external dependency. For compatibility reasons please use the fixed version stated in this project.

```sh
yarn add @tokenfoundry/react-metamask web3@=1.0.0-beta.37
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
// App.js (_app.js if using Next.js)
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

Finally use the context wherever you need (example using React Hooks):

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

  if (error && error.message === "MetaMask not installed") {
    return (
      <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">
        Install MetaMask
      </a>
    );
  } else if (error && error.message === "User denied account authorization") {
    return (
      <button type="button" onClick={openMetaMask}>
        Please allow MetaMask to connect.
      </button>
    );
  } else if (error && error.message === "MetaMask is locked") {
    return (
      <button type="button" onClick={openMetaMask}>
        Please allow MetaMask to connect.
      </button>
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
    // `web3` and `account` loaded 🎉
    return (
      <button type="button" onClick={handleButtonClick}>
        <code>{accounts[0]}</code> 🦊 (v: {web3.version.api})
      </button>
    );
  }
}
```

### HOC for React classes

In case you are not using React Hooks and you need access to `web3` and the other params, you can use a High-Order-Component like this:

```js
// metamask.js
import React from "react";
import PropTypes from "prop-types";
import { createMetaMaskContext } from "@tokenfoundry/react-metamask";

const MetaMaskContext = createMetaMaskContext();

export default MetaMaskContext;
```

```js
// MetaMaskButton.js
import React, { Component } from "react";
import { withMetaMask, PropTypesMetaMaskObject } from "@tokenfoundry/react-metamask";

import MetaMaskContext from "./metamask";

class MetaMaskButton extends Component {
  static propTypes = {
    metamask: PropTypesMetaMaskObject.isRequired,
  };

  componentDidMount() {
    const { web3, accounts } = this.props.metamask;
    if (web3) {
      // ...
    }
  }

  render() {
    const { web3, accounts, error, awaiting, openMetaMask } = this.props.metamask;
    // ...
  }
}

export default withMetaMask(MetaMaskContext)(MetaMaskButton);
```

## License

MIT
