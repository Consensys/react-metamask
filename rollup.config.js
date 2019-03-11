import babel from "rollup-plugin-babel";

const pkg = require("./package.json");

export default {
  input: "src/index.js",
  output: [
    {
      file: pkg["main"],
      format: "cjs",
      sourcemap: true,
    },
    {
      file: pkg["module"],
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    babel({
      exclude: "node_modules/**",
      // runtimeHelpers: true,
      // externalHelpers: true,
    }),
  ],
  external: id => {
    const externals = [
      "react",
      "react-dom",
      "react-native",
      "prop-types",
      "web3",
    ];
    return externals.includes(id);
  },
};
