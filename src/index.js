import React, { Component } from "react"; // eslint-disable-line import/no-unresolved
import PropTypes from "prop-types";
import isEqual from "lodash/isEqual";
import sortBy from "lodash/sortBy";

import MetaMaskClass from "./MetaMask";
import * as constants from "./constants";

function isEqualArray(array1, array2) {
  return isEqual(sortBy(array1), sortBy(array2));
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export async function withTimeoutRejection(promise, timeout) {
  const sleep = new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error(constants.TIMEOUT)), timeout),
  );
  return Promise.race([promise, sleep]);
}

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
      /**
       * Refresh interval for MetaMask changes.
       */
      delay: PropTypes.number,
      /**
       * Prevent memory leaks by making the PopUp timeout after some time.
       * This doesn't close the popup.
       */
      timeout: PropTypes.number,
      /**
       * Start MetaMask when loading the page.
       */
      immediate: PropTypes.bool,
      /**
       * MetaMask class initialize options
       */
      options: PropTypes.object,
    };

    static defaultProps = {
      value: null,
      delay: 3000, // retry/update every 3 seconds by default
      timeout: 20000, // wait for user to activate MetaMask.
      immediate: false,
      options: undefined,
    };

    constructor(props) {
      super(props);

      this.watcher = null; // timer created with `setTimeout`
      this.metamask = null;
      this.state = {
        web3: null,
        accounts: [],
        awaiting: false,
        error: null,
        ...props.value,
      };
    }

    componentDidMount() {
      this.setState({
        error: MetaMaskClass.hasWeb3()
          ? null
          : new Error(constants.NOT_INSTALLED),
      });

      if (this.props.immediate) {
        this.handleWatch();
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      if (this.state.awaiting !== nextState.awaiting) {
        return true;
      } else if (this.state.web3 !== nextState.web3) {
        return true;
      } else if (this.state.error !== nextState.error) {
        return true;
      } else if (!isEqualArray(this.state.accounts, nextState.accounts)) {
        return true;
      } else {
        return false;
      }
    }

    componentWillUnmount() {
      if (this.watcher) {
        clearTimeout(this.watcher);
      }
    }

    handleWatch = async () => {
      if (this.watcher) {
        clearTimeout(this.watcher);
      }

      if (!this.state.web3 || !this.state.accounts.length) {
        this.setState({ awaiting: true });
      }

      let error = this.state.error;
      let web3 = null;
      let accounts = [];

      try {
        const isLocked = error && error.message === constants.LOCKED;
        if (!this.metamask || isLocked) {
          this.metamask = await withTimeoutRejection(
            MetaMaskClass.initialize(this.props.options),
            this.props.timeout,
          );
        }
        web3 = await this.metamask.getWeb3();
        accounts = await this.metamask.getAccounts();
        error = null;
      } catch (err) {
        error = err;
      }

      if (!error) {
        this.watcher = setTimeout(this.handleWatch, this.props.delay);
      }

      const nextState = { web3, accounts, error, awaiting: false };
      this.setState(nextState);
      return nextState;
    };

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps(nextProps) {
      if (!isEqual(this.props.options, nextProps.options)) {
        this.metamask = null;
      }

      if (nextProps.immediate) {
        this.handleWatch();
      } else if (this.watcher) {
        // nextProps.immediate is false so stop timeout (if present).
        clearTimeout(this.watcher);
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

export function withMetaMask(MetaMaskContext) {
  return function withMetaMaskContext(Comp) {
    const ComponentWithMetaMask = React.forwardRef((props, ref) => (
      <MetaMaskContext.Consumer>
        {metamask => <Comp ref={ref} metamask={metamask} {...props} />}
      </MetaMaskContext.Consumer>
    ));

    ComponentWithMetaMask.displayName = `withMetaMask(${getDisplayName(Comp)})`;

    return ComponentWithMetaMask;
  };
}

export const PropTypesMetaMask = {
  web3: PropTypes.object,
  accounts: PropTypes.arrayOf(PropTypes.string).isRequired,
  error: PropTypes.object, // `Error` type
  awaiting: PropTypes.bool.isRequired,
  openMetaMask: PropTypes.func.isRequired,
};

export const PropTypesMetaMaskObject = PropTypes.shape(PropTypesMetaMask);

export const MetaMask = MetaMaskClass;
export const CONSTANTS = constants;
