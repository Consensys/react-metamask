import React from "react";

import MetaMaskContext from "./metamask";
import MetaMaskButton from "./MetaMaskButton";

export default function App() {
  return (
    <div>
      <h3>Hello d-app user</h3>
      <MetaMaskContext.Provider immediate value={null}>
        <MetaMaskButton />
      </MetaMaskContext.Provider>
    </div>
  );
}
