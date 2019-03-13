import React, { Component } from "react"; // eslint-disable-line import/no-unresolved
import PropTypes from "prop-types";
import isEqual from "lodash/isEqual";

import MetaMaskClass from "./MetaMask";

export function createMetaMaskContext(initial = null) {
  const Context = React.createContext(initial);
  Context.displayName = "MetaMaskContext";

  const ContextProvider = Context.Provider;

  class MetaMaskContextProvider extends Component {
    static propTypes = {
      /**
       * Initial value is an object shaped like { web3, accounts, error, awaiting }
       */
      value: PropTypes.any, // eslint-disable-line react/forbid-prop-types
      delay: PropTypes.number,
      immediate: PropTypes.bool,
      /**
       * MetaMask class initialize options
       */
      options: PropTypes.object,
    };

    static defaultProps = {
      value: null,
      delay: 3000, // retry/update every 3 seconds by default
      immediate: false,
      options: undefined,
    };

    state = {
      web3: null,
      accounts: [],
      awaiting: false,
      error: null,
      ...this.props.value,
    };

    timeout = null; // timer created with `setTimeout`

    metamask = null;

    componentDidMount() {
      if (this.props.immediate) {
        this.handleWatch();
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (this.state.accounts !== nextState.accounts) {
        return true;
      } else if (this.state.web3 !== nextState.web3) {
        return true;
      } else if (this.state.error !== nextState.error) {
        return true;
      } else if (this.state.awaiting !== nextState.awaiting) {
        return true;
      } else {
        return false;
      }
    }

    componentWillUnmount() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    }

    handleWatch = async () => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }

      this.setState({ awaiting: true });

      let error = null;
      let web3 = null;
      let accounts = [];

      try {
        if (!this.metamask) {
          this.metamask = await MetaMaskClass.initialize(this.props.options);
        }
        web3 = await this.metamask.getWeb3();
        accounts = await this.metamask.getAccounts();
      } catch (err) {
        error = err;
      }

      this.setState({ web3, accounts, error, awaiting: false });

      if (error && error.message === "User denied account authorization") {
        // Do not retry and wait the user to call `this.handleWatch` through `openMetaMask`.
      } else {
        this.timeout = setTimeout(this.handleWatch, this.props.delay);
      }
    };

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps(nextProps) {
      if (!isEqual(this.props.options, nextProps.options)) {
        this.metamask = null;
      }

      if (nextProps.immediate) {
        this.handleWatch();
      } else if (this.timeout) {
        // nextProps.immediate is false so stop timeout (if present).
        clearTimeout(this.timeout);
      }
    }

    render() {
      const { value, ...props } = this.props;

      const internalValue = {
        web3: this.state.web3,
        accounts: this.state.accounts,
        awaiting: this.state.awaiting,
        error: this.state.error,
        openMetaMask: this.handleWatch,
      };

      return <ContextProvider {...props} value={internalValue} />;
    }
  }

  Context.Provider = MetaMaskContextProvider;
  return Context;
}

export const MetaMask = MetaMaskClass;
