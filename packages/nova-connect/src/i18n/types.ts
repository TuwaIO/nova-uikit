/**
 * All texts of the Nova Connect components. Pass a partial object as `labels` of `NovaConnectProvider` to override
 * some of them; the defaults are the English `defaultLabels`.
 */
export type NovaConnectLabels = {
  // Core actions - Primary user interactions
  /** Connect button and title of the connect modal (default: `Connect Wallet`) */
  connectWallet: string;
  /** Disconnect buttons of the connected modal (default: `Disconnect`) */
  disconnect: string;
  /** Button that disconnects all wallets (default: `Disconnect all`) */
  disconnectAll: string;
  /** Spinner label while a wallet connects (default: `Connecting...`) */
  connecting: string;
  /** Title of the connected modal and mark of the active chain in the chain list (default: `Connected`) */
  connected: string;
  /** Retry button after a connection error (default: `Try again`) */
  tryAgain: string;
  /** Back button of the modals (default: `Back`) */
  back: string;
  /** Connect buttons (default: `Connect`) */
  connect: string;
  /** Network tab that shows the wallets of all networks (default: `All`) */
  all: string;
  /** Badge of the active wallet and title of the connected wallets section (default: `Active`) */
  active: string;
  /** Title of the connected wallets section (after `active`) (default: `Connectors`) */
  connectors: string;
  /** Button of the connections screen that opens the connect modal (default: `Connect new wallet`) */
  connectNewWallet: string;

  // Connection states - Status messages for wallet connection flow
  /** Title of the connection error (screen and toast) (default: `Connection error`) */
  connectionError: string;
  /** Heading after the wallet connects (default: `Connected successfully!`) */
  connectedSuccessfully: string;
  /** Heading while connecting, followed by the wallet name (default: `Connecting to`) */
  connectingTo: string;
  /** Title of the network switch error toast (default: `Error when chain switching`) */
  errorWhenChainSwitching: string;
  /** Text under the connection error heading */
  cannotConnectWallet: string;

  // Transaction states - Status indicators for blockchain transactions
  /** Transaction status in the connect button (default: `Success`) */
  success: string;
  /** Transaction status in the connect button (default: `Error`) */
  error: string;
  /** Transaction status in the connect button (default: `Replaced`) */
  replaced: string;
  /** Badge of the last used wallet and title of the recent wallets section (default: `Recent`) */
  recent: string;
  /** Status of a pending transaction in the connect button and the connected modal (default: `Transaction loading`) */
  transactionLoading: string;
  /** Status of a successful transaction in the connect button (default: `Transaction successful`) */
  transactionSuccess: string;
  /** Status of a failed transaction in the connect button (default: `Transaction failed`) */
  transactionError: string;
  /** Status of a replaced transaction in the connect button (default: `Transaction replaced`) */
  transactionReplaced: string;

  // Modal titles - Headers for different modal dialogs
  /** Title of the "About wallets" screen and label of its info button (default: `About wallets`) */
  aboutWallets: string;
  /** Title of the "Get a wallet" screen (default: `Get a wallet`) */
  getWallet: string;
  /** Title of the impersonation form (default: `Connect impersonated wallet`) */
  connectImpersonatedWallet: string;
  /** Title of the transaction history screen (default: `Transactions in app`) */
  transactionsInApp: string;
  /** Title of the network switch screen of the connected modal (default: `Switch network`) */
  switchNetwork: string;
  /** Title of the mobile chain dialog (default: `Switch Networks`) */
  switchNetworks: string;
  /** Title of the connection screen before the wallet is known (default: `Connecting...`) */
  connectingEllipsis: string;
  /** Title of the connections screen (default: `Connected Wallets`) */
  connectedWallets: string;

  // Wallet sections - Categories for wallet connector grouping
  /** Group of installed wallets (default: `Installed`) */
  installed: string;
  /** Group of popular wallets and the icons of the "Get a wallet" screen (default: `Popular`) */
  popular: string;
  /** Group of the impersonated wallet (default: `Impersonate`) */
  impersonate: string;
  /** Subtitle of the impersonated wallet card (default: `Read-only mode`) */
  readOnlyMode: string;

  // Information and descriptions - Educational content and explanations
  /** Title of the wallet disclaimer (default: `What is a wallet?`) */
  whatIsWallet: string;
  /** Text of the wallet disclaimer */
  walletDescription: string;
  /** Title of the network disclaimer (default: `What is a network?`) */
  whatIsNetwork: string;
  /** Text of the network disclaimer */
  networkDescription: string;
  /** "Learn more" links and buttons (default: `Learn more`) */
  learnMore: string;
  /** Links to network lists and label of the network icons of a card (default: `List of networks`) */
  listOfNetworks: string;
  /** Explorer button of the connected modal (default: `View on explorer`) */
  viewOnExplorer: string;
  /** Button that opens the transaction history (default: `View transactions`) */
  viewTransactions: string;

  // Impersonation form - Labels for wallet address impersonation feature
  /** Label of the impersonation address field */
  enterWalletAddressOrAddressName: string;
  /** Placeholder of the impersonation address field (default: `0x...`) */
  walletAddressPlaceholder: string;

  // Error messages - User-facing error notifications and descriptions
  /** Title shown when a network has no wallets, and the empty chain list (default: `No Connectors Found`) */
  noConnectorsFound: string;
  /** Text shown when a network has no wallets */
  noConnectorsDescription: string;
  /** Title of errors without a specific title (default: `Something went wrong`) */
  somethingWentWrong: string;
  /** Error of the network choice when the wallet is not found */
  networkPickingError: string;
  /** Title shown in the transaction history without a Pulsar adapter (default: `Pulsar Adapter Required`) */
  pulsarAdapterRequired: string;
  /** Text shown in the transaction history without a Pulsar adapter */
  pulsarAdapterDescription: string;
  /** Title of the network choice (default: `Select one of available network`) */
  selectAvailableNetwork: string;

  // Get Wallet section - Onboarding content for new users without wallets
  /** Title of the "Get a wallet" screen content (default: `Start Exploring Web3`) */
  startExploringWeb3: string;
  /** Text of the "Get a wallet" screen */
  walletKeyToDigitalWorld: string;
  /** Button of the connectors screen that opens "Get a wallet" (default: `I don't have a wallet`) */
  iDontHaveWallet: string;
  /** Button of "Get a wallet" that opens a wallet list (default: `Choose a wallet`) */
  choseWallet: string;

  // About Wallets slides - Educational carousel content explaining wallet benefits
  /** Title of the first "About wallets" slide (default: `The Key to a New Internet`) */
  keyToNewInternet: string;
  /** Text of the first "About wallets" slide */
  keyToNewInternetDescription: string;
  /** Title of the second "About wallets" slide (default: `Log In Without the Hassle`) */
  logInWithoutHassle: string;
  /** Text of the second "About wallets" slide */
  logInWithoutHassleDescription: string;

  // Copy functionality and UI feedback - Clipboard operations and user feedback
  /** Button that copies the raw error (default: `Copy raw error`) */
  copyRawError: string;
  /** Confirmation after copying (default: `Copied!`) */
  copied: string;

  // Accessibility labels - Screen reader and ARIA labels for better accessibility
  /** ARIA label of the chain selector (default: `Chain Selector`) */
  chainSelector: string;
  /** ARIA label of the close buttons of the modals (default: `Close modal`) */
  closeModal: string;
  /** ARIA label of the chain list (default: `Select chain`) */
  selectChain: string;
  /** ARIA label of a chain option (default: `Chain option`) */
  chainOption: string;
  /** ARIA label part of the chain selector trigger (default: `Open chain selector`) */
  openChainSelector: string;
  /** ARIA label part for the current chain (default: `Current chain`) */
  currentChain: string;
  /** ARIA label of the "scroll to top" button (default: `Scroll to top`) */
  scrollToTop: string;
  /** ARIA label of the "scroll to bottom" button (default: `Scroll to bottom`) */
  scrollToBottom: string;
  /** ARIA label of the chain list container (default: `Chain list container`) */
  chainListContainer: string;
  /** ARIA label of the wallet controls (default: `Wallet controls`) */
  walletControls: string;
  /** ARIA label of the connect button while connected (default: `Open wallet modal`) */
  openWalletModal: string;
  /** ARIA text of the connected state (default: `Wallet connected`) */
  walletConnected: string;
  /** ARIA text of the disconnected state (default: `Wallet not connected`) */
  walletNotConnected: string;
  /** ARIA label of the balance (default: `Wallet balance`) */
  walletBalance: string;
  /** ARIA label of the address (default: `Wallet address`) */
  walletAddress: string;
  /** ARIA label of the transaction status in the connect button (default: `Transaction status`) */
  transactionStatus: string;
  /** ARIA label of the success icon (default: `Success icon`) */
  successIcon: string;
  /** ARIA label of the error icon (default: `Error icon`) */
  errorIcon: string;
  /** ARIA label of the replaced icon (default: `Replaced icon`) */
  replacedIcon: string;
  /** ARIA label of the status icon (default: `Status icon`) */
  statusIcon: string;

  // Additional states - Supplementary status indicators
  /** ARIA label and text of loading states (default: `Loading`) */
  loading: string;

  // Wallet Avatar labels
  /** Name of a wallet without a known name (default: `Unknown wallet`) */
  unknownWallet: string;
  /** Alt text of the wallet avatar (default: `Wallet avatar`) */
  walletAvatar: string;
  /** Alt text of the ENS avatar (default: `ENS avatar`) */
  ensAvatar: string;
  /** Alt text of wallet icons (after the wallet name) (default: `Wallet icon`) */
  walletIcon: string;

  // Impersonate errors
  /** Error of the impersonation form without an address */
  impersonateAddressEmpty: string;
  /** Error of the impersonation form with an invalid address */
  impersonateAddressNotCorrect: string;
  /** Error of the impersonation form while a wallet is connected */
  impersonateAddressConnected: string;

  // Legal section labels
  /** Start of the legal disclaimer */
  legalIntro: string;
  /** Link text of the terms of service (default: `Terms of Service`) */
  legalTerms: string;
  /** Link text of the privacy policy (default: `Privacy Policy`) */
  legalPrivacy: string;
  /** Word between the two legal links (default: `and`) */
  legalAnd: string;

  // Screen reader texts and states. Placeholders in braces, such as `{name}`, are replaced by the components.
  /** Aria-roledescription of the About wallets carousel (default: `carousel`) */
  carousel: string;
  /** ARIA label of the slide indicators of the About wallets carousel (default: `Slide navigation`) */
  carouselNavigation: string;
  /** ARIA label of a slide indicator (default: `Go to slide {index}: {title}`) */
  goToSlide: string;
  /** ARIA label of a slide; status announcement (followed by ": {title}") (default: `Slide {index} of {total}`) */
  slideOfTotal: string;
  /** Status announcement suffix while auto-play is on (default: `Auto-playing`) */
  autoPlaying: string;
  /** Status announcement suffix while auto-play is paused (default: `Paused`) */
  paused: string;
  /** Screen reader instructions of the carousel */
  carouselInstructions: string;
  /** ARIA label of a network icon of a connect card ({name}: chain ID or network) (default: `Network {name}`) */
  networkIcon: string;
  /** ARIA label of the back button of the connect modal (default: `Back to previous step`) */
  backToPreviousStep: string;
  /** Description of the action button on the Get a wallet screen (default: `Opens external wallet selection page`) */
  opensWalletSelectionPage: string;
  /** Description of the action button on the About wallets screen (default: `Opens external documentation`) */
  opensDocumentation: string;
  /**
   * Description of the action button on the impersonate screen (default: `Connects with impersonated wallet address`)
   */
  connectsImpersonatedWallet: string;
  /** Description of the action button on the connecting screen (default: `Retries wallet connection`) */
  retriesConnection: string;
  /** ARIA label of the connecting screen ({status}: the heading) (default: `Connection status: {status}`) */
  connectionStatus: string;
  /** ARIA label of a disclaimer of the connect modal (default: `{title} disclaimer`) */
  disclaimerLabel: string;
  /** ARIA label of the additional content of a disclaimer (default: `Additional disclaimer information`) */
  disclaimerAdditionalInformation: string;
  /** ARIA label of the actions of a disclaimer (default: `Disclaimer actions`) */
  disclaimerActions: string;
  /**
   * ARIA label of the "Learn more" button of a disclaimer ({topic}: the title in lower case) (default: `{action} about
   * {topic}`)
   */
  actionAbout: string;
  /**
   * ARIA label of the list button of a disclaimer ({action}: the button text in lower case) (default: `View {action}`)
   */
  viewAction: string;
  /** Screen reader summary of a disclaimer, followed by the description (default: `Disclaimer about {topic}.`) */
  disclaimerSummary: string;
  /** Screen reader summary of a disclaimer, for each button (default: `{action} action available.`) */
  actionAvailable: string;
  /** ARIA label of the animation section of the Get a wallet screen (default: `Wallet icons animation`) */
  walletIconsAnimation: string;
  /** ARIA label of the icons of the Get a wallet screen (default: `Popular wallet icons`) */
  popularWalletIcons: string;
  /**
   * Placeholder of the impersonate field for EVM ({address}: the walletAddressPlaceholder label) (default: `{address}
   * or ENS name (.eth)`)
   */
  walletAddressOrEnsPlaceholder: string;
  /** Placeholder of the impersonate field for Solana (default: `{address} or SNS name (.sol)`) */
  walletAddressOrSnsPlaceholder: string;
  /** ARIA label of the network list of the connect modal (default: `Available networks`) */
  availableNetworks: string;
  /** ARIA label of a network icon of the network list (default: `{name} network icon`) */
  networkNameIcon: string;
  /** ARIA label of the network tabs of the connect modal (default: `Network selection tabs`) */
  networkSelectionTabs: string;
  /** ARIA label of a network tab (and of its icon, followed by `iconSuffix` when set) (default: `{name} network`) */
  networkTab: string;
  /** Appended to the ARIA label of the selected network tab (after a comma) (default: `currently selected`) */
  currentlySelected: string;
  /** Name of a network tab without a known chain (default: `Unknown`) */
  unknown: string;
  /** Screen reader text of the Get a wallet animation ({wallets}: names of the icons) */
  walletIconsDescription: string;
  /** Screen reader summary of the Get a wallet screen */
  getWalletSummary: string;
  /**
   * ARIA label of the overflow count of the network icons of a connect card (default: `{count} additional networks`)
   */
  additionalNetworks: string;
  /** Empty state of the connect modal when the store has no connectors (default: `No connectors available`) */
  noConnectorsAvailable: string;
  /**
   * Screen reader details of the connecting screen (default: `Wallet: {wallet}, Network: {network}, Status: {status}`)
   */
  connectingDetails: string;
  /**
   * ARIA label of a wallet group of the connect modal ({title}: the group title) (default: `{title} wallet connectors
   * section`)
   */
  connectorsSection: string;
  /** ARIA label of the wallet list of a group (default: `{title} wallet connectors`) */
  connectorsList: string;
  /** ARIA label of the empty state of a group ({title} in lower case) (default: `No {title} connectors available`) */
  noGroupConnectors: string;
  /** Empty state of a group ({title} in lower case) (default: `No {title} wallets available`) */
  noGroupWallets: string;
  /** ARIA label of the wallet list of the connect modal (default: `Available wallet connectors`) */
  availableWalletConnectors: string;
  /** Screen reader text after an external link (default: `(opens in new tab)`) */
  opensInNewTab: string;
  /**
   * Status of the impersonate field while an ENS or SNS name resolves ({service}: ENS or SNS) (default: `Resolving
   * {service} name...`)
   */
  resolvingName: string;
  /** Status of the impersonate field after a name resolves (default: `Resolved to: {address}`) */
  resolvedTo: string;
  /** ARIA label of the legal disclaimer of the connect modal (default: `Legal information`) */
  legalInformation: string;
  /**
   * Screen reader description of the disconnect button of the connected modal (default: `Disconnect all wallets and
   * close the modal`)
   */
  disconnectAllDescription: string;
  /** Screen reader description of the explorer link */
  explorerLinkDescription: string;
  /**
   * Title and screen reader description of the disabled explorer button (default: `Blockchain explorer is not available
   * for this network`)
   */
  explorerNotAvailable: string;
  /** ARIA label of the wallet button of the connected modal (default: `Connect Wallet - {count} wallets available`) */
  connectWalletsAvailable: string;
  /**
   * ARIA label of the network button of the connected modal (default: `Switch network - {count} networks available`)
   */
  switchNetworkNetworksAvailable: string;
  /**
   * ARIA label of the transactions section of the connected modal (default: `Transactions in app - {count}
   * transactions`)
   */
  transactionsInAppCount: string;
  /** Screen reader text of the "View transactions" button (default: `{count} transactions available`) */
  transactionsAvailable: string;
  /**
   * Screen reader status without transactions of the active wallet (default: `No transactions found for this wallet`)
   */
  noTransactionsForWallet: string;
  /** ARIA label of the wallet name in the connected modal (default: `Wallet name: {name}`) */
  walletName: string;
  /** {name} of the walletName label while the name loads (default: `Loading wallet name`) */
  loadingWalletName: string;
  /** ARIA label of the copy button of the connected modal (followed by the address) (default: `Copy wallet address`) */
  copyWalletAddress: string;
  /** ARIA label of the balance refresh button (default: `Refresh balance`) */
  refreshBalance: string;
  /** Shown without a balance (default: `No balance information available`) */
  noBalanceAvailable: string;
  /** Screen reader announcement after the balance loads (default: `Balance updated: {balance}`) */
  balanceUpdated: string;
  /**
   * Title of the error state of the transaction history (the history failed to load) (default: `Transaction history is
   * not available`)
   */
  transactionHistoryNotAvailable: string;
  /** Description of that error state */
  transactionHistoryLoadError: string;
  /** ARIA label of the transaction history of the connected modal (default: `Transactions in app for {address}`) */
  transactionsInAppFor: string;
  /**
   * Title of the chain icon of the wallet and network buttons of the connected modal (default: `Network: {chainId}`)
   */
  networkWithId: string;
  /** Part of the default ARIA label and tooltip of those buttons (default: `{name} wallet`) */
  walletWithName: string;
  /** Part of the default ARIA label of those buttons (default: `network selector`) */
  networkSelector: string;
  /** Part of the default ARIA label of a clickable button (default: `button`) */
  buttonRole: string;
  /** Part of the default ARIA label while loading (default: `loading`) */
  loadingState: string;
  /** Part of the default ARIA label of a disabled button (default: `disabled`) */
  disabledState: string;
  /** Tooltip of a disabled button (default: `Button is disabled`) */
  buttonDisabled: string;
  /** Tooltip of a clickable button with a wallet name (default: `Click to select {name} options`) */
  selectWalletOptions: string;
  /** Tooltip of a clickable button without a wallet name (default: `Click to select options`) */
  selectOptions: string;
  /** Tooltip of a button without a wallet name (default: `Wallet information`) */
  walletInformation: string;
  /** Empty state of the connections screen (default: `No connections found`) */
  noConnectionsFound: string;
  /** ARIA label of the connections screen (default: `Wallet connections manager`) */
  walletConnectionsManager: string;
  /** Screen reader announcement after a switch (default: `Switched to {name} wallet`) */
  switchedToWallet: string;
  /** Screen reader announcement after a disconnect (default: `Disconnected {name} wallet`) */
  disconnectedWallet: string;
  /** Screen reader announcement after a recent wallet connects (default: `Connected {name} wallet`) */
  connectedWallet: string;
  /** Title of the copy button of the active wallet (default: `Copy address`) */
  copyAddress: string;
  /** Text of the copy button of the active wallet (default: `Copy`) */
  copy: string;
  /** Text of the explorer button of the active wallet (default: `Explorer`) */
  explorer: string;
  /** ARIA label of the remove button of a recent wallet (default: `Remove {name} from recent wallets`) */
  removeFromRecent: string;
};
