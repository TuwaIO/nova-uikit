# Packages

Nova UI Kit ships one core package (**L6**) and two **L7** packages built on it: `@tuwaio/nova-connect` renders the wallet connection state of Satellite Connect and `@tuwaio/nova-transactions` the transactions of a Pulsar store. All packages declare React and their UI libraries as peer dependencies, so your app keeps a single copy of `react`, `framer-motion` or `react-toastify`, and each package ships its compiled stylesheet in `dist/index.css`.

Each package page starts with the package README (the same text that is published to npm), followed by the full list of its exports. Every component, hook, function, type and constant page is generated from the TypeScript source and its JSDoc, so the reference always matches the released code. `@tuwaio/nova-connect` has seven entry points and `@tuwaio/nova-transactions` two, documented as separate modules. Live components with their customization options are in the other sections of this Storybook.
