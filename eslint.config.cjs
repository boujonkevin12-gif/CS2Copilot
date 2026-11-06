const next = require("eslint-config-next");

module.exports = [
  ...next,
  { ignores: ["casefile vfinal/**", ".next/**", "node_modules/**"] },
];
