import React, { Component } from "react"; // eslint-disable-line import/no-unresolved
import PropTypes from "prop-types";

import MetaMaskClass from "./MetaMask";

export function createMetaMaskContext(initial = null) {
  const Context = React.createContext(initial);
  Context.displayName = "MetaMaskContext";

  const ContextProvider = Context.Provider;

  class MetaMaskContextProvider extends Component {
    static propTypes = {
      // TODO: instance of web3?
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
      delay: 3000,
      immediate: false,
      options: undefined,
    };

    state = {
      web3: null,
      accounts: [],
      error: null,
      ...this.props.value,
    };

    timeout = null;

    componentDidMount() {
      if (this.props.immediate) {
        this.handleWatch();
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
        const metamask = await MetaMaskClass.initialize(this.props.options);
        web3 = await metamask.getWeb3();
        accounts = await metamask.getAccounts();
      } catch (err) {
        error = err;
      }
      this.setState({ web3, accounts, error, awaiting: false });
      this.timeout = setTimeout(this.handleWatch, this.props.delay);
    };

    render() {
      const { value, ...props } = this.props;

      const internalValue = {
        web3: this.state.web3,
        accounts: this.state.accounts,
        awaiting: this.state.awaiting,
        error: this.state.error,
        openMetaMask: this.handleWatch,
        // override with user's initial value. TODO: improve performance
        ...value,
      };

      return <ContextProvider {...props} value={internalValue} />;
    }
  }

  Context.Provider = MetaMaskContextProvider;
  return Context;
}

export const MetaMask = MetaMaskClass;
