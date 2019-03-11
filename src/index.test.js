import { createMetaMaskContext } from ".";

describe("ExampleComponent", () => {
  it("is truthy", () => {
    const Context = createMetaMaskContext();
    expect(Context).toBeTruthy();
  });
});
