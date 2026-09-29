import { NovaConnectLabels } from './types';

/**
 * Українські переклади для компонента NovaConnect
 * Всі текстові рядки витягнуті з файлів компонентів
 */
export const ukrainianLabels: NovaConnectLabels = {
  // Основні дії - Основні взаємодії користувача
  connectWallet: 'Підключити Гаманець',
  disconnect: 'Відключити',
  disconnectAll: 'Відключити всі',
  connecting: 'Підключення...',
  connected: 'Підключено',
  tryAgain: 'Спробувати знову',
  back: 'Назад',
  connect: 'Підключити',
  all: 'Всі',
  active: 'Активний',
  connectors: 'Конектори',
  connectNewWallet: 'Підключити новий гаманець',

  // Стани підключення - Статусні повідомлення для процесу підключення гаманця
  connectionError: 'Помилка підключення',
  connectedSuccessfully: 'Успішно підключено!',
  connectingTo: 'Підключення до',
  errorWhenChainSwitching: 'Помилка при перемиканні мережі',
  cannotConnectWallet: `Не вдається підключитись до гаманця. Спробуйте знову або використайте інший з'єднувач.`,

  // Стани транзакцій - Індикатори статусу для блокчейн транзакцій
  success: 'Успіх',
  error: 'Помилка',
  replaced: 'Замінено',
  recent: 'Останні',
  transactionLoading: 'Завантаження транзакції',
  transactionSuccess: 'Транзакція успішна',
  transactionError: 'Транзакція не вдалась',
  transactionReplaced: 'Транзакція замінена',

  // Заголовки модальних вікон - Заголовки для різних модальних діалогів
  aboutWallets: 'Про гаманці',
  getWallet: 'Отримати гаманець',
  connectImpersonatedWallet: 'Підключити імітований гаманець',
  transactionsInApp: 'Транзакції в додатку',
  switchNetwork: 'Змінити мережу',
  switchNetworks: 'Змінити Мережі',
  connectingEllipsis: 'Підключення...',
  connectedWallets: 'Підключені Гаманці',

  // Секції гаманців - Категорії для групування з'єднувачів гаманців
  installed: 'Встановлені',
  popular: 'Популярні',
  impersonate: 'Імітувати',
  readOnlyMode: 'Режим тільки читання',

  // Інформація та описи - Освітній контент та пояснення
  whatIsWallet: 'Що таке гаманець?',
  walletDescription:
    'Гаманці необхідні для управління вашою криптовалютою — вони дозволяють надсилати, отримувати та безпечно зберігати цифрові активи. Підключення гаманця надає вам безпечний доступ та взаємодію з децентралізованими додатками (dApps).',
  whatIsNetwork: 'Що таке мережа?',
  networkDescription:
    'Мережа (або блокчейн) — це децентралізований цифровий реєстр, який записує транзакції. Вибір мережі дозволяє вам обрати, до якого блокчейну ви хочете підключитись.',
  learnMore: 'Дізнатися більше',
  listOfNetworks: 'Список мереж',
  viewOnExplorer: 'Переглянути в провіднику',
  viewTransactions: 'Переглянути транзакції',

  // Форма імітації - Підписи для функції імітації адреси гаманця
  enterWalletAddressOrAddressName: 'Введіть адресу гаманця або його імя для імітації',
  walletAddressPlaceholder: '0x...',

  // Повідомлення про помилки - Повідомлення про помилки для користувача
  noConnectorsFound: `З'єднувачі не знайдені`,
  noConnectorsDescription: 'Ми не змогли знайти жодних гаманців або методів підключення для обраної мережі.',
  somethingWentWrong: 'Щось пішло не так',
  networkPickingError: 'Щось пішло не так з вибором мережі гаманця. Поверніться назад і спробуйте знову.',
  pulsarAdapterRequired: 'Потрібен Pulsar Адаптер',
  pulsarAdapterDescription:
    'Потрібна додаткова конфігурація для перегляду транзакцій в додатку. Зверніться до вашого адміністратора.',
  selectAvailableNetwork: 'Оберіть одну з доступних мереж',

  // Секція отримання гаманця - Контент для нових користувачів без гаманців
  startExploringWeb3: 'Почніть досліджувати Web3',
  walletKeyToDigitalWorld:
    'Ваш гаманець — це ключ до цифрового світу та технологія, яка робить можливим дослідження web3.',
  iDontHaveWallet: 'У мене немає гаманця',
  choseWallet: 'Оберіть гаманець',

  // Слайди про гаманці - Освітній контент карусель, що пояснює переваги гаманців
  keyToNewInternet: 'Ключ до нового Інтернету',
  keyToNewInternetDescription:
    'Ваш гаманець — це більше ніж просто сховище. Думайте про нього як про свій цифровий паспорт, який дозволяє вам справді володіти, показувати та обмінювати кожен цифровий актив, який у вас є, від крипто-токенів до унікальних NFT.',
  logInWithoutHassle: 'Увійдіть без клопоту',
  logInWithoutHassleDescription:
    'Пропустіть нескінченні форми реєстрації! Ваш гаманець — це ваш унікальний пропуск. Просто підключіть його, і веб-сайт миттєво вас впізнає. Це заощаджує ваш час і захищає вашу конфіденційність.',

  // Функція копіювання та відгуки UI - Операції з буфером обміну та відгуки користувача
  copyRawError: 'Скопіювати необроблену помилку',
  copied: 'Скопійовано!',

  // Підписи доступності - Підписи для зчитувачів екрану та ARIA для кращої доступності
  chainSelector: 'Селектор Ланцюга',
  closeModal: 'Закрити модальне вікно',
  selectChain: 'Оберіть ланцюг',
  chainOption: 'Варіант ланцюга',
  openChainSelector: 'Відкрити селектор ланцюга',
  currentChain: 'Поточний ланцюг',
  scrollToTop: 'Прокрутити вгору',
  scrollToBottom: 'Прокрутити вниз',
  chainListContainer: 'Контейнер списку ланцюгів',
  walletControls: 'Керування гаманцем',
  openWalletModal: 'Відкрити модальне вікно гаманця',
  walletConnected: 'Гаманець підключено',
  walletNotConnected: 'Гаманець не підключено',
  walletBalance: 'Баланс гаманця',
  walletAddress: 'Адреса гаманця',
  transactionStatus: 'Статус транзакції',
  successIcon: 'Іконка успіху',
  errorIcon: 'Іконка помилки',
  replacedIcon: 'Іконка заміни',
  statusIcon: 'Іконка статусу',

  // Додаткові стани - Додаткові індикатори статусу
  loading: 'Завантаження',

  // Підписи аватара гаманця
  unknownWallet: 'Невідомий гаманець',
  walletAvatar: 'Аватар гаманця',
  ensAvatar: 'ENS аватар',
  walletIcon: 'Іконка гаманця',

  // Помилки імітації
  impersonateAddressEmpty: 'Введіть адресу або імя гаманця для імітації.',
  impersonateAddressNotCorrect: 'Введена адреса або імя гаманця неправильна. Спробуйте знову.',
  impersonateAddressConnected: 'Спочатку відключіть гаманець для імітації іншої адреси.',

  // Підписи юридичного розділу
  legalIntro: 'Підключаючи свій гаманець, ви погоджуєтесь з нашими',
  legalTerms: 'Умовами використання',
  legalPrivacy: 'Політикою конфіденційності',
  legalAnd: 'та',

  // Тексти для скринрідерів і стани (заповнювачі у фігурних дужках замінюють компоненти)
  carousel: 'карусель',
  carouselNavigation: 'Навігація слайдами',
  goToSlide: 'Перейти до слайда {index}: {title}',
  slideOfTotal: 'Слайд {index} з {total}',
  autoPlaying: 'Автопрогравання',
  paused: 'Призупинено',
  carouselInstructions:
    'Використовуйте клавіші зі стрілками, щоб перемикати слайди, Space або Enter, щоб призупинити чи відновити автопрогравання, Home і End, щоб перейти до першого й останнього слайда. На сенсорних пристроях гортайте ліворуч або праворуч.',
  networkIcon: 'Мережа {name}',
  backToPreviousStep: 'Назад до попереднього кроку',
  opensWalletSelectionPage: 'Відкриває зовнішню сторінку вибору гаманця',
  opensDocumentation: 'Відкриває зовнішню документацію',
  connectsImpersonatedWallet: 'Підключає адресу гаманця для імперсонації',
  retriesConnection: 'Повторює підключення гаманця',
  connectionStatus: 'Стан підключення: {status}',
  disclaimerLabel: 'Застереження: {title}',
  disclaimerAdditionalInformation: 'Додаткова інформація застереження',
  disclaimerActions: 'Дії застереження',
  actionAbout: '{action}: {topic}',
  viewAction: 'Переглянути: {action}',
  disclaimerSummary: 'Застереження: {topic}.',
  actionAvailable: 'Доступна дія: {action}.',
  walletIconsAnimation: 'Анімація іконок гаманців',
  popularWalletIcons: 'Іконки популярних гаманців',
  walletAddressOrEnsPlaceholder: "{address} або ENS-ім'я (.eth)",
  walletAddressOrSnsPlaceholder: "{address} або SNS-ім'я (.sol)",
  availableNetworks: 'Доступні мережі',
  networkNameIcon: 'Іконка мережі {name}',
  networkSelectionTabs: 'Вкладки вибору мережі',
  networkTab: 'Мережа {name}',
  currentlySelected: 'вибрано',
  unknown: 'Невідома',
  walletIconsDescription:
    'Популярні гаманці, зокрема {wallets}, показано з анімацією, щоб проілюструвати їхню різноманітність.',
  getWalletSummary:
    'Знайомство з гаманцями Web3. Цей розділ пояснює, чому гаманці важливі для керування цифровими активами та дослідження Web3. Вище показано кілька популярних гаманців.',
  additionalNetworks: 'Ще мереж: {count}',
  noConnectorsAvailable: 'Немає доступних конекторів',
  connectingDetails: 'Гаманець: {wallet}, мережа: {network}, стан: {status}',
  connectorsSection: 'Розділ гаманців: {title}',
  connectorsList: 'Гаманці: {title}',
  noGroupConnectors: 'Немає доступних конекторів: {title}',
  noGroupWallets: 'Немає доступних гаманців: {title}',
  availableWalletConnectors: 'Доступні конектори гаманців',
  opensInNewTab: '(відкривається в новій вкладці)',
  resolvingName: 'Визначення {service}-імені...',
  resolvedTo: 'Адреса: {address}',
  legalInformation: 'Юридична інформація',
  disconnectAllDescription: 'Відключити всі гаманці й закрити вікно',
  explorerLinkDescription: 'Відкриває в новій вкладці адресу гаманця {address} в оглядачі блокчейну',
  explorerNotAvailable: 'Оглядач блокчейну недоступний для цієї мережі',
  connectWalletsAvailable: 'Підключити гаманець: доступно гаманців — {count}',
  switchNetworkNetworksAvailable: 'Змінити мережу: доступно мереж — {count}',
  transactionsInAppCount: 'Транзакції в застосунку: {count}',
  transactionsAvailable: 'Доступно транзакцій: {count}',
  noTransactionsForWallet: 'Для цього гаманця транзакцій не знайдено',
  walletName: "Ім'я гаманця: {name}",
  loadingWalletName: 'Завантаження імені гаманця',
  copyWalletAddress: 'Скопіювати адресу гаманця',
  refreshBalance: 'Оновити баланс',
  noBalanceAvailable: 'Немає даних про баланс',
  balanceUpdated: 'Баланс оновлено: {balance}',
  transactionHistoryNotAvailable: 'Історія транзакцій недоступна',
  transactionHistoryLoadError: 'Не вдалося завантажити історію транзакцій. Спробуйте пізніше.',
  transactionsInAppFor: 'Транзакції в застосунку для {address}',
  networkWithId: 'Мережа: {chainId}',
  walletWithName: 'Гаманець {name}',
  networkSelector: 'вибір мережі',
  buttonRole: 'кнопка',
  loadingState: 'завантаження',
  disabledState: 'вимкнено',
  buttonDisabled: 'Кнопка вимкнена',
  selectWalletOptions: 'Натисніть, щоб вибрати параметри {name}',
  selectOptions: 'Натисніть, щоб вибрати параметри',
  walletInformation: 'Інформація про гаманець',
  noConnectionsFound: 'Підключень не знайдено',
  walletConnectionsManager: 'Керування підключеннями гаманців',
  switchedToWallet: 'Перемкнено на гаманець {name}',
  disconnectedWallet: 'Гаманець {name} відключено',
  connectedWallet: 'Гаманець {name} підключено',
  copyAddress: 'Скопіювати адресу',
  copy: 'Копіювати',
  explorer: 'Оглядач',
  removeFromRecent: 'Видалити {name} з нещодавніх гаманців',
};
