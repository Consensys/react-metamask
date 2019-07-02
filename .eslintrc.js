module.exports = {
  extends: [
    "@daisypayments/eslint-config/react",
    "@daisypayments/eslint-config/jest",
  ],
  rules: {
    "jsx-a11y/label-has-associated-control": "off",
    "react/forbid-prop-types": "off",
    "react/no-multi-comp": "off",
  },
};
