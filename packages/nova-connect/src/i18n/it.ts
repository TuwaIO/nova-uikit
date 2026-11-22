import { NovaConnectLabels } from './types';

/**
 * Italian (it) translations for Nova Connect components.
 * Contains localized text strings for wallet connections, modals, states, and accessibility.
 */
export const italianLabels: NovaConnectLabels = {
  // Core actions - Primary user interactions
  connectWallet: 'Collega il wallet',
  disconnect: 'Disconnetti',
  disconnectAll: 'Disconnetti tutti',
  connecting: 'Collegamento...',
  connected: 'Collegato',
  tryAgain: 'Riprova',
  back: 'Indietro',
  connect: 'Collega',
  all: 'Tutti',
  active: 'Attivo',
  connectors: 'Connettori',
  connectNewWallet: 'Collega un altro wallet',

  // Connection states - Status messages for wallet connection flow
  connectionError: 'Errore di connessione',
  connectedSuccessfully: 'Collegato correttamente!',
  connectingTo: 'Collegamento a',
  errorWhenChainSwitching: 'Errore durante il cambio di rete',
  cannotConnectWallet: 'Impossibile collegare il wallet. Riprova o usa un altro connettore.',
  requestDeclined: 'Richiesta rifiutata',
  requestDeclinedInWallet: 'Hai rifiutato la richiesta nel tuo wallet. Riprova quando vuoi.',
  restoringWallet: 'Ripristino del wallet…',

  // Transaction states - Status indicators for blockchain transactions
  success: 'Completata',
  error: 'Errore',
  replaced: 'Sostituita',
  cancelled: 'Annullata',
  recent: 'Recenti',
  transactionLoading: 'Caricamento della transazione',
  transactionSuccess: 'Transazione completata',
  transactionError: 'Transazione non riuscita',
  transactionReplaced: 'Transazione sostituita',
  transactionCancelled: 'Transazione annullata',

  // Modal titles - Headers for different modal dialogs
  aboutWallets: 'Informazioni sui wallet',
  getWallet: 'Ottieni un wallet',
  connectImpersonatedWallet: 'Collega un wallet impersonato',
  transactionsInApp: "Transazioni nell'app",
  switchNetwork: 'Cambia rete',
  switchNetworks: 'Cambia rete',
  connectingEllipsis: 'Collegamento...',
  signMessageInWallet: 'Firma il messaggio nel tuo wallet',
  checkWalletRequest: 'Controlla il tuo wallet: la richiesta potrebbe essere in attesa lì.',
  connectedWallets: 'Wallet collegati',

  // Wallet sections - Categories for wallet connector grouping
  installed: 'Installati',
  popular: 'Popolari',
  impersonate: 'Impersona',
  readOnlyMode: 'Modalità sola lettura',

  // Information and descriptions - Educational content and explanations
  whatIsWallet: "Che cos'è un wallet?",
  walletDescription:
    'I wallet sono essenziali per gestire le tue criptovalute: ti permettono di inviare, ricevere e custodire in sicurezza gli asset digitali. Collegando il wallet accedi in sicurezza alle applicazioni decentralizzate (dApp) e interagisci con esse.',
  whatIsNetwork: "Che cos'è una rete?",
  networkDescription:
    'Una rete (o blockchain) è un registro digitale decentralizzato che registra le transazioni. Scegliendo una rete decidi a quale blockchain collegarti.',
  learnMore: 'Scopri di più',
  listOfNetworks: 'Elenco delle reti',
  viewOnExplorer: "Vedi nell'explorer",
  viewTransactions: 'Vedi le transazioni',

  // Impersonation form - Labels for wallet address impersonation feature
  enterWalletAddressOrAddressName: "Inserisci l'indirizzo o il nome del wallet da impersonare",
  walletAddressPlaceholder: '0x...',

  // Error messages - User-facing error notifications and descriptions
  noConnectorsFound: 'Nessun connettore trovato',
  noConnectorsDescription: 'Non abbiamo trovato wallet o metodi di collegamento per la rete scelta.',
  somethingWentWrong: 'Qualcosa è andato storto',
  networkPickingError: 'Qualcosa è andato storto nella scelta della rete del wallet. Torna indietro e riprova.',
  pulsarAdapterRequired: "Serve l'adattatore Pulsar",
  pulsarAdapterDescription:
    "Per vedere le transazioni nell'app serve una configurazione aggiuntiva. Contatta il tuo amministratore.",
  selectAvailableNetwork: 'Scegli una delle reti disponibili',

  // Get Wallet section - Onboarding content for new users without wallets
  startExploringWeb3: 'Inizia a esplorare Web3',
  walletKeyToDigitalWorld:
    'Il tuo wallet è la chiave del mondo digitale e della tecnologia che ti permette di esplorare web3.',
  iDontHaveWallet: 'Non ho un wallet',
  choseWallet: 'Scegli un wallet',

  // About Wallets slides - Educational carousel content explaining wallet benefits
  keyToNewInternet: 'La chiave di un nuovo internet',
  keyToNewInternetDescription:
    'Il tuo wallet è più di un archivio. È il tuo passaporto digitale: con lui possiedi, mostri e scambi ogni asset digitale che hai, dai token cripto agli NFT unici.',
  logInWithoutHassle: 'Accedi senza fatica',
  logInWithoutHassleDescription:
    'Basta moduli di registrazione infiniti! Il tuo wallet è il tuo pass personale. Collegalo e il sito ti riconosce subito. Risparmi tempo e proteggi la tua privacy.',

  // Copy functionality and UI feedback - Clipboard operations and user feedback
  copyRawError: "Copia l'errore originale",
  copied: 'Copiato!',

  // Accessibility labels - Screen reader and ARIA labels for better accessibility
  chainSelector: 'Selettore di rete',
  closeModal: 'Chiudi la finestra',
  selectChain: 'Scegli la rete',
  chainOption: 'Opzione di rete',
  openChainSelector: 'Apri il selettore di rete',
  currentChain: 'Rete attuale',
  scrollToTop: "Scorri all'inizio",
  scrollToBottom: 'Scorri alla fine',
  chainListContainer: 'Elenco delle reti',
  walletControls: 'Controlli del wallet',
  openWalletModal: 'Apri la finestra del wallet',
  walletConnected: 'Wallet collegato',
  walletNotConnected: 'Wallet non collegato',
  walletBalance: 'Saldo del wallet',
  walletAddress: 'Indirizzo del wallet',
  transactionStatus: 'Stato della transazione',
  successIcon: 'Icona di completamento',
  errorIcon: 'Icona di errore',
  replacedIcon: 'Icona di sostituzione',
  statusIcon: 'Icona di stato',

  // Additional states - Supplementary status indicators
  loading: 'Caricamento',

  // Wallet Avatar labels
  unknownWallet: 'Wallet sconosciuto',
  walletAvatar: 'Avatar del wallet',
  ensAvatar: 'Avatar ENS',
  walletIcon: 'Icona del wallet',

  // Impersonate errors
  impersonateAddressEmpty: 'Inserisci un indirizzo o un nome di wallet da impersonare.',
  impersonateAddressNotCorrect: "L'indirizzo o il nome del wallet inserito non è corretto. Riprova.",
  impersonateAddressConnected: 'Disconnetti prima il wallet per impersonare un altro indirizzo.',

  // Legal section labels
  rememberWallet: 'Ricorda questo wallet',
  rememberWalletHint:
    'Se è selezionato, questo sito ricollega il wallet alle tue prossime visite finché non lo disconnetti. Altrimenti lo tiene solo finché non chiudi la scheda.',
  rememberWalletInfo: 'Come funziona il ricordo del wallet',
  legalIntro: 'Collegando il tuo wallet, accetti i nostri',
  legalTerms: 'Termini di servizio',
  legalPrivacy: 'Informativa sulla privacy',
  legalPrivacyIntro: 'Consulta la nostra',
  legalAnd: 'e',

  // Screen reader texts and states (placeholders in braces are replaced by the components)
  carousel: 'carosello',
  carouselNavigation: 'Navigazione delle slide',
  goToSlide: 'Vai alla slide {index}: {title}',
  slideOfTotal: 'Slide {index} di {total}',
  autoPlaying: 'Riproduzione automatica',
  paused: 'In pausa',
  carouselInstructions:
    "Usa i tasti freccia per cambiare slide, Spazio o Invio per mettere in pausa o riprendere la riproduzione automatica, Home e Fine per andare alla prima e all'ultima slide. Sui dispositivi touch scorri a sinistra o a destra.",
  networkIcon: 'Rete {name}',
  backToPreviousStep: 'Torna al passaggio precedente',
  opensWalletSelectionPage: 'Apre una pagina esterna per scegliere il wallet',
  opensDocumentation: 'Apre la documentazione esterna',
  connectsImpersonatedWallet: "Collega l'indirizzo di wallet impersonato",
  retriesConnection: 'Riprova il collegamento del wallet',
  connectionStatus: 'Stato del collegamento: {status}',
  disclaimerLabel: 'Avvertenza: {title}',
  disclaimerAdditionalInformation: "Informazioni aggiuntive dell'avvertenza",
  disclaimerActions: "Azioni dell'avvertenza",
  actionAbout: '{action}: {topic}',
  viewAction: 'Vedi: {action}',
  disclaimerSummary: 'Avvertenza: {topic}.',
  actionAvailable: 'Azione disponibile: {action}.',
  walletIconsAnimation: 'Animazione delle icone dei wallet',
  popularWalletIcons: 'Icone dei wallet più popolari',
  walletAddressOrEnsPlaceholder: '{address} o nome ENS (.eth)',
  walletAddressOrSnsPlaceholder: '{address} o nome SNS (.sol)',
  availableNetworks: 'Reti disponibili',
  networkNameIcon: 'Icona della rete {name}',
  networkSelectionTabs: 'Schede di scelta della rete',
  networkTab: 'Rete {name}',
  currentlySelected: 'selezionata',
  unknown: 'Sconosciuta',
  walletIconsDescription:
    "I wallet più popolari, tra cui {wallets}, sono mostrati con un'animazione fluttuante per illustrarne la varietà.",
  getWalletSummary:
    'Introduzione ai wallet Web3. Questa sezione spiega perché i wallet sono importanti per gestire gli asset digitali ed esplorare Web3. Sopra sono mostrati alcuni wallet popolari.',
  additionalNetworks: 'Altre reti: {count}',
  noConnectorsAvailable: 'Nessun connettore disponibile',
  connectingDetails: 'Wallet: {wallet}, rete: {network}, stato: {status}',
  connectorsSection: 'Sezione dei wallet: {title}',
  connectorsList: 'Wallet: {title}',
  noGroupConnectors: 'Nessun connettore disponibile: {title}',
  noGroupWallets: 'Nessun wallet disponibile: {title}',
  availableWalletConnectors: 'Connettori di wallet disponibili',
  opensInNewTab: '(si apre in una nuova scheda)',
  resolvingName: 'Risoluzione del nome {service}...',
  resolvedTo: 'Indirizzo: {address}',
  legalInformation: 'Informazioni legali',
  disconnectAllDescription: 'Disconnetti tutti i wallet e chiudi la finestra',
  explorerLinkDescription: "Apre in una nuova scheda l'indirizzo del wallet {address} nell'explorer della blockchain",
  explorerNotAvailable: "Per questa rete l'explorer della blockchain non è disponibile",
  connectWalletsAvailable: 'Wallet collegati: {count}',
  switchNetworkNetworksAvailable: 'Cambia rete: {count} reti disponibili',
  transactionsInAppCount: "Transazioni nell'app: {count}",
  transactionsAvailable: 'Transazioni disponibili: {count}',
  transactionsPendingCount: 'Transazioni in attesa: {count}',
  noTransactionsForWallet: 'Nessuna transazione trovata per questo wallet',
  walletName: 'Nome del wallet: {name}',
  loadingWalletName: 'Caricamento del nome del wallet',
  copyWalletAddress: "Copia l'indirizzo del wallet",
  refreshBalance: 'Aggiorna il saldo',
  noBalanceAvailable: 'Nessun dato sul saldo',
  balanceUpdated: 'Saldo aggiornato: {balance}',
  transactionHistoryNotAvailable: 'La cronologia delle transazioni non è disponibile',
  transactionHistoryLoadError: 'Impossibile caricare la cronologia delle transazioni. Riprova più tardi.',
  transactionsInAppFor: "Transazioni nell'app per {address}",
  networkWithId: 'Rete: {chainId}',
  walletWithName: 'Wallet {name}',
  networkSelector: 'selettore di rete',
  buttonRole: 'pulsante',
  loadingState: 'caricamento',
  disabledState: 'disattivato',
  buttonDisabled: 'Il pulsante è disattivato',
  selectWalletOptions: 'Fai clic per scegliere le opzioni di {name}',
  selectOptions: 'Fai clic per scegliere le opzioni',
  walletInformation: 'Informazioni sul wallet',
  noConnectionsFound: 'Nessun collegamento trovato',
  walletConnectionsManager: 'Gestione dei collegamenti dei wallet',
  switchedToWallet: 'Passato al wallet {name}',
  disconnectedWallet: 'Wallet {name} disconnesso',
  connectedWallet: 'Wallet {name} collegato',
  copyAddress: "Copia l'indirizzo",
  copy: 'Copia',
  explorer: 'Explorer',
  removeFromRecent: 'Rimuovi {name} dai wallet recenti',
};
