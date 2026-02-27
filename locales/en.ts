export default {
  common: {
    submit: 'Submit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    comingSoon: 'Coming Soon'
  },
  login: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account to continue',
    username: 'Account',
    usernamePlaceholder: 'Please enter your account',
    password: 'Password',
    passwordPlaceholder: 'Please enter your password',
    forgotPassword: 'Forgot Password?',
    loginButton: 'Sign In',
    usernameRequired: 'Please enter your account',
    passwordRequired: 'Please enter your password',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed, please check your credentials'
  },
  theme: {
    light: 'Light Mode',
    dark: 'Dark Mode'
  },
  language: {
    zh: '简体中文',
    en: 'English'
  },
  // Bottom Navigation
  tabs: {
    withdraw: 'Withdraw',
    trade: 'Trade',
    ticket: 'Ticket',
    profile: 'Profile'
  },
  // Withdraw
  withdraw: {
    amount: 'Amount',
    receiveAmount: 'Received',
    address: 'Address',
    time: 'Time',
    confirmTime: 'Confirmed',
    energyUsage: 'Energy Used',
    bandwidthUsage: 'Bandwidth Used',
    viewTransaction: 'View Transaction',
    viewDetail: 'View Detail',
    noData: 'No records',
    approve: 'Approve',
    reject: 'Reject',
    approveSuccess: 'Approved successfully',
    rejectSuccess: 'Rejected successfully',
    approveFailed: 'Approve failed',
    rejectFailed: 'Reject failed',
    approveConfirmTitle: 'Approve Withdrawal',
    approveConfirmContent: 'Confirm to approve {user}\'s withdrawal request?\nAmount: {amount}',
    rejectConfirmTitle: 'Reject Withdrawal',
    rejectConfirmContent: 'Confirm to reject {user}\'s withdrawal request?\nAmount: {amount}',
    // 查询相关
    search: 'Search',
    refresh: 'Refresh',
    reset: 'Reset',
    walletAddressPlaceholder: 'Please enter wallet address',
    statusSelect: 'Select Status',
    allStatus: 'All Status',
    noMore: 'No more data'
  },
  // Withdraw Detail
  withdrawDetail: {
    title: 'Withdrawal Details',
    basicInfo: 'Basic Info',
    amountInfo: 'Amount Info',
    addressInfo: 'Address Info',
    resourceInfo: 'Resource Usage',
    timeInfo: 'Time Info',
    transactionInfo: 'Transaction Info',
    applicant: 'Applicant',
    email: 'Email',
    userId: 'User ID',
    status: 'Status',
    trxFee: 'TRX Fee',
    viewAddress: 'View Address',
    clickToView: 'Click to view',
    copy: 'Copy',
    copySuccess: 'Copied successfully',
    recordNotFound: 'Record not found',
    loadFailed: 'Load failed'
  },
  // Ticket
  ticket: {
    title: 'Ticket',
    filter: 'Filter',
    search: 'Search',
    reset: 'Reset',
    refresh: 'Refresh',
    statusSelect: 'Select Status',
    ignoreSelect: 'Ignore Status',
    noData: 'No tickets',
    noMore: 'No more data',
    creator: 'Reporter',
    createTime: 'Reported',
    content: 'Content',
    steamId: 'Steam ID',
    steamIdPlaceholder: 'Please enter Steam ID',
    techSupport: 'Tech Support',
    cancelTechSupport: 'Cancel Support',
    ignore: 'Ignore',
    ignored: 'Ignored',
    errors: 'Errors',
    techSupportTitle: 'Tech Support',
    techSupportConfirm: 'Mark this ticket as tech support?',
    cancelTechSupportTitle: 'Cancel Tech Support',
    cancelTechSupportConfirm: 'Cancel tech support for this ticket?',
    techSupportSuccess: 'Marked as tech support',
    cancelTechSupportSuccess: 'Cancelled tech support',
    ignoreSuccess: 'Ticket ignored',
    ignoreTitle: 'Ignore Ticket',
    ignoreConfirm: 'Ignore this ticket?',
    viewDetail: 'View Detail',
    pendingReply: 'Pending',
    clickView: 'Click to View',
    close: 'Close'
  },
  // Ticket Detail
  ticketDetail: {
    title: 'Ticket Details',
    basicInfo: 'Basic Info',
    contentInfo: 'Content',
    conversationHistory: 'Conversation History',
    timeInfo: 'Time Info',
    tags: 'Tags',
    ticketId: 'Ticket ID',
    status: 'Status',
    ticketTitle: 'Title',
    recordNotFound: 'Record not found',
    loadFailed: 'Load failed',
    admin: 'Admin',
    user: 'User',
    viewChat: 'View Conversation'
  },
  // Ticket Chat
  ticketChat: {
    title: 'Conversation',
    noMessages: 'No messages yet',
    inputPlaceholder: 'Enter your reply...',
    send: 'Send',
    uploadFailed: 'Failed to upload image',
    sendSuccess: 'Sent successfully',
    sendFailed: 'Failed to send'
  },
  ticketStatus: {
    all: 'All Status',
    '0': 'Pending',
    '1': 'Replied',
    '2': 'Resolved',
    '3': 'Closed'
  },
  ticketIgnore: {
    all: 'All',
    'false': 'Not Ignored',
    'true': 'Ignored'
  },
  withdrawStatus: {
    all: 'All Status',
    '-3': 'Rejected',
    '-2': 'Failed',
    '-1': 'Cancelled',
    '0': 'Initiated',
    '1': 'Pending',
    '2': 'Confirming',
    '3': 'Completed'
  },
  // Trade
  trade: {
    // Tab labels
    tab1: 'Trade Management',
    tab2: 'Self-Operated Trade',
    filter: 'Filter',
    refresh: 'Refresh',
    refreshSuccess: 'Refreshed successfully',
    price: 'Price',
    realPrice: 'Real Price',
    fee: 'Fee',
    score: 'Score',
    nums: 'Quantity',
    buyer: 'Buyer',
    seller: 'Seller',
    createTime: 'Created',
    sendTime: 'Shipped',
    receiveTime: 'Received',
    endTime: 'Settled',
    settlementCountdown: 'Settlement Countdown',
    cancelReason: 'Cancel Reason',
    noData: 'No trade records',
    searchPlaceholder: 'Enter buyer/seller name',
    orderNoSelect: 'Order No',
    orderNo: 'Order No',
    orderNoPlaceholder: 'Enter order number',
    statusSelect: 'Select Status',
    appSelect: 'Select Game',
    typeSelect: 'Select Type',
    search: 'Search',
    reset: 'Reset',
    noMore: 'No more data',
    copySuccess: 'Copied successfully',
    // Action buttons
    viewDetail: 'View Detail',
    viewRecordDetail: 'View Detail',
    itemDetail: 'Item Detail',
    cancelTrade: 'Cancel Trade',
    cancelTradeTitle: 'Cancel Trade',
    cancelTradeConfirm: 'Confirm to cancel this trade?',
    cancelTradeSuccess: 'Cancel successful',
    cancelTradeFailed: 'Cancel failed',
    settlementRestore: 'Restore',
    settlementSync: 'Sync',
    changeOffer: 'Change Offer',
    settlementRestoreTitle: 'Settlement Restore',
    settlementSyncTitle: 'Settlement Sync',
    settlementRestoreConfirm: 'Confirm to restore settlement status?',
    settlementSyncConfirm: 'Confirm to sync settlement status?',
    settlementRestoreSuccess: 'Restore successful',
    settlementRestoreFailed: 'Restore failed',
    settlementSyncSuccess: 'Sync successful',
    settlementSyncFailed: 'Sync failed',
    // Detail popup
    detailTitle: 'Trade Details',
    detail: {
      basicInfo: 'Basic Info',
      tradeInfo: 'Trade Info',
      priceInfo: 'Price Info',
      userInfo: 'User Info',
      timeInfo: 'Time Info',
      cancelInfo: 'Cancel Info',
      errorInfo: 'Error Info',
      id: 'Trade ID',
      offerId: 'Offer ID',
      appId: 'App ID',
      appName: 'App Name',
      marketHashName: 'Market Hash Name',
      marketName: 'Market Name',
      schemaId: 'Schema ID',
      type: 'Type',
      status: 'Status',
      flag: 'Flag',
      nums: 'Quantity',
      score: 'Score',
      buyerId: 'Buyer ID',
      sellerId: 'Seller ID',
      sellerSelfOwned: 'Seller Self Owned',
      cancelReason: 'Cancel Reason Code'
    },
    // Type
    type: {
      sell: 'Sell',
      supply: 'Supply'
    }
  },
  // Trade Record Detail
  tradeRecordDetail: {
    title: 'Trade Record Details',
    recordNotFound: 'Record not found',
    loadFailed: 'Load failed',
    tabTrade: 'Trade Details',
    tabItem: 'Item Details',
    tabAction: 'Actions'
  },
  // Trade Type
  tradeType: {
    all: 'All Types'
  },
  // Trade Status
  tradeStatus: {
    all: 'All Status',
    '-2': 'Revoked',
    '-1': 'Cancelled',
    '1': 'Pending Payment',
    '2': 'Pending Shipment',
    '3': 'Shipment Pending',
    '4': 'Pending Receipt',
    '5': 'Settling',
    '6': 'Completed',
    '9': 'Cancelling'
  },
  // Trade App
  tradeApp: {
    all: 'All Games'
  },
  // Trade Detail
  tradeDetail: {
    title: 'Item Details',
    noData: 'No item details',
    basicInfo: 'Basic Info',
    priceInfo: 'Price Info',
    statusInfo: 'Status Info',
    appName: 'App',
    marketName: 'Item Name',
    marketNamePlaceholder: 'Enter item name',
    marketHashName: 'Market Hash Name',
    itemId: 'Item ID',
    assetId: 'Asset ID',
    paintSeed: 'Paint Seed',
    paintWear: 'Paint Wear',
    status: 'Status',
    statusSelect: 'Select Status',
    filter: 'Filter',
    search: 'Search',
    reset: 'Reset',
    itemStatus: {
      all: 'All Status',
      normal: 'Normal',
      cancelled: 'Order Cancelled',
      missing: 'Item Missing'
    }
  },
  // Profile
  profile: {
    welcome: 'Welcome to Admin System',
    logout: 'Logout',
    logoutConfirm: 'Reminder',
    logoutMessage: 'Are you sure you want to logout?',
    accountInfo: 'Account Info',
    roleInfo: 'Role Info',
    username: 'Username',
    realname: 'Real Name',
    email: 'Email',
    roles: 'Roles',
    noRoles: 'No Roles',
    accountStatus: 'Account Status'
  },
  status: {
    normal: 'Normal',
    locked: 'Locked'
  },
  // Server Address Management
  baseurl: {
    title: 'Server Address',
    current: 'Current Address',
    using: 'Using',
    savedList: 'Saved Addresses',
    addNew: 'Add New Address',
    nameLabel: 'Name',
    namePlaceholder: 'Enter name (e.g., Test Server)',
    urlLabel: 'Server Address',
    urlPlaceholder: 'Enter server address (e.g., http://192.168.1.100:8088)',
    addButton: 'Add Address',
    active: 'Active',
    nameRequired: 'Please enter a name',
    urlRequired: 'Please enter a server address',
    urlInvalid: 'Invalid server address format',
    urlExists: 'This address already exists',
    addSuccess: 'Added successfully',
    switchTitle: 'Switch Address',
    switchConfirm: 'Switch to the following address?\n{url}',
    switchSuccess: 'Switched successfully',
    deleteTitle: 'Delete Address',
    deleteConfirm: 'Delete address "{name}"?',
    deleteSuccess: 'Deleted successfully',
    deleteCurrentNotAllowed: 'The currently active server address cannot be deleted',
    deleteWarning: 'This action cannot be undone',
    noSaved: 'No saved addresses',
    testingStart: 'Starting connectivity test...',
    testComplete: 'Test complete: {success} succeeded, {error} failed',
    testingTitle: 'Testing Connectivity',
    switchTestFailed: 'Connectivity Test Failed',
    switchTestFailedMessage: 'Target server cannot be reached. Please check the server address or network status and try again.'
  },
  // Hot Update
  update: {
    latestDiscover: 'New Version Available',
    updateComplete: 'Update Complete',
    restartRequired: 'You need to restart the application to take effect',
    downloadFailed: 'Download failed'
  }
}






