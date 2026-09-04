// Bilingual Internationalization System (EN | తెలుగు)
// Clinical terms, medicine names, batch numbers, invoice numbers, and rupee amounts remain strictly untranslated.

export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    bills: "Bills",
    inventory: "Inventory",
    distributors: "Distributors",
    more: "More",
    reports: "Reports",
    settings: "Settings",
    reviewCenter: "Review Center",
    expiry: "Expiry Tracker",
    priceAnomalies: "Price Anomalies",
    auditLogs: "Audit Logs",
    logout: "Log Out",

    // Header & Meta
    liveShift: "Live Shift Active",
    clinicalAuth: "Clinical Auth",
    pharmacyManagement: "Pharmacy Management",
    notifications: "Notifications",

    // Dashboard
    financialOverview: "Financial Overview",
    outstanding: "Outstanding",
    purchases: "Purchases",
    totalPaid: "Total Paid",
    expiringSoon: "Expiring Soon",
    fastDispense: "Fast Dispense & Intake",
    uploadBill: "Upload Bill",
    addReceipt: "Add Receipt",
    addManualStock: "Manual Stock",
    viewLedgers: "View Ledgers",
    auditVerificationLog: "Audit Verification Log",
    balanced: "100% Balanced",
    recentActivity: "Recent Activity",
    viewAll: "View All",
    invoicesDue: "Invoices Due",
    thisMonth: "This Month",
    reconciledBankUpi: "Reconciled Bank & UPI",
    withinDays: "Within 30–60 Days",

    // Login
    signIn: "Sign In",
    authenticating: "Authenticating...",
    mobileOrEmail: "Mobile Number or Email",
    password: "Password",
    rememberMe: "Remember Me",
    forgotPassword: "Forgot Password?",
    verificationRequired: "Verification Required",
    loginErrorDesc: "Please enter valid staff credentials.",
    dayShiftAudit: "Day Shift Audit Protocol",
    staffScheduleSync: "Staff PIN & Schedule sync enabled",
    securityNotice: "Authorized pharmacy staff & owner access only. Unauthorized attempts are logged under Pharmacy Drug & Cosmetics Act protocols.",

    // Bills & OCR
    purchaseBillsAndInvoices: "Purchase Bills & Invoices",
    uploadScanBill: "Upload / Scan Bill",
    invoiceMetadata: "Invoice Metadata",
    billNumber: "Bill Number",
    billDate: "Bill Date",
    distributor: "Distributor",
    extractedLineItems: "Extracted Line Items",
    addItem: "Add Item",
    takePhoto: "Take Photo",
    uploadGallery: "Upload Gallery",
    ocrConfidence: "OCR Confidence",
    itemsExtracted: "items extracted",
    subtotal: "Subtotal",
    taxableValue: "Taxable Value",
    gst: "GST",
    grandTotal: "Grand Total",
    saveBillToInventory: "Save Bill to Inventory",
    rejectRescan: "Reject / Re-scan",
    totalMismatch: "Total mismatch detected",
    totalMismatchDesc: "Line items sum does not match the invoice grand total. Please verify before saving.",
    duplicateBillWarning: "Duplicate Bill Warning",
    duplicateBillDesc: "A bill with this invoice number already exists for this distributor.",
    statusVerified: "Verified",
    statusNeedsVerification: "Needs Verification",
    statusOcrProcessing: "OCR Processing",
    statusRejected: "Rejected",

    // Distributors & Ledger
    distributorsAndBalances: "Distributors & Balances",
    accountingSummary: "Accounting Summary",
    grossInvoiced: "Gross Invoiced",
    settled: "Settled",
    pendingClear: "Pending Clear",
    dualEntryVerification: "Dual-Entry Verification",
    partiallyPaid: "Partially Paid Ledger",
    fullyPaid: "Fully Settled",
    overdue: "Overdue",
    recordPayment: "Record Payment",
    allocatePayment: "Allocate Payment",
    remainingOutstanding: "Remaining Outstanding",

    // Inventory & Expiry
    batchInventory: "Batch Inventory",
    productName: "Product Name",
    batchNumber: "Batch Number",
    expiryDate: "Expiry Date",
    stockQuantity: "Stock Quantity",
    packSize: "Pack Size",
    purchasePrice: "Purchase Price",
    mrp: "MRP / Selling Price",
    adjustStock: "Adjust Stock",
    adjustmentReason: "Reason for Adjustment",
    expired: "Expired",
    expiring30: "Expiring in < 30 Days",
    expiring60: "Expiring in < 60 Days",
    expiring90: "Expiring in < 90 Days",

    // Price Anomalies
    priceDifferenceDetected: "Price Difference Detected",
    potentialPriceAnomaly: "Potential Price Anomaly",
    normalizedUnitPrice: "Normalized Unit Price",
    compareDistributors: "Compare Distributors",
    potentialExtraCost: "Potential Additional Cost",
    resolve: "Resolve / Accept",

    // Settings
    appearance: "Appearance",
    language: "Language",
    pharmacyInformation: "Pharmacy Information",
    pharmacyName: "Pharmacy Name",
    gstin: "GSTIN",
    drugLicense: "Drug License (DL)",
    address: "Address",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System / Auto",
    saveSettings: "Save Settings",
    settingsUpdated: "Pharmacy profile and preferences updated successfully."
  },

  te: {
    // Navigation
    dashboard: "డ్యాష్‌బోర్డ్",
    bills: "బిల్లులు",
    inventory: "స్టాక్ నిల్వలు",
    distributors: "పంపిణీదారులు",
    more: "మరిన్ని",
    reports: "నివేదికలు",
    settings: "సెట్టింగ్స్",
    reviewCenter: "సమీక్ష కేంద్రం",
    expiry: "గడువు ముగింపు పరిశీలన",
    priceAnomalies: "ధర వ్యత్యాసాలు",
    auditLogs: "ఆడిట్ లాగ్స్",
    logout: "లాగ్ అవుట్",

    // Header & Meta
    liveShift: "లైవ్ షిఫ్ట్ యాక్టివ్",
    clinicalAuth: "క్లినికల్ అథెంటికేషన్",
    pharmacyManagement: "ఫార్మసీ నిర్వహణ",
    notifications: "నోటిఫికేషన్లు",

    // Dashboard
    financialOverview: "ఆర్థిక అవలోకనం",
    outstanding: "చెల్లించాల్సిన బకాయి",
    purchases: "మొత్తం కొనుగోళ్లు",
    totalPaid: "చెల్లించిన మొత్తం",
    expiringSoon: "త్వరలో గడువు ముగిసేవి",
    fastDispense: "త్వరిత పంపిణీ & రసీదు",
    uploadBill: "బిల్లు అప్‌లోడ్",
    addReceipt: "చెల్లింపు రసీదు",
    addManualStock: "స్టాక్ నమోదు",
    viewLedgers: "ఖాతా వివరాలు",
    auditVerificationLog: "ఆడిట్ ధృవీకరణ లాగ్",
    balanced: "100% సరిపోయింది",
    recentActivity: "ఇటీవలి లావాదేవీలు",
    viewAll: "అన్నీ చూడండి",
    invoicesDue: "గడువు ఉన్న బిల్లులు",
    thisMonth: "ఈ నెల",
    reconciledBankUpi: "బ్యాంక్ & UPI ద్వారా చెల్లించబడినది",
    withinDays: "30–60 రోజుల్లో",

    // Login
    signIn: "ప్రవేశించండి",
    authenticating: "ధృవీకరిస్తోంది...",
    mobileOrEmail: "మొబైల్ నంబర్ లేదా ఇమెయిల్",
    password: "పాస్‌వర్డ్",
    rememberMe: "నన్ను గుర్తుంచుకో",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
    verificationRequired: "ధృవీకరణ అవసరం",
    loginErrorDesc: "దయచేసి సరైన సిబ్బంది వివరాలను నమోదు చేయండి.",
    dayShiftAudit: "డే షిఫ్ట్ ఆడిట్ ప్రోటోకాల్",
    staffScheduleSync: "సిబ్బంది పిన్ మరియు షెడ్యూల్ సమన్వయం ప్రారంభించబడింది",
    securityNotice: "అధీకృత ఫార్మసీ సిబ్బంది మరియు యజమానికి మాత్రమే ప్రవేశం. ఔషధ & సౌందర్య సాధనాల చట్టం ప్రకారం పర్యవేక్షించబడుతుంది.",

    // Bills & OCR
    purchaseBillsAndInvoices: "కొనుగోలు బిల్లులు & ఇన్వాయిస్‌లు",
    uploadScanBill: "బిల్లు అప్‌లోడ్ / స్కాన్ చేయండి",
    invoiceMetadata: "ఇన్వాయిస్ వివరాలు",
    billNumber: "బిల్లు నంబర్",
    billDate: "బిల్లు తేదీ",
    distributor: "పంపిణీదారుడు",
    extractedLineItems: "గుర్తించబడిన ఔషధాల జాబితా",
    addItem: "మందును జోడించండి",
    takePhoto: "ఫోటో తీయండి",
    uploadGallery: "గ్యాలరీ నుండి ఎంచుకోండి",
    ocrConfidence: "OCR ఖచ్చితత్వం",
    itemsExtracted: "మందులు గుర్తించబడ్డాయి",
    subtotal: "సబ్‌టోటల్",
    taxableValue: "పన్ను విధించదగిన విలువ",
    gst: "జీఎస్టీ",
    grandTotal: "మొత్తం చెల్లింపు",
    saveBillToInventory: "స్టాక్‌లోకి భద్రపరచండి",
    rejectRescan: "తిరస్కరించు / మళ్లీ స్కాన్ చేయి",
    totalMismatch: "మొత్తంలో వ్యత్యాసం గుర్తించబడింది",
    totalMismatchDesc: "లైన్ ఐటెమ్‌ల మొత్తం ఇన్వాయిస్ గ్రాండ్ టోటల్‌తో సరిపోలడం లేదు. భద్రపరచడానికి ముందు ధృవీకరించండి.",
    duplicateBillWarning: "డూప్లికేట్ బిల్లు హెచ్చరిక",
    duplicateBillDesc: "ఈ ఇన్వాయిస్ నంబర్‌తో ఈ పంపిణీదారునికి ఇప్పటికే ఒక బిల్లు ఉంది.",
    statusVerified: "ధృవీకరించబడింది",
    statusNeedsVerification: "ధృవీకరణ అవసరం",
    statusOcrProcessing: "OCR ప్రాసెసింగ్",
    statusRejected: "తిరస్కరించబడింది",

    // Distributors & Ledger
    distributorsAndBalances: "పంపిణీదారులు & బకాయిలు",
    accountingSummary: "ఖాతా సారాంశం",
    grossInvoiced: "మొత్తం ఇన్వాయిస్",
    settled: "చెల్లించిన మొత్తం",
    pendingClear: "పెండింగ్ బకాయి",
    dualEntryVerification: "ద్విముఖ నమోదు ధృవీకరణ",
    partiallyPaid: "పాక్షికంగా చెల్లించబడింది",
    fullyPaid: "పూర్తిగా చెల్లించబడింది",
    overdue: "గడువు మించినది",
    recordPayment: "చెల్లింపు నమోదు చేయండి",
    allocatePayment: "చెల్లింపును కేటాయించండి",
    remainingOutstanding: "మిగిలిన బకాయి",

    // Inventory & Expiry
    batchInventory: "బ్యాచ్ వారీ స్టాక్ నిల్వలు",
    productName: "ఔషధం పేరు",
    batchNumber: "బ్యాచ్ నంబర్",
    expiryDate: "గడువు తేదీ",
    stockQuantity: "నిల్వ పరిమాణం",
    packSize: "ప్యాక్ సైజు",
    purchasePrice: "కొనుగోలు ధర",
    mrp: "MRP / అమ్మకపు ధర",
    adjustStock: "స్టాక్ సర్దుబాటు చేయండి",
    adjustmentReason: "సర్దుబాటుకు కారణం",
    expired: "గడువు ముగిసినవి",
    expiring30: "< 30 రోజుల్లో గడువు ముగిసేవి",
    expiring60: "< 60 రోజుల్లో గడువు ముగిసేవి",
    expiring90: "< 90 రోజుల్లో గడువు ముగిసేవి",

    // Price Anomalies
    priceDifferenceDetected: "ధర వ్యత్యాసం గుర్తించబడింది",
    potentialPriceAnomaly: "ధర హెచ్చుతగ్గుల అవకాశం",
    normalizedUnitPrice: "యూనిట్ ధర సరిపోలిక",
    compareDistributors: "పంపిణీదారుల ధరల పోలిక",
    potentialExtraCost: "అదనపు వ్యయం అంచనా",
    resolve: "ఆమోదించండి / పరిష్కరించండి",

    // Settings
    appearance: "థీమ్ ప్రాధాన్యత",
    language: "భాష",
    pharmacyInformation: "ఫార్మసీ వివరాలు",
    pharmacyName: "ఫార్మసీ పేరు",
    gstin: "జీఎస్టీ నంబర్",
    drugLicense: "డ్రగ్ లైసెన్స్ (DL)",
    address: "చిరునామా",
    phoneNumber: "ఫోన్ నంబర్",
    emailAddress: "ఇమెయిల్ చిరునామా",
    themeLight: "వెలుతురు మోడ్",
    themeDark: "రాత్రి మోడ్ (డార్క్)",
    themeSystem: "ఆటో / సిస్టమ్",
    saveSettings: "మార్పులను సేవ్ చేయండి",
    settingsUpdated: "ఫార్మసీ వివరాలు విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి."
  }
};

let currentLanguage = typeof localStorage !== 'undefined' ? (localStorage.getItem('medi_lang') || 'en') : 'en';
const listeners = new Set();

export const i18n = {
  get lang() {
    return currentLanguage;
  },
  
  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'te') return;
    currentLanguage = lang;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('medi_lang', lang);
    }
    listeners.forEach(fn => fn(currentLanguage));
  },
  
  t(key, fallback = '') {
    return translations[currentLanguage]?.[key] || translations['en']?.[key] || fallback || key;
  },
  
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};
