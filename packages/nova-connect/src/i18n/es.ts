import { NovaConnectLabels } from './types';

/**
 * Spanish (es) translations for Nova Connect components.
 * Contains localized text strings for wallet connections, modals, states, and accessibility.
 */
export const spanishLabels: NovaConnectLabels = {
  // Core actions - Primary user interactions
  connectWallet: 'Conectar billetera',
  disconnect: 'Desconectar',
  disconnectAll: 'Desconectar todas',
  connecting: 'Conectando...',
  connected: 'Conectada',
  tryAgain: 'Reintentar',
  back: 'Volver',
  connect: 'Conectar',
  all: 'Todas',
  active: 'Activa',
  connectors: 'Billeteras activas',
  connectNewWallet: 'Conectar otra billetera',

  // Connection states - Status messages for wallet connection flow
  connectionError: 'Error de conexión',
  connectedSuccessfully: '¡Conectada correctamente!',
  connectingTo: 'Conectando con',
  errorWhenChainSwitching: 'Error al cambiar de red',
  cannotConnectWallet: 'No se puede conectar la billetera. Vuelve a intentarlo o usa otro conector.',
  requestDeclined: 'Solicitud rechazada',
  requestDeclinedInWallet: 'Rechazaste la solicitud en tu billetera. Vuelve a intentarlo cuando quieras.',
  restoringWallet: 'Restaurando tu billetera…',

  // Transaction states - Status indicators for blockchain transactions
  success: 'Completada',
  error: 'Error',
  replaced: 'Reemplazada',
  cancelled: 'Cancelada',
  recent: 'Recientes',
  transactionLoading: 'Cargando la transacción',
  transactionSuccess: 'Transacción completada',
  transactionError: 'La transacción falló',
  transactionReplaced: 'Transacción reemplazada',
  transactionCancelled: 'Transacción cancelada',

  // Modal titles - Headers for different modal dialogs
  aboutWallets: 'Sobre las billeteras',
  getWallet: 'Conseguir una billetera',
  connectImpersonatedWallet: 'Conectar una billetera suplantada',
  transactionsInApp: 'Transacciones en la app',
  switchNetwork: 'Cambiar de red',
  switchNetworks: 'Cambiar de red',
  connectingEllipsis: 'Conectando...',
  signMessageInWallet: 'Firma el mensaje en tu billetera',
  checkWalletRequest: 'Revisa tu billetera: puede que la solicitud esté esperando allí.',
  connectedWallets: 'Billeteras conectadas',

  // Wallet sections - Categories for wallet connector grouping
  installed: 'Instaladas',
  popular: 'Populares',
  impersonate: 'Suplantar',
  readOnlyMode: 'Modo de solo lectura',

  // Information and descriptions - Educational content and explanations
  whatIsWallet: '¿Qué es una billetera?',
  walletDescription:
    'Las billeteras son esenciales para gestionar tus criptomonedas: con ellas envías, recibes y guardas activos digitales de forma segura. Al conectar tu billetera accedes con seguridad a las aplicaciones descentralizadas (dApps) y operas con ellas.',
  whatIsNetwork: '¿Qué es una red?',
  networkDescription:
    'Una red (o blockchain) es un registro digital descentralizado que anota las transacciones. Al elegir una red decides a qué blockchain te conectas.',
  learnMore: 'Más información',
  listOfNetworks: 'Lista de redes',
  viewOnExplorer: 'Ver en el explorador',
  viewTransactions: 'Ver transacciones',

  // Impersonation form - Labels for wallet address impersonation feature
  enterWalletAddressOrAddressName: 'Introduce la dirección o el nombre de la billetera que quieres suplantar',
  walletAddressPlaceholder: '0x...',

  // Error messages - User-facing error notifications and descriptions
  noConnectorsFound: 'No se encontraron conectores',
  noConnectorsDescription: 'No encontramos billeteras ni métodos de conexión para la red elegida.',
  somethingWentWrong: 'Algo salió mal',
  networkPickingError: 'Algo salió mal al elegir la red de la billetera. Vuelve atrás e inténtalo de nuevo.',
  pulsarAdapterRequired: 'Se necesita el adaptador de Pulsar',
  pulsarAdapterDescription:
    'Para ver las transacciones en la app hace falta una configuración adicional. Contacta con tu administrador.',
  selectAvailableNetwork: 'Elige una de las redes disponibles',

  // Get Wallet section - Onboarding content for new users without wallets
  startExploringWeb3: 'Empieza a explorar Web3',
  walletKeyToDigitalWorld:
    'Tu billetera es la llave del mundo digital y de la tecnología que te permite explorar web3.',
  iDontHaveWallet: 'No tengo billetera',
  choseWallet: 'Elige una billetera',

  // About Wallets slides - Educational carousel content explaining wallet benefits
  keyToNewInternet: 'La llave de un nuevo internet',
  keyToNewInternetDescription:
    'Tu billetera es más que un lugar donde guardar. Es tu pasaporte digital: con ella posees, muestras e intercambias cada activo digital que tienes, de los tokens cripto a los NFT únicos.',
  logInWithoutHassle: 'Inicia sesión sin complicaciones',
  logInWithoutHassleDescription:
    '¡Olvídate de los formularios de registro! Tu billetera es tu pase de acceso. Conéctala y el sitio te reconoce al instante. Ahorras tiempo y proteges tu privacidad.',

  // Copy functionality and UI feedback - Clipboard operations and user feedback
  copyRawError: 'Copiar el error original',
  copied: '¡Copiado!',

  // Accessibility labels - Screen reader and ARIA labels for better accessibility
  chainSelector: 'Selector de red',
  closeModal: 'Cerrar la ventana',
  closeToast: 'Cerrar la notificación',
  selectChain: 'Elegir red',
  chainOption: 'Opción de red',
  openChainSelector: 'Abrir el selector de red',
  currentChain: 'Red actual',
  scrollToTop: 'Desplazarse arriba',
  scrollToBottom: 'Desplazarse abajo',
  chainListContainer: 'Lista de redes',
  walletControls: 'Controles de la billetera',
  openWalletModal: 'Abrir la ventana de la billetera',
  walletConnected: 'Billetera conectada',
  walletNotConnected: 'Billetera no conectada',
  walletBalance: 'Saldo de la billetera',
  walletAddress: 'Dirección de la billetera',
  transactionStatus: 'Estado de la transacción',
  successIcon: 'Icono de completada',
  errorIcon: 'Icono de error',
  replacedIcon: 'Icono de reemplazada',
  statusIcon: 'Icono de estado',

  // Additional states - Supplementary status indicators
  loading: 'Cargando',

  // Wallet Avatar labels
  unknownWallet: 'Billetera desconocida',
  walletAvatar: 'Avatar de la billetera',
  ensAvatar: 'Avatar de ENS',
  walletIcon: 'Icono de la billetera',

  // Impersonate errors
  impersonateAddressEmpty: 'Introduce una dirección o un nombre de billetera para suplantar.',
  impersonateAddressNotCorrect: 'La dirección o el nombre de billetera no es correcto. Inténtalo de nuevo.',
  impersonateAddressConnected: 'Desconecta primero la billetera para suplantar otra dirección.',

  // Legal section labels
  rememberWallet: 'Recordar esta billetera',
  rememberWalletHint:
    'Si lo marcas, este sitio vuelve a conectar la billetera en tus próximas visitas hasta que la desconectes. Si no, la guarda solo hasta que cierres la pestaña.',
  rememberWalletInfo: 'Sobre recordar la billetera',
  legalIntro: 'Al conectar tu billetera, aceptas nuestros',
  legalTerms: 'Términos del servicio',
  legalPrivacy: 'Política de privacidad',
  legalPrivacyIntro: 'Consulta nuestra',
  legalAnd: 'y',

  // Screen reader texts and states (placeholders in braces are replaced by the components)
  carousel: 'carrusel',
  carouselNavigation: 'Navegación de diapositivas',
  goToSlide: 'Ir a la diapositiva {index}: {title}',
  slideOfTotal: 'Diapositiva {index} de {total}',
  autoPlaying: 'Reproducción automática',
  paused: 'En pausa',
  carouselInstructions:
    'Usa las flechas para cambiar de diapositiva, Espacio o Intro para pausar o reanudar la reproducción automática, Inicio y Fin para ir a la primera y a la última diapositiva. En pantallas táctiles, desliza a la izquierda o a la derecha.',
  networkIcon: 'Red {name}',
  backToPreviousStep: 'Volver al paso anterior',
  opensWalletSelectionPage: 'Abre una página externa para elegir billetera',
  opensDocumentation: 'Abre documentación externa',
  connectsImpersonatedWallet: 'Conecta con la dirección de billetera suplantada',
  retriesConnection: 'Reintenta la conexión de la billetera',
  connectionStatus: 'Estado de la conexión: {status}',
  disclaimerLabel: 'Aviso: {title}',
  disclaimerAdditionalInformation: 'Información adicional del aviso',
  disclaimerActions: 'Acciones del aviso',
  actionAbout: '{action}: {topic}',
  viewAction: 'Ver: {action}',
  disclaimerSummary: 'Aviso: {topic}.',
  actionAvailable: 'Acción disponible: {action}.',
  walletIconsAnimation: 'Animación de iconos de billeteras',
  popularWalletIcons: 'Iconos de billeteras populares',
  walletAddressOrEnsPlaceholder: '{address} o nombre ENS (.eth)',
  walletAddressOrSnsPlaceholder: '{address} o nombre SNS (.sol)',
  availableNetworks: 'Redes disponibles',
  networkNameIcon: 'Icono de la red {name}',
  networkSelectionTabs: 'Pestañas de selección de red',
  networkTab: 'Red {name}',
  currentlySelected: 'seleccionada',
  unknown: 'Desconocida',
  walletIconsDescription:
    'Las billeteras populares, entre ellas {wallets}, aparecen con una animación flotante para mostrar su variedad.',
  getWalletSummary:
    'Introducción a las billeteras Web3. Esta sección explica por qué las billeteras son importantes para gestionar activos digitales y explorar Web3. Arriba se muestran algunas billeteras populares.',
  additionalNetworks: 'Redes adicionales: {count}',
  noConnectorsAvailable: 'No hay conectores disponibles',
  connectingDetails: 'Billetera: {wallet}, red: {network}, estado: {status}',
  connectorsSection: 'Sección de billeteras: {title}',
  connectorsList: 'Billeteras: {title}',
  noGroupConnectors: 'No hay conectores disponibles: {title}',
  noGroupWallets: 'No hay billeteras disponibles: {title}',
  availableWalletConnectors: 'Conectores de billetera disponibles',
  opensInNewTab: '(se abre en una pestaña nueva)',
  resolvingName: 'Resolviendo el nombre {service}...',
  resolvedTo: 'Dirección: {address}',
  legalInformation: 'Información legal',
  disconnectAllDescription: 'Desconectar todas las billeteras y cerrar la ventana',
  explorerLinkDescription:
    'Abre en una pestaña nueva la dirección de billetera {address} en el explorador de la blockchain',
  explorerNotAvailable: 'No hay explorador de la blockchain para esta red',
  connectWalletsAvailable: 'Billeteras conectadas: {count}',
  switchNetworkNetworksAvailable: 'Cambiar de red: {count} redes disponibles',
  transactionsInAppCount: 'Transacciones en la app: {count}',
  transactionsAvailable: 'Transacciones disponibles: {count}',
  transactionsPendingCount: 'Transacciones pendientes: {count}',
  noTransactionsForWallet: 'No se encontraron transacciones de esta billetera',
  walletName: 'Nombre de la billetera: {name}',
  loadingWalletName: 'Cargando el nombre de la billetera',
  copyWalletAddress: 'Copiar la dirección de la billetera',
  refreshBalance: 'Actualizar el saldo',
  noBalanceAvailable: 'No hay datos del saldo',
  balanceUpdated: 'Saldo actualizado: {balance}',
  transactionHistoryNotAvailable: 'El historial de transacciones no está disponible',
  transactionHistoryLoadError: 'No se pudo cargar el historial de transacciones. Inténtalo más tarde.',
  transactionsInAppFor: 'Transacciones en la app de {address}',
  networkWithId: 'Red: {chainId}',
  walletWithName: 'Billetera {name}',
  networkSelector: 'selector de red',
  buttonRole: 'botón',
  loadingState: 'cargando',
  disabledState: 'desactivado',
  buttonDisabled: 'El botón está desactivado',
  selectWalletOptions: 'Haz clic para elegir las opciones de {name}',
  selectOptions: 'Haz clic para elegir opciones',
  walletInformation: 'Información de la billetera',
  noConnectionsFound: 'No se encontraron conexiones',
  walletConnectionsManager: 'Gestión de las conexiones de billeteras',
  switchedToWallet: 'Cambiaste a la billetera {name}',
  disconnectedWallet: 'Billetera {name} desconectada',
  connectedWallet: 'Billetera {name} conectada',
  copyAddress: 'Copiar la dirección',
  copy: 'Copiar',
  explorer: 'Explorador',
  removeFromRecent: 'Quitar {name} de las billeteras recientes',
};
