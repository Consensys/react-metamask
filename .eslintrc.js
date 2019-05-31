module.exports = {
  extends: [
    "@tokenfoundry/eslint-config/react",
    "@tokenfoundry/eslint-config/jest",
  ],
  rules: {
    "jsx-a11y/label-has-associated-control": "off",
    "react/forbid-prop-types": "off",
    "react/no-multi-comp": "off",
  },
};
