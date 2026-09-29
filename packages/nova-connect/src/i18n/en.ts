import { NovaConnectLabels } from './types';

/**
 * Default English translations for NovaConnect component
 * All text strings extracted from component files
 */
export const defaultLabels: NovaConnectLabels = {
  // Core actions - Primary user interactions
  connectWallet: 'Connect Wallet',
  disconnect: 'Disconnect',
  disconnectAll: 'Disconnect all',
  connecting: 'Connecting...',
  connected: 'Connected',
  tryAgain: 'Try again',
  back: 'Back',
  connect: 'Connect',
  all: 'All',
  active: 'Active',
  connectors: 'Connectors',
  connectNewWallet: 'Connect new wallet',

  // Connection states - Status messages for wallet connection flow
  connectionError: 'Connection error',
  connectedSuccessfully: 'Connected successfully!',
  connectingTo: 'Connecting to',
  errorWhenChainSwitching: 'Error when chain switching',
  cannotConnectWallet: 'Cannot connect to the wallet. Please try again or use another connector.',

  // Transaction states - Status indicators for blockchain transactions
  success: 'Success',
  error: 'Error',
  replaced: 'Replaced',
  recent: 'Recent',
  transactionLoading: 'Transaction loading',
  transactionSuccess: 'Transaction successful',
  transactionError: 'Transaction failed',
  transactionReplaced: 'Transaction replaced',

  // Modal titles - Headers for different modal dialogs
  aboutWallets: 'About wallets',
  getWallet: 'Get a wallet',
  connectImpersonatedWallet: 'Connect impersonated wallet',
  transactionsInApp: 'Transactions in app',
  switchNetwork: 'Switch network',
  switchNetworks: 'Switch Networks',
  connectingEllipsis: 'Connecting...',
  connectedWallets: 'Connected Wallets',

  // Wallet sections - Categories for wallet connector grouping
  installed: 'Installed',
  popular: 'Popular',
  impersonate: 'Impersonate',
  readOnlyMode: 'Read-only mode',

  // Information and descriptions - Educational content and explanations
  whatIsWallet: 'What is a wallet?',
  walletDescription:
    'Wallets are essential for managing your crypto—they let you send, receive, and securely hold digital assets. Connecting your wallet grants you safe access and interaction with decentralized applications (dApps).',
  whatIsNetwork: 'What is a network?',
  networkDescription:
    'A network (or blockchain) is a decentralized digital ledger that records transactions. Selecting a network lets you choose which blockchain you want to connect to.',
  learnMore: 'Learn more',
  listOfNetworks: 'List of networks',
  viewOnExplorer: 'View on explorer',
  viewTransactions: 'View transactions',

  // Impersonation form - Labels for wallet address impersonation feature
  enterWalletAddressOrAddressName: 'Enter wallet address or address name to impersonate',
  walletAddressPlaceholder: '0x...',

  // Error messages - User-facing error notifications and descriptions
  noConnectorsFound: 'No Connectors Found',
  noConnectorsDescription: "We couldn't find any wallets or connection methods for the selected network.",
  somethingWentWrong: 'Something went wrong',
  networkPickingError: 'Something went wrong with wallet network selection. Please go back and try again.',
  pulsarAdapterRequired: 'Pulsar Adapter Required',
  pulsarAdapterDescription:
    'Additional configuration is needed for viewing transactions in app. Please contact your admin.',
  selectAvailableNetwork: 'Select one of available network',

  // Get Wallet section - Onboarding content for new users without wallets
  startExploringWeb3: 'Start Exploring Web3',
  walletKeyToDigitalWorld:
    'Your wallet is the key to the digital world and the technology that makes exploring web3 possible.',
  iDontHaveWallet: "I don't have a wallet",
  choseWallet: 'Choose a wallet',

  // About Wallets slides - Educational carousel content explaining wallet benefits
  keyToNewInternet: 'The Key to a New Internet',
  keyToNewInternetDescription:
    'Your wallet is more than just storage. Think of it as your digital passport that lets you truly own, display, and exchange every digital asset you hold, from crypto tokens to unique NFTs.',
  logInWithoutHassle: 'Log In Without the Hassle',
  logInWithoutHassleDescription:
    'Skip the endless sign-up forms! Your wallet is your unique access pass. Just connect it, and the website instantly recognizes you. It saves you time and protects your privacy.',

  // Copy functionality and UI feedback - Clipboard operations and user feedback
  copyRawError: 'Copy raw error',
  copied: 'Copied!',

  // Accessibility labels - Screen reader and ARIA labels for better accessibility
  chainSelector: 'Chain Selector',
  closeModal: 'Close modal',
  selectChain: 'Select chain',
  chainOption: 'Chain option',
  openChainSelector: 'Open chain selector',
  currentChain: 'Current chain',
  scrollToTop: 'Scroll to top',
  scrollToBottom: 'Scroll to bottom',
  chainListContainer: 'Chain list container',
  walletControls: 'Wallet controls',
  openWalletModal: 'Open wallet modal',
  walletConnected: 'Wallet connected',
  walletNotConnected: 'Wallet not connected',
  walletBalance: 'Wallet balance',
  walletAddress: 'Wallet address',
  transactionStatus: 'Transaction status',
  successIcon: 'Success icon',
  errorIcon: 'Error icon',
  replacedIcon: 'Replaced icon',
  statusIcon: 'Status icon',

  // Additional states - Supplementary status indicators
  loading: 'Loading',

  // Wallet Avatar labels
  unknownWallet: 'Unknown wallet',
  walletAvatar: 'Wallet avatar',
  ensAvatar: 'ENS avatar',
  walletIcon: 'Wallet icon',

  // Impersonate errors
  impersonateAddressEmpty: 'Enter a wallet address or name to impersonate.',
  impersonateAddressNotCorrect: 'Entered wallet address or name is not correct. Please try again.',
  impersonateAddressConnected: 'First disconnect the wallet to impersonate another address.',

  // Legal section labels
  legalIntro: 'By connecting your wallet, you agree to our',
  legalTerms: 'Terms of Service',
  legalPrivacy: 'Privacy Policy',
  legalAnd: 'and',

  // Screen reader texts and states (placeholders in braces are replaced by the components)
  carousel: 'carousel',
  carouselNavigation: 'Slide navigation',
  goToSlide: 'Go to slide {index}: {title}',
  slideOfTotal: 'Slide {index} of {total}',
  autoPlaying: 'Auto-playing',
  paused: 'Paused',
  carouselInstructions:
    'Use the arrow keys to change slides, Space or Enter to pause or resume auto-play, Home and End to go to the first and the last slide. Swipe left or right on touch devices.',
  networkIcon: 'Network {name}',
  backToPreviousStep: 'Back to previous step',
  opensWalletSelectionPage: 'Opens external wallet selection page',
  opensDocumentation: 'Opens external documentation',
  connectsImpersonatedWallet: 'Connects with impersonated wallet address',
  retriesConnection: 'Retries wallet connection',
  connectionStatus: 'Connection status: {status}',
  disclaimerLabel: '{title} disclaimer',
  disclaimerAdditionalInformation: 'Additional disclaimer information',
  disclaimerActions: 'Disclaimer actions',
  actionAbout: '{action} about {topic}',
  viewAction: 'View {action}',
  disclaimerSummary: 'Disclaimer about {topic}.',
  actionAvailable: '{action} action available.',
  walletIconsAnimation: 'Wallet icons animation',
  popularWalletIcons: 'Popular wallet icons',
  walletAddressOrEnsPlaceholder: '{address} or ENS name (.eth)',
  walletAddressOrSnsPlaceholder: '{address} or SNS name (.sol)',
  availableNetworks: 'Available networks',
  networkNameIcon: '{name} network icon',
  networkSelectionTabs: 'Network selection tabs',
  networkTab: '{name} network',
  currentlySelected: 'currently selected',
  unknown: 'Unknown',
  walletIconsDescription:
    'Popular wallets including {wallets} are displayed with floating animations to illustrate wallet variety.',
  getWalletSummary:
    'Introduction to Web3 wallets. This section explains the importance of wallets for digital asset management and Web3 exploration. Various popular wallet options are visually represented above.',
  additionalNetworks: '{count} additional networks',
  noConnectorsAvailable: 'No connectors available',
  connectingDetails: 'Wallet: {wallet}, Network: {network}, Status: {status}',
  connectorsSection: '{title} wallet connectors section',
  connectorsList: '{title} wallet connectors',
  noGroupConnectors: 'No {title} connectors available',
  noGroupWallets: 'No {title} wallets available',
  availableWalletConnectors: 'Available wallet connectors',
  opensInNewTab: '(opens in new tab)',
  resolvingName: 'Resolving {service} name...',
  resolvedTo: 'Resolved to: {address}',
  legalInformation: 'Legal information',
  disconnectAllDescription: 'Disconnect all wallets and close the modal',
  explorerLinkDescription: 'Opens in a new tab: the wallet address {address} on the blockchain explorer',
  explorerNotAvailable: 'Blockchain explorer is not available for this network',
  connectWalletsAvailable: 'Connect Wallet - {count} wallets available',
  switchNetworkNetworksAvailable: 'Switch network - {count} networks available',
  transactionsInAppCount: 'Transactions in app - {count} transactions',
  transactionsAvailable: '{count} transactions available',
  noTransactionsForWallet: 'No transactions found for this wallet',
  walletName: 'Wallet name: {name}',
  loadingWalletName: 'Loading wallet name',
  copyWalletAddress: 'Copy wallet address',
  refreshBalance: 'Refresh balance',
  noBalanceAvailable: 'No balance information available',
  balanceUpdated: 'Balance updated: {balance}',
  transactionHistoryNotAvailable: 'Transaction history is not available',
  transactionHistoryLoadError: 'The transaction history could not be loaded. Please try again later.',
  transactionsInAppFor: 'Transactions in app for {address}',
  networkWithId: 'Network: {chainId}',
  walletWithName: '{name} wallet',
  networkSelector: 'network selector',
  buttonRole: 'button',
  loadingState: 'loading',
  disabledState: 'disabled',
  buttonDisabled: 'Button is disabled',
  selectWalletOptions: 'Click to select {name} options',
  selectOptions: 'Click to select options',
  walletInformation: 'Wallet information',
  noConnectionsFound: 'No connections found',
  walletConnectionsManager: 'Wallet connections manager',
  switchedToWallet: 'Switched to {name} wallet',
  disconnectedWallet: 'Disconnected {name} wallet',
  connectedWallet: 'Connected {name} wallet',
  copyAddress: 'Copy address',
  copy: 'Copy',
  explorer: 'Explorer',
  removeFromRecent: 'Remove {name} from recent wallets',
};
