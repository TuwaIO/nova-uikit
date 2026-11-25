import { NovaConnectLabels } from './types';

/**
 * German (de) translations for Nova Connect components.
 * Contains localized text strings for wallet connections, modals, states, and accessibility.
 */
export const germanLabels: NovaConnectLabels = {
  // Core actions - Primary user interactions
  connectWallet: 'Wallet verbinden',
  disconnect: 'Trennen',
  disconnectAll: 'Alle trennen',
  connecting: 'Wird verbunden...',
  connected: 'Verbunden',
  tryAgain: 'Erneut versuchen',
  back: 'Zurück',
  connect: 'Verbinden',
  all: 'Alle',
  active: 'Aktiv',
  connectors: 'Aktive Wallets',
  connectNewWallet: 'Weiteres Wallet verbinden',

  // Connection states - Status messages for wallet connection flow
  connectionError: 'Verbindungsfehler',
  connectedSuccessfully: 'Erfolgreich verbunden!',
  connectingTo: 'Verbindung mit',
  errorWhenChainSwitching: 'Fehler beim Wechseln des Netzwerks',
  cannotConnectWallet:
    'Das Wallet lässt sich nicht verbinden. Versuchen Sie es erneut oder wählen Sie einen anderen Konnektor.',
  requestDeclined: 'Anfrage abgelehnt',
  requestDeclinedInWallet:
    'Sie haben die Anfrage in Ihrem Wallet abgelehnt. Versuchen Sie es erneut, wenn Sie bereit sind.',
  restoringWallet: 'Ihr Wallet wird wiederhergestellt…',

  // Transaction states - Status indicators for blockchain transactions
  success: 'Erfolgreich',
  error: 'Fehler',
  replaced: 'Ersetzt',
  cancelled: 'Abgebrochen',
  recent: 'Zuletzt verwendet',
  transactionLoading: 'Transaktion wird geladen',
  transactionSuccess: 'Transaktion erfolgreich',
  transactionError: 'Transaktion fehlgeschlagen',
  transactionReplaced: 'Transaktion ersetzt',
  transactionCancelled: 'Transaktion abgebrochen',

  // Modal titles - Headers for different modal dialogs
  aboutWallets: 'Über Wallets',
  getWallet: 'Wallet besorgen',
  connectImpersonatedWallet: 'Imitiertes Wallet verbinden',
  transactionsInApp: 'Transaktionen in der App',
  switchNetwork: 'Netzwerk wechseln',
  switchNetworks: 'Netzwerke wechseln',
  connectingEllipsis: 'Wird verbunden...',
  signMessageInWallet: 'Signieren Sie die Nachricht in Ihrem Wallet',
  checkWalletRequest: 'Sehen Sie in Ihrem Wallet nach: Die Anfrage wartet dort vielleicht.',
  connectedWallets: 'Verbundene Wallets',

  // Wallet sections - Categories for wallet connector grouping
  installed: 'Installiert',
  popular: 'Beliebt',
  impersonate: 'Imitieren',
  readOnlyMode: 'Nur-Lese-Modus',

  // Information and descriptions - Educational content and explanations
  whatIsWallet: 'Was ist ein Wallet?',
  walletDescription:
    'Mit einem Wallet verwalten Sie Ihre Kryptowerte: Sie senden, empfangen und verwahren digitale Vermögenswerte sicher. Wenn Sie Ihr Wallet verbinden, nutzen Sie dezentrale Anwendungen (dApps) sicher.',
  whatIsNetwork: 'Was ist ein Netzwerk?',
  networkDescription:
    'Ein Netzwerk (oder eine Blockchain) ist ein dezentrales digitales Register, das Transaktionen aufzeichnet. Mit der Wahl des Netzwerks legen Sie fest, mit welcher Blockchain Sie sich verbinden.',
  learnMore: 'Mehr erfahren',
  listOfNetworks: 'Liste der Netzwerke',
  viewOnExplorer: 'Im Explorer ansehen',
  viewTransactions: 'Transaktionen ansehen',

  // Impersonation form - Labels for wallet address impersonation feature
  enterWalletAddressOrAddressName: 'Geben Sie die Wallet-Adresse oder den Adressnamen zum Imitieren ein',
  walletAddressPlaceholder: '0x...',

  // Error messages - User-facing error notifications and descriptions
  noConnectorsFound: 'Keine Konnektoren gefunden',
  noConnectorsDescription: 'Für das gewählte Netzwerk wurden keine Wallets oder Verbindungsmethoden gefunden.',
  somethingWentWrong: 'Etwas ist schiefgelaufen',
  networkPickingError:
    'Bei der Wahl des Wallet-Netzwerks ist etwas schiefgelaufen. Gehen Sie zurück und versuchen Sie es erneut.',
  pulsarAdapterRequired: 'Pulsar-Adapter erforderlich',
  pulsarAdapterDescription:
    'Für die Anzeige der Transaktionen in der App ist eine zusätzliche Einrichtung nötig. Wenden Sie sich an Ihren Administrator.',
  selectAvailableNetwork: 'Wählen Sie eines der verfügbaren Netzwerke',

  // Get Wallet section - Onboarding content for new users without wallets
  startExploringWeb3: 'Web3 entdecken',
  walletKeyToDigitalWorld:
    'Ihr Wallet ist der Schlüssel zur digitalen Welt und zu der Technologie, mit der Sie Web3 erkunden.',
  iDontHaveWallet: 'Ich habe kein Wallet',
  choseWallet: 'Wallet wählen',

  // About Wallets slides - Educational carousel content explaining wallet benefits
  keyToNewInternet: 'Der Schlüssel zu einem neuen Internet',
  keyToNewInternetDescription:
    'Ihr Wallet ist mehr als ein Speicher. Es ist Ihr digitaler Pass: Mit ihm besitzen, zeigen und tauschen Sie jeden digitalen Vermögenswert, von Krypto-Token bis zu einzigartigen NFTs.',
  logInWithoutHassle: 'Anmelden ohne Aufwand',
  logInWithoutHassleDescription:
    'Keine endlosen Registrierungsformulare! Ihr Wallet ist Ihr persönlicher Zugang. Verbinden Sie es, und die Website erkennt Sie sofort. Das spart Zeit und schützt Ihre Privatsphäre.',

  // Copy functionality and UI feedback - Clipboard operations and user feedback
  copyRawError: 'Fehlertext kopieren',
  copied: 'Kopiert!',

  // Accessibility labels - Screen reader and ARIA labels for better accessibility
  chainSelector: 'Netzwerkauswahl',
  closeModal: 'Fenster schließen',
  closeToast: 'Benachrichtigung schließen',
  selectChain: 'Netzwerk wählen',
  chainOption: 'Netzwerkoption',
  openChainSelector: 'Netzwerkauswahl öffnen',
  currentChain: 'Aktuelles Netzwerk',
  scrollToTop: 'Nach oben scrollen',
  scrollToBottom: 'Nach unten scrollen',
  chainListContainer: 'Liste der Netzwerke',
  walletControls: 'Wallet-Steuerung',
  openWalletModal: 'Wallet-Fenster öffnen',
  walletConnected: 'Wallet verbunden',
  walletNotConnected: 'Wallet nicht verbunden',
  walletBalance: 'Wallet-Guthaben',
  walletAddress: 'Wallet-Adresse',
  transactionStatus: 'Transaktionsstatus',
  successIcon: 'Symbol: erfolgreich',
  errorIcon: 'Symbol: Fehler',
  replacedIcon: 'Symbol: ersetzt',
  statusIcon: 'Statussymbol',

  // Additional states - Supplementary status indicators
  loading: 'Wird geladen',

  // Wallet Avatar labels
  unknownWallet: 'Unbekanntes Wallet',
  walletAvatar: 'Wallet-Avatar',
  ensAvatar: 'ENS-Avatar',
  walletIcon: 'Wallet-Symbol',

  // Impersonate errors
  impersonateAddressEmpty: 'Geben Sie eine Wallet-Adresse oder einen Namen zum Imitieren ein.',
  impersonateAddressNotCorrect:
    'Die eingegebene Wallet-Adresse oder der Name ist nicht korrekt. Versuchen Sie es bitte erneut.',
  impersonateAddressConnected: 'Trennen Sie zuerst das Wallet, um eine andere Adresse zu imitieren.',

  // Legal section labels
  rememberWallet: 'Dieses Wallet merken',
  rememberWalletHint:
    'Wenn angehakt, verbindet diese Website das Wallet bei Ihren nächsten Besuchen wieder, bis Sie es trennen. Sonst bleibt es nur, bis Sie den Tab schließen.',
  rememberWalletInfo: 'Über das Merken des Wallets',
  legalIntro: 'Mit der Verbindung Ihres Wallets akzeptieren Sie unsere',
  legalTerms: 'Nutzungsbedingungen',
  legalPrivacy: 'Datenschutzerklärung',
  legalPrivacyIntro: 'Lesen Sie unsere',
  legalAnd: 'und',

  // Screen reader texts and states (placeholders in braces are replaced by the components)
  carousel: 'Karussell',
  carouselNavigation: 'Navigation der Folien',
  goToSlide: 'Zu Folie {index}: {title}',
  slideOfTotal: 'Folie {index} von {total}',
  autoPlaying: 'Automatische Wiedergabe',
  paused: 'Angehalten',
  carouselInstructions:
    'Mit den Pfeiltasten wechseln Sie die Folien, mit Leertaste oder Enter halten Sie die automatische Wiedergabe an oder setzen sie fort, mit Pos1 und Ende gehen Sie zur ersten und zur letzten Folie. Auf Touch-Geräten wischen Sie nach links oder rechts.',
  networkIcon: 'Netzwerk {name}',
  backToPreviousStep: 'Zurück zum vorigen Schritt',
  opensWalletSelectionPage: 'Öffnet eine externe Seite zur Wallet-Auswahl',
  opensDocumentation: 'Öffnet eine externe Dokumentation',
  connectsImpersonatedWallet: 'Verbindet die imitierte Wallet-Adresse',
  retriesConnection: 'Versucht die Wallet-Verbindung erneut',
  connectionStatus: 'Verbindungsstatus: {status}',
  disclaimerLabel: 'Hinweis: {title}',
  disclaimerAdditionalInformation: 'Weitere Informationen zum Hinweis',
  disclaimerActions: 'Aktionen des Hinweises',
  actionAbout: '{action}: {topic}',
  viewAction: 'Ansehen: {action}',
  disclaimerSummary: 'Hinweis: {topic}.',
  actionAvailable: 'Verfügbare Aktion: {action}.',
  walletIconsAnimation: 'Animation der Wallet-Symbole',
  popularWalletIcons: 'Symbole beliebter Wallets',
  walletAddressOrEnsPlaceholder: '{address} oder ENS-Name (.eth)',
  walletAddressOrSnsPlaceholder: '{address} oder SNS-Name (.sol)',
  availableNetworks: 'Verfügbare Netzwerke',
  networkNameIcon: 'Symbol des Netzwerks {name}',
  networkSelectionTabs: 'Tabs der Netzwerkauswahl',
  networkTab: 'Netzwerk {name}',
  currentlySelected: 'ausgewählt',
  unknown: 'Unbekannt',
  walletIconsDescription:
    'Beliebte Wallets, darunter {wallets}, werden mit schwebender Animation gezeigt, um ihre Vielfalt zu veranschaulichen.',
  getWalletSummary:
    'Einführung in Web3-Wallets. Dieser Abschnitt erklärt, warum Wallets für die Verwaltung digitaler Vermögenswerte und für Web3 wichtig sind. Darüber sind einige beliebte Wallets abgebildet.',
  additionalNetworks: 'Weitere Netzwerke: {count}',
  noConnectorsAvailable: 'Keine Konnektoren verfügbar',
  connectingDetails: 'Wallet: {wallet}, Netzwerk: {network}, Status: {status}',
  connectorsSection: 'Bereich der Wallets: {title}',
  connectorsList: 'Wallets: {title}',
  noGroupConnectors: 'Keine Konnektoren verfügbar: {title}',
  noGroupWallets: 'Keine Wallets verfügbar: {title}',
  availableWalletConnectors: 'Verfügbare Wallet-Konnektoren',
  opensInNewTab: '(öffnet in neuem Tab)',
  resolvingName: '{service}-Name wird aufgelöst...',
  resolvedTo: 'Adresse: {address}',
  legalInformation: 'Rechtliche Hinweise',
  disconnectAllDescription: 'Alle Wallets trennen und das Fenster schließen',
  explorerLinkDescription: 'Öffnet in einem neuen Tab die Wallet-Adresse {address} im Blockchain-Explorer',
  explorerNotAvailable: 'Für dieses Netzwerk ist kein Blockchain-Explorer verfügbar',
  connectWalletsAvailable: 'Verbundene Wallets: {count} verbunden',
  switchNetworkNetworksAvailable: 'Netzwerk wechseln: {count} Netzwerke verfügbar',
  transactionsInAppCount: 'Transaktionen in der App: {count}',
  transactionsAvailable: 'Verfügbare Transaktionen: {count}',
  transactionsPendingCount: 'Ausstehende Transaktionen: {count}',
  noTransactionsForWallet: 'Für dieses Wallet wurden keine Transaktionen gefunden',
  walletName: 'Wallet-Name: {name}',
  loadingWalletName: 'Wallet-Name wird geladen',
  copyWalletAddress: 'Wallet-Adresse kopieren',
  refreshBalance: 'Guthaben aktualisieren',
  noBalanceAvailable: 'Keine Angaben zum Guthaben',
  balanceUpdated: 'Guthaben aktualisiert: {balance}',
  transactionHistoryNotAvailable: 'Der Transaktionsverlauf ist nicht verfügbar',
  transactionHistoryLoadError: 'Der Transaktionsverlauf konnte nicht geladen werden. Versuchen Sie es später erneut.',
  transactionsInAppFor: 'Transaktionen in der App für {address}',
  networkWithId: 'Netzwerk: {chainId}',
  walletWithName: 'Wallet {name}',
  networkSelector: 'Netzwerkauswahl',
  buttonRole: 'Schaltfläche',
  loadingState: 'wird geladen',
  disabledState: 'deaktiviert',
  buttonDisabled: 'Schaltfläche ist deaktiviert',
  selectWalletOptions: 'Klicken, um die Optionen von {name} zu wählen',
  selectOptions: 'Klicken, um Optionen zu wählen',
  walletInformation: 'Wallet-Informationen',
  noConnectionsFound: 'Keine Verbindungen gefunden',
  walletConnectionsManager: 'Verwaltung der Wallet-Verbindungen',
  switchedToWallet: 'Zum Wallet {name} gewechselt',
  disconnectedWallet: 'Wallet {name} getrennt',
  connectedWallet: 'Wallet {name} verbunden',
  copyAddress: 'Adresse kopieren',
  copy: 'Kopieren',
  explorer: 'Explorer',
  removeFromRecent: '{name} aus den zuletzt verwendeten Wallets entfernen',
};
