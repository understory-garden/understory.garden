module.exports = {
  "env": {
    "browser": true,
    "es2020": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    //    "plugin:import/errors", // this doesn't like jsx for some reason TV 7/15
    "plugin:import/warnings",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
  ],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 11,
    "sourceType": "module"
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "react/prop-types": "off", // for now, probably enable later? TV 7/13
    "react/react-in-jsx-scope": "off"
  },
  "globals": {
    "React": "writable"
  }
};
