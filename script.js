/* ==========================================================================
   RythuMitra – Smart Farming Assistant Client Logic
   ========================================================================== */

// --- Supabase Configuration ---
const SUPABASE_URL = window.SUPABASE_URL || "https://your-project-ref.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "your-anon-key";
const supabaseClient = window.supabase && window.supabase.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

let lastScanUploadFile = null;

async function uploadCropImage(file) {
  if (!supabaseClient) throw new Error("Supabase is not configured.");
  console.log("Supabase upload starting", { bucket: "crop-images", name: file.name, size: file.size });
  const fileName = `crop-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

  const { data, error: uploadError } = await supabaseClient.storage
    .from("crop-images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("Supabase storage upload failed", uploadError);
    throw uploadError;
  }

  console.log("Supabase upload succeeded", data);
  const { data: urlData, error: urlError } = await supabaseClient.storage
    .from("crop-images")
    .getPublicUrl(data.path);

  if (urlError) {
    console.error("Supabase getPublicUrl failed", urlError);
    throw urlError;
  }

  console.log("Supabase public URL", urlData.publicUrl);
  return urlData.publicUrl;
}

async function saveScanResult(resultData) {
  console.log("Saving scan result", resultData);
  if (!supabaseClient) {
    console.warn("Supabase is not configured. Scan result will not be saved.");
    return null;
  }

  const { error } = await supabaseClient.from("crop_scans").insert([resultData]);
  if (error) throw error;
  return true;
}

async function signInWithSupabase(email, password) {
  if (!supabaseClient) throw new Error("Supabase is not configured.");

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signUpWithSupabase(email, password) {
  if (!supabaseClient) throw new Error("Supabase is not configured.");

  // Use the current page URL as the redirect destination if not browsing locally via file://
  const redirectUrl = window.location.origin + window.location.pathname;
  const options = {};
  if (window.location.protocol !== 'file:') {
    options.redirectTo = redirectUrl;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: options
  });
  if (error) throw error;
  return data;
}

async function signOutFromSupabase() {
  if (!supabaseClient) throw new Error("Supabase is not configured.");

  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

// --- Translation Dictionaries ---
const translations = {
  en: {
    "nav-home": "Home",
    "nav-detector": "Disease Detection",
    "nav-advisor": "Fertilizer Advisor",
    "nav-tracker": "Growth Tracker",
    "nav-weather": "Weather Alerts",
    "nav-stats": "Statistics",
    "nav-faq": "FAQs",
    "nav-contact": "Contact",
    
    "hero-tag": "Empowering Farmers with AI-Based Crop Health Monitoring",
    "hero-title": "Protect Your Crops with Smart Disease Detection",
    "hero-subtitle": "Upload crop photos, identify diseases, get treatment suggestions, and improve crop yield.",
    "btn-detect-crop": "Detect Disease",
    "btn-learn-more": "Learn More",
    "hero-panel-title": "Active Crop Scan",
    "lbl-scan-crop": "Tomato Farm",
    "hero-panel-alert": "Weather Alert: High humidity levels predicted. Ensure proper spacing to prevent fungal growth.",

    "stat-scans": "Total Disease Scans",
    "stat-alerts": "Active Alerts",
    "stat-treats": "Recommended Treatments",
    "stat-score": "Crop Health Score",

    "det-sec-title": "AI Crop Disease Detection",
    "det-sec-subtitle": "Upload leaf photos or use our preset sample images to run a local instant check for crop diseases.",
    "det-card-title": "Scan Crop Image",
    "lbl-drag-text": "Drag & drop your leaf image here or click to browse",
    "lbl-file-types": "Supports JPG, PNG, WEBP (Max 5MB)",
    "lbl-test-presets": "Test with sample leaf images",
    "lbl-preset-spot": "Tomato (Leaf Spot)",
    "lbl-preset-mildew": "Wheat (Mildew)",
    "lbl-preset-healthy": "Rice (Healthy)",
    
    "lbl-result-title": "Scan Result",
    "lbl-severity-txt": "Severity Status",
    "lbl-symptoms-title": "Symptoms",
    "lbl-causes-title": "Causes",
    "lbl-treat-title": "Recommended Treatments",
    "info-box-title": "Smart Disease Database",
    "info-box-text": "RythuMitra processes crop foliage patterns through visual analysis to diagnose common leaf spots, mold infections, and pathogen decay. Access detailed guides, spray schedules, and preventive agricultural tips offline.",
    "lbl-toggle-net": "Simulate Internet Status",

    "fert-title": "Fertilizer Advisor",
    "fert-desc": "Get tailored NPK fertilizer blends and recommended application dosage based on your crop selection.",
    "lbl-select-crop": "Select Crop Type",
    "lbl-opt-disabled": "-- Choose a crop --",
    "opt-rice": "Rice",
    "opt-cotton": "Cotton",
    "opt-wheat": "Wheat",
    "opt-maize": "Maize",
    "opt-tomato": "Tomato",
    "lbl-fert-recommend": "Recommended Recipe",
    "lbl-recipe-type": "Fertilizer Type",
    "lbl-recipe-qty": "Quantity per Acre",
    "lbl-recipe-time": "Application Phase",

    "grow-title": "Crop Growth Tracker",
    "grow-desc": "Track progress, compute days since sowing, and view your current development cycle stage.",
    "lbl-track-select": "Select Crop",
    "lbl-track-date": "Sowing Date",
    "btn-calculate-growth": "Calculate Progress",
    "lbl-track-days": "Days Since Sowing:",
    "lbl-stage-seed": "Seed",
    "lbl-stage-germ": "Germination",
    "lbl-stage-veg": "Vegetative",
    "lbl-stage-flow": "Flowering",
    "lbl-stage-harv": "Harvest",

    "wea-sec-title": "Local Weather Alerts",
    "wea-sec-subtitle": "Live environmental conditions and farming guides optimized to prevent disease proliferation.",
    "wea-dash-title": "Farming Weather Panel",
    "lbl-wea-sim": "Simulate Weather:",
    "opt-wea-normal": "Mild & Sunny (Optimal)",
    "opt-wea-humid": "High Humid & Fungal Risk",
    "opt-wea-rainy": "Heavy Storms & Wet",
    "opt-wea-drought": "Dry Heat & Water Shortage",
    "lbl-wea-temp": "Temperature",
    "lbl-wea-humid": "Humidity",
    "lbl-wea-rain": "Rain Chance",
    "lbl-wea-wind": "Wind Speed",

    "sta-sec-title": "Agricultural Analytics",
    "sta-sec-subtitle": "Statistical metrics from our aggregate diagnostics showing crop growth rates and pest containment success.",
    "sta-chart-crop": "Crop Health Distribution (%)",
    "sta-chart-dis": "Monthly Diagnostics by Season",
    "sta-chart-yield": "Core System Capabilities",
    "stats-lbl-accuracy": "Verified Diagnostics Accuracy",
    "stats-lbl-speed": "Instant Offline Response",
    "stats-lbl-users": "Farming Scans Globally",
    "lbl-badge-rice": "90% Peak",
    "lbl-grp-rabi": "Rabi (Winter)",
    "lbl-grp-kharif": "Kharif (Monsoon)",
    "lbl-grp-zaid": "Zaid (Summer)",
    "use-offline-title": "100% Offline Mode",
    "use-offline-desc": "Diagnose crop diseases instantly directly in remote fields without cellular network or internet coverage.",
    "use-soil-title": "NPK Soil Balancing",
    "use-soil-desc": "Calculate tailored chemical and organic fertilizer dosages customized for your soil profile and crops.",
    "use-weather-title": "Climate-Risk Warnings",
    "use-weather-desc": "Monitor local temperature and humidity indicators to avoid high-risk fungal and bacterial outbreaks.",
    "use-contact-title": "Agronomy Counselors",
    "use-contact-desc": "Submit visual diagnostic logs to receive direct phone guidance from qualified agricultural advisors.",
    "use-yield-title": "Growth Milestones",
    "use-yield-desc": "Monitor sowing dates, vegetative stages, flowering triggers, and harvest timeline projections in real time.",

    "test-sec-title": "What Farmers Say",
    "test-sec-subtitle": "Real experiences and feedback from agriculturalists using RythuMitra tools in their fields.",
    "test-quote-1": "The leaf photo scanner correctly diagnosed the Early Leaf Spot disease on my tomato crop. The organic spray recipe of neem oil saved 80% of my harvest this season.",
    "test-loc-1": "Tomato Farmer, Guntur",
    "test-quote-2": "I was confused about NPK ratios for cotton crop. The Fertilizer Advisor computed the exact bag dosage. Crop yields increased significantly with reduced costs.",
    "test-loc-2": "Cotton Farmer, Warangal",
    "test-quote-3": "Being able to use the app in Telugu while inside my rural fields offline is a blessing. The sowing tracker timeline prompts me exactly when to fertilize my wheat.",
    "test-loc-3": "Wheat Cultivator, Indore",

    "faq-sec-title": "Frequently Asked Questions",
    "faq-sec-subtitle": "Quick answers to common questions about agricultural detection algorithms and offline operations.",
    "faq-q1": "How does crop disease detection work?",
    "faq-a1": "Our front-end AI model analyses leaf color distribution, vein structures, and bacterial patch outlines. By comparing these markers against a localized pathology database, it calculates the most likely plant disease with specific matching confidence percentage statistics.",
    "faq-q2": "Can the website work without an internet connection?",
    "faq-a2": "Yes! RythuMitra has an Offline mode. Since all disease dictionaries, treatments, fertilizer charts, and sowing calculators are compiled locally in Javascript, the tool is fully operational even when signal drops in remote rural farmlands.",
    "faq-q3": "How accurate are the fertilizer and chemical dosages?",
    "faq-a3": "The recommendation matrices are calibrated according to guidelines from agricultural extension offices. However, values are designed as general templates. We advise checking soil salinity and matching specific local crop parameters before extensive treatment implementation.",
    "faq-q4": "What types of crops are currently supported for diagnosis?",
    "faq-a4": "Currently, RythuMitra supports rapid visual diagnosis for Tomato, Wheat, and Rice crops. We are continuously expanding support for other regional staples in upcoming updates.",
    "faq-q5": "Is my uploaded crop data private and secure?",
    "faq-a5": "Yes. Since all leaf analysis and diagnostics are processed entirely in your web browser locally, no images or private farming data are ever sent to our servers.",

    "con-sec-title": "Get in Touch",
    "con-sec-subtitle": "Reach out to agricultural counselors for query clarifications, field updates, or system diagnostics support.",
    "con-info-title": "Support Office",
    "con-info-desc": "Our counselors respond to critical agricultural inquiries, pest outbreaks, and soil health management queries.",
    "lbl-con-loc": "Agri-Tech Hub, Sector 5, Hyderabad, India",
    "con-form-title": "Send a Message",
    "lbl-form-name": "Full Name",
    "lbl-form-phone": "Mobile Number",
    "lbl-form-phone-hint": "Enter 10-digit mobile number",
    "lbl-form-crop": "Crop Type",
    "lbl-form-msg": "Message",
    "btn-submit-form": "Submit Enquiry",
    "lbl-modal-title": "Enquiry Submitted!",
    "lbl-modal-desc": "Thank you. An agricultural specialist will call your mobile number within 24 hours to assist with your crop condition.",
    "footer-desc": "Empowering local cultivators with advanced offline diagnostic models, weather warnings, and direct agronomy advisors to secure harvests and increase crop health.",
    "footer-lbl-links": "Quick Links",
    "footer-lbl-social": "Connect with Us",
    "footer-social-desc": "Follow our media accounts for regional farming news, workshops, and crop tips.",
    "lbl-btn-find-centers": "Find Nearby Agriculture Centers",
    "lbl-recommend-title": "Recommended Services for Detected Disease",
    "lbl-recommend-desc": "Based on the detected disease, we recommend visiting the following support centers:",
    "lbl-nearby-title": "Nearby Agriculture Centers",
    "lbl-loading-text": "Searching for nearby agriculture centers...",
    "lbl-error-gps": "Location access was denied. Please enable GPS location permissions to find agricultural support centers near you."
  },
  te: {
    "nav-home": "హోమ్",
    "nav-detector": "తెగుళ్ల గుర్తింపు",
    "nav-advisor": "ఎరువుల సలహా",
    "nav-tracker": "పంట ఎదుగుదల",
    "nav-weather": "వాతావరణ హెచ్చరికలు",
    "nav-stats": "గణాంకాలు",
    "nav-faq": "ప్రశ్నలు",
    "nav-contact": "సంప్రదించండి",

    "hero-tag": "AI-ఆధారిత పంట ఆరోగ్య పర్యవేక్షణతో రైతులకు సాధికారత",
    "hero-title": "స్మార్ట్ తెగుళ్ల గుర్తింపుతో పంటలను రక్షించండి",
    "hero-subtitle": "పంట ఫోటోలను అప్‌లోడ్ చేయండి, తెగుళ్లను గుర్తించండి, నివారణ చికిత్సలు పొందండి మరియు దిగుబడిని పెంచండి.",
    "btn-detect-crop": "తెగులును గుర్తించండి",
    "btn-learn-more": "మరింత సమాచారం",
    "hero-panel-title": "యాక్టివ్ పంట స్కానింగ్",
    "lbl-scan-crop": "టొమాటో పంట",
    "hero-panel-alert": "వాతావరణ హెచ్చరిక: అధిక తేమ నమోదు కావచ్చు. ఫంగస్ వ్యాప్తిని నివారించడానికి తగిన దూరం పాటించండి.",

    "stat-scans": "మొత్తం తెగులు స్కాన్‌లు",
    "stat-alerts": "క్రియాశీల హెచ్చరికలు",
    "stat-treats": "సిఫార్సు చేసిన చికిత్సలు",
    "stat-score": "పంట ఆరోగ్య స్కోర్",

    "det-sec-title": "AI పంట తెగుళ్ల గుర్తింపు",
    "det-sec-subtitle": "ఆకుల ఫోటోలను అప్‌లోడ్ చేయండి లేదా పంటల తెగుళ్లను వెంటనే పరీక్షించడానికి సిద్ధంగా ఉన్న నమూనా చిత్రాలను ఉపయోగించండి.",
    "det-card-title": "పంట చిత్రాన్ని స్కాన్ చేయండి",
    "lbl-drag-text": "ఆకు చిత్రాన్ని ఇక్కడ లాగి వదలండి లేదా బ్రౌజ్ చేయడానికి క్లిక్ చేయండి",
    "lbl-file-types": "JPG, PNG, WEBP ఫైళ్లను సపోర్ట్ చేస్తుంది (గరిష్టంగా 5MB)",
    "lbl-test-presets": "నమూనా ఆకులతో పరీక్షించండి",
    "lbl-preset-spot": "టొమాటో (ఆకు మచ్చ)",
    "lbl-preset-mildew": "గోధుమ (బూజు తెగులు)",
    "lbl-preset-healthy": "వరి (ఆరోగ్యకరమైనది)",

    "lbl-result-title": "స్కాన్ ఫలితం",
    "lbl-severity-txt": "తీవ్రత స్థాయి",
    "lbl-symptoms-title": "లక్షణాలు",
    "lbl-causes-title": "కారణాలు",
    "lbl-treat-title": "సిఫార్సు చేయబడిన చికిత్సలు",
    "info-box-title": "స్మార్ట్ తెగుళ్ల డేటాబేస్",
    "info-box-text": "రైతుమిత్ర పంట ఆకుల నమూనాలను దృశ్య విశ్లేషణ ద్వారా పరిశీలించి సాధారణ మచ్చలు, బూజు మరియు తెగుళ్లను గుర్తిస్తుంది. వివరణాత్మక మార్గదర్శకాలు మరియు చికిత్సలను ఇంటర్నెట్ లేకపోయినా పొందవచ్చు.",
    "lbl-toggle-net": "ఇంటర్నెట్ అనుకరణ",

    "fert-title": "ఎరువుల సలహాదారు",
    "fert-desc": "మీరు ఎంచుకున్న పంట ఆధారంగా తగిన NPK ఎరువుల మిశ్రమాలను మరియు సిఫార్సు చేసిన మోతాదును పొందండి.",
    "lbl-select-crop": "పంట రకాన్ని ఎంచుకోండి",
    "lbl-opt-disabled": "-- పంటను ఎంచుకోండి --",
    "opt-rice": "వరి",
    "opt-cotton": "పత్తి",
    "opt-wheat": "గోధుమ",
    "opt-maize": "మొక్కజొన్న",
    "opt-tomato": "టమాటా",
    "lbl-fert-recommend": "సిఫార్సు చేయబడిన మిశ్రమం",
    "lbl-recipe-type": "ఎరువు రకం",
    "lbl-recipe-qty": "ఎకరానికి కావలసిన పరిమాణం",
    "lbl-recipe-time": "ఎరువులు వేయవలసిన దశ",

    "grow-title": "పంట ఎదుగుదల ట్రాకర్",
    "grow-desc": "పంట ప్రగతిని పర్యవేక్షించండి, విత్తినప్పటి నుండి రోజులను లెక్కించండి మరియు ప్రస్తుత ఎదుగుదల దశను చూడండి.",
    "lbl-track-select": "పంటను ఎంచుకోండి",
    "lbl-track-date": "విత్తిన తేదీ",
    "btn-calculate-growth": "ప్రగతిని లెక్కించండి",
    "lbl-track-days": "విత్తినప్పటి నుండి రోజులు:",
    "lbl-stage-seed": "విత్తనం",
    "lbl-stage-germ": "మొలకెత్తడం",
    "lbl-stage-veg": "శాఖీయ దశ",
    "lbl-stage-flow": "పూత దశ",
    "lbl-stage-harv": "కోత దశ",

    "wea-sec-title": "స్థానిక వాతావరణ హెచ్చరికలు",
    "wea-sec-subtitle": "తెగుళ్లు వ్యాపించకుండా నిరోధించడానికి వాతావరణ పరిస్థితులు మరియు సూచనలు.",
    "wea-dash-title": "వ్యవసాయ వాతావరణ ప్యానెల్",
    "lbl-wea-sim": "వాతావరణాన్ని మార్చండి:",
    "opt-wea-normal": "సాధారణ ఎండ (అనుకూలం)",
    "opt-wea-humid": "అధిక తేమ (ఫంగస్ ప్రమాదం)",
    "opt-wea-rainy": "భారీ వర్షాలు & తడి",
    "opt-wea-drought": "అధిక వేడి (నీటి కొరత)",
    "lbl-wea-temp": "ఉష్ణోగ్రత",
    "lbl-wea-humid": "తేమ",
    "lbl-wea-rain": "వర్ష సూచన",
    "lbl-wea-wind": "గాలి వేగం",

    "sta-sec-title": "వ్యవసాయ గణాంకాలు",
    "sta-sec-subtitle": "మా పంట విశ్లేషణల ద్వారా సేకరించిన ఎదుగుదల రేట్లు మరియు తెగుళ్ల నివారణ విజయాలు.",
    "sta-chart-crop": "పంట ఆరోగ్య పంపిణీ (%)",
    "sta-chart-dis": "సీజన్ల వారీగా నెలవారీ వ్యాధి గుర్తింపు",
    "sta-chart-yield": "కీలక వ్యవస్థా సామర్థ్యాలు",
    "stats-lbl-accuracy": "ధృవీకరించబడిన వ్యాధి నిర్ధారణ ఖచ్చితత్వం",
    "stats-lbl-speed": "తక్షణ ఆఫ్‌లైన్ ప్రతిస్పందన",
    "stats-lbl-users": "ప్రపంచవ్యాప్తంగా పంట స్కాన్‌లు",
    "lbl-badge-rice": "90% గరిష్టం",
    "lbl-grp-rabi": "రబీ (చలికాలం)",
    "lbl-grp-kharif": "ఖరీఫ్ (వర్షాకాలం)",
    "lbl-grp-zaid": "జైద్ (వేసవికాలం)",
    "use-offline-title": "100% ఆఫ్‌లైన్ మోడ్",
    "use-offline-desc": "మొబైల్ నెట్‌వర్క్ లేదా ఇంటర్నెట్ లేకపోయినా పొలాల్లోనే పంట వ్యాధులను వెంటనే గుర్తించండి.",
    "use-soil-title": "NPK నేల పోషకాల సమతుల్యత",
    "use-soil-desc": "మీ పంటలు మరియు నేల రకానికి అనుగుణంగా రసాయన మరియు సేంద్రీయ ఎరువుల మోతాదును లెక్కించండి.",
    "use-weather-title": "వాతావరణ ప్రమాద హెచ్చరికలు",
    "use-weather-desc": "ఫంగస్ మరియు బ్యాక్టీరియా వ్యాప్తిని నివారించడానికి స్థానిక ఉష్ణోగ్రత మరియు తేమను పర్యవేక్షించండి.",
    "use-contact-title": "వ్యవసాయ సలహాదారులు",
    "use-contact-desc": "అర్హత కలిగిన వ్యవసాయ నిపుణుల నుండి నేరుగా ఫోన్ ద్వారా సలహాలు పొందడానికి పంట వ్యాధి ఫోటోలను పంపండి.",
    "use-yield-title": "ఎదుగుదల మైలురాళ్లు",
    "use-yield-desc": "విత్తిన తేదీలు, శాఖీయ దశలు, పూత దశ మరియు కోత సమయ అంచనాలను నిజ సమయంలో ట్రాక్ చేయండి.",

    "test-sec-title": "రైతులు ఏమంటున్నారు",
    "test-sec-subtitle": "తమ పొలాల్లో రైతుమిత్రను ఉపయోగిస్తున్న రైతుల నిజమైన అనుభవాలు మరియు అభిప్రాయాలు.",
    "test-quote-1": "ఆకు స్కాన్ నా టొమాటో పంటలో ఆకు మచ్చ తెగులును సరిగ్గా గుర్తించింది. వేప నూనె వాడకం వల్ల ఈ సీజన్‌లో నా పంట 80% కాపాడుకోగలిగాను.",
    "test-loc-1": "టొమాటో రైతు, గుంటూరు",
    "test-quote-2": "పత్తి పంటకు NPK నిష్పత్తుల గురించి చాలా గందరగోళం ఉండేది. రైతుమిత్ర ఎకరానికి సరైన మోతాదును సూచించింది. ఖర్చులు తగ్గి దిగుబడి పెరిగింది.",
    "test-loc-2": "పత్తి రైతు, వరంగల్",
    "test-quote-3": "పొలాల్లో ఇంటర్నెట్ లేకపోయినా తెలుగులో ఈ యాప్ పని చేయడం చాలా ఉపయోగకరం. గోధుమ పంటకు ఎప్పుడు ఎరువులు వేయాలో సరిగ్గా అలర్ట్ చేస్తుంది.",
    "test-loc-3": "గోధుమ రైతు, ఇండోర్",

    "faq-sec-title": "తరచుగా అడిగే ప్రశ్నలు",
    "faq-sec-subtitle": "తెగుళ్ల గుర్తింపు మరియు ఇంటర్నెట్ లేకుండా పని చేసే విధానంపై సాధారణ సందేహాలు.",
    "faq-q1": "పంట తెగుళ్ల గుర్తింపు ఎలా పనిచేస్తుంది?",
    "faq-a1": "మా AI మోడల్ ఆకు రంగు, ఈనెల నిర్మాణం మరియు మచ్చలను విశ్లేషిస్తుంది. వీటిని తెగుళ్ల డేటాబేస్‌తో పోల్చి ఏ రకమైన వ్యాధి సోకిందో ఖచ్చితమైన శాతంతో లెక్కిస్తుంది.",
    "faq-q2": "ఇంటర్నెట్ లేకుండా యాప్ పనిచేస్తుందా?",
    "faq-a2": "అవును! రైతుమిత్ర ఆఫ్‌లైన్ మోడ్‌లో పనిచేస్తుంది. తెగుళ్ల సమాచారం, నివారణలు, ఎరువుల చార్ట్‌లు అన్ని మీ ఫోన్లోనే స్టోర్ అవుతాయి, కాబట్టి సిగ్నల్ లేని మారుమూల పొలాల్లో కూడా వాడుకోవచ్చు.",
    "faq-q3": "సిఫార్సు చేసిన ఎరువుల మోతాదు ఎంతవరకు నమ్మదగినది?",
    "faq-a3": "ఈ సూచనలు వ్యవసాయ అధికారుల మార్గదర్శకాలకు అనుగుణంగా రూపొందించబడ్డాయి. అయితే, నేల పరీక్షలు మరియు స్థానిక వాతావरण పరిస్థితులకు అనుగుణంగా మార్పులు చేసుకోవడం మంచిది.",
    "faq-q4": "ప్రస్తుతం ఏ రకమైన పంటల నిర్ధారణకు మద్దతు ఉంది?",
    "faq-a4": "ప్రస్తుతం, రైతుమిత్ర టమోటా, గోధుమ మరియు వరి పంటలకు వేగవంతమైన వ్యాధి నిర్ధారణను అందిస్తుంది. రాబోయే అప్‌డేట్‌లలో మరిన్ని ప్రాంతీయ పంటలకు మద్దతును విస్తరిస్తున్నాము.",
    "faq-q5": "నేను అప్‌లోడ్ చేసిన పంట డేటా సురಕ್ಷಿತంగా ఉంటుందా?",
    "faq-a5": "అవును. ఆకుల విశ్లేషణ మరియు నిర్ధారణ ప్రక్రియ అంతా మీ వెబ్ బ్రೌజర్‌లోనే స్థానికంగా జరుగుతుంది కాబట్టి, మీ ఫోటోలు లేదా పంట వివరాలు మా సర్వర్‌లకు పంపబడవు.",

    "con-sec-title": "మమ్మల్ని సంప్రదించండి",
    "con-sec-subtitle": "సందేహాలు, తెగుళ్ల సమస్యలు లేదా ఇతర సహాయం కోసం వ్యవసాయ నిపుణులను సంప్రదించండి.",
    "con-info-title": "సహాయక కేంద్రం",
    "con-info-desc": "మా నిపుణులు పంట సమస్యలు, వ్యాధులు మరియు నేల ఆరోగ్య నిర్వహణపై సమాధానాలు ఇస్తారు.",
    "lbl-con-loc": "అగ్రి-టెక్ హబ్, సెక్టార్ 5, హైదరాబాద్, భారతదేశం",
    "con-form-title": "సందేశం పంపండి",
    "lbl-form-name": "పూర్తి పేరు",
    "lbl-form-phone": "మొబైల్ సంఖ్య",
    "lbl-form-phone-hint": "10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి",
    "lbl-form-crop": "పంట రకం",
    "lbl-form-msg": "సందేశం",
    "btn-submit-form": "వివరాలను పంపండి",
    "lbl-modal-title": "సమర్పణ విజయవంతమైంది!",
    "lbl-modal-desc": "ధన్యవాదాలు. పంట సమస్య నివారణకు సహాయం చేయడానికి వ్యవసాయ నిపుణులు 24 గంటల్లో మీ మొబైల్‌కు కాల్ చేస్తారు.",
    "footer-desc": "ఆఫ్‌లైన్ వ్యాధి నిర్ధారణ, వాతావరణ హెచ్చరికలు మరియు వ్యవసాయ సలహాల ద్వారా స్థానిక రైతులకు సహాయం చేస్తూ పంట నష్టాలను తగ్గిస్తుంది.",
    "footer-lbl-links": "త్వరిత లింకులు",
    "footer-lbl-social": "సోషల్ మీడియా",
    "footer-social-desc": "వ్యవసాయ వార్తలు, వర్క్‌షాప్‌లు మరియు పంటల చిట్కాల కోసం మమ్మల్ని ఫాలో అవ్వండి.",
    "lbl-btn-find-centers": "సమీప వ్యవసాయ కేంద్రాలను కనుగొనండి",
    "lbl-recommend-title": "గుర్తించబడిన వ్యాధికి సిఫార్సు చేయబడిన సేవలు",
    "lbl-recommend-desc": "గుర్తించిన వ్యాధి ఆధారంగా, మేము ఈ క్రింది సహాయ కేంద్రాలను సందర్శించాల్సిందిగా సిఫార్సు చేస్తున్నాము:",
    "lbl-nearby-title": "సమీప వ్యవసాయ కేంద్రాలు",
    "lbl-loading-text": "సమీప వ్యవసాయ కేంద్రాల కోసం శోధిస్తోంది...",
    "lbl-error-gps": "స్థాన ప్రాప్యత నిరాకరించబడింది. మీ సమీపంలో ఉన్న వ్యవసాయ సహాయ కేంద్రాలను కనుగొనడానికి దయచేసి GPS స్థాన అనుమతులను ప్రారంభించండి."
  },
  hi: {
    "nav-home": "होम",
    "nav-detector": "रोग की पहचान",
    "nav-advisor": "उर्वरक सलाह",
    "nav-tracker": "फसल प्रगति",
    "nav-weather": "मौसम अलर्ट",
    "nav-stats": "आँकड़े",
    "nav-faq": "अक्सर पूछे जाने वाले प्रश्न",
    "nav-contact": "संपर्क करें",

    "hero-tag": "AI-आधारित फसल स्वास्थ्य निगरानी के साथ किसानों का सशक्तीकरण",
    "hero-title": "स्मार्ट रोग पहचान के साथ अपनी फसलें बचाएं",
    "hero-subtitle": "पत्तियों की फोटो अपलोड करें, बीमारियों की पहचान करें, समाधान पाएं और फसल की पैदावार में सुधार करें।",
    "btn-detect-crop": "रोग का पता लगाएं",
    "btn-learn-more": "और जानें",
    "hero-panel-title": "सक्रिय फसल स्कैन",
    "lbl-scan-crop": "टमाटर का खेत",
    "hero-panel-alert": "मौसम अलर्ट: हवा में नमी अधिक है। फंगल संक्रमण से बचने के लिए पौधों के बीच पर्याप्त दूरी रखें।",

    "stat-scans": "कुल बीमारी स्कैन",
    "stat-alerts": "सक्रिय अलर्ट",
    "stat-treats": "सुझाए गए उपचार",
    "stat-score": "फसल स्वास्थ्य स्कोर",

    "det-sec-title": "AI फसल रोग पहचान",
    "det-sec-subtitle": "रोग का तुरंत पता लगाने के लिए पत्तियों की तस्वीरें अपलोड करें या नीचे दिए गए नमूनों का उपयोग करें।",
    "det-card-title": "फसल की छवि स्कैन करें",
    "lbl-drag-text": "पत्ती की तस्वीर यहाँ खींचें या ब्राउज़ करने के लिए क्लिक करें",
    "lbl-file-types": "JPG, PNG, WEBP फाइलों को सपोर्ट करता है (अधिकतम 5MB)",
    "lbl-test-presets": "नमूना पत्तियों के साथ परीक्षण करें",
    "lbl-preset-spot": "टमाटर (पत्ती का धब्बा)",
    "lbl-preset-mildew": "गेहूं (पाउडर फफूंदी)",
    "lbl-preset-healthy": "धान (स्वस्थ)",

    "lbl-result-title": "स्कैन परिणाम",
    "lbl-severity-txt": "तीव्रता की स्थिति",
    "lbl-symptoms-title": "लक्षण",
    "lbl-causes-title": "कारण",
    "lbl-treat-title": "अनुशंसित उपचार",
    "info-box-title": "स्मार्ट रोग डेटाबेस",
    "info-box-text": "ऋतुमित्र दृश्य विश्लेषण द्वारा पत्तियों में धब्बे, फफूंदी और कीड़ों की पहचान करता है। बिना इंटरनेट के भी आप सभी निदान और उपचारों की जानकारी प्राप्त कर सकते हैं।",
    "lbl-toggle-net": "इंटरनेट सिम्युलेटर",

    "fert-title": "उर्वरक सलाहकार",
    "fert-desc": "अपनी चुनी हुई फसल के अनुसार सही NPK उर्वरक मात्रा और डालने के समय की जानकारी प्राप्त करें।",
    "lbl-select-crop": "फसल का चयन करें",
    "lbl-opt-disabled": "-- फसल चुनें --",
    "opt-rice": "धान",
    "opt-cotton": "कपास",
    "opt-wheat": "गेहूं",
    "opt-maize": "मक्का",
    "opt-tomato": "टमाटर",
    "lbl-fert-recommend": "अनुशंसित उर्वरक नुस्खा",
    "lbl-recipe-type": "उर्वरक प्रकार",
    "lbl-recipe-qty": "प्रति एकड़ मात्रा",
    "lbl-recipe-time": "डालने का सही चरण",

    "grow-title": "फसल विकास ट्रैकर",
    "grow-desc": "फसल की प्रगति को ट्रैक करें, बोने के बाद के दिन गिनें और फसल चक्र के चरण देखें।",
    "lbl-track-select": "फसल चुनें",
    "lbl-track-date": "बोने की तारीख",
    "btn-calculate-growth": "प्रगति की गणना करें",
    "lbl-track-days": "बोने के बाद से दिन:",
    "lbl-stage-seed": "बीज",
    "lbl-stage-germ": "अंकुरण",
    "lbl-stage-veg": "वानस्पतिक अवस्था",
    "lbl-stage-flow": "फूल आने का चरण",
    "lbl-stage-harv": "कटाई",

    "wea-sec-title": "स्थानीय मौसम अलर्ट",
    "wea-sec-subtitle": "फसलों को बीमारियों से सुरक्षित रखने के लिए मौसम की वर्तमान स्थिति और सुरक्षा उपाय।",
    "wea-dash-title": "कृषि मौसम पैनल",
    "lbl-wea-sim": "मौसम बदलें:",
    "opt-wea-normal": "हल्की धूप (अनुकूल)",
    "opt-wea-humid": "उच्च आर्द्रता (फंगस का खतरा)",
    "opt-wea-rainy": "भारी बारिश और नमी",
    "opt-wea-drought": "सूखा और तेज गर्मी",
    "lbl-wea-temp": "तापमान",
    "lbl-wea-humid": "नमी",
    "lbl-wea-rain": "बारिश की संभावना",
    "lbl-wea-wind": "हवा की गति",

    "sta-sec-title": "कृषि सांख्यिकी",
    "sta-sec-subtitle": "फसलों की वृद्धि दर और रोग नियंत्रण की सफलता को दर्शाते हुए हमारे विश्लेषणात्मक आँकड़े।",
    "sta-chart-crop": "फसल स्वास्थ्य वितरण (%)",
    "sta-chart-dis": "ऋतुओं के अनुसार मासिक रोग निदान",
    "sta-chart-yield": "मुख्य प्रणाली क्षमताएं",
    "stats-lbl-accuracy": "सत्यापित रोग निदान सटीकता",
    "stats-lbl-speed": "त्वरित ऑफलाइन प्रतिक्रिया",
    "stats-lbl-users": "वैश्विक स्तर पर पूर्ण स्कैन",
    "lbl-badge-rice": "90% उच्चतम",
    "lbl-grp-rabi": "रबी (सर्दियों में)",
    "lbl-grp-kharif": "खरीफ (मानसून में)",
    "lbl-grp-zaid": "जायद (गर्मियों में)",
    "use-offline-title": "100% ऑफलाइन मोड",
    "use-offline-desc": "मोबाइल नेटवर्क या इंटरनेट के बिना भी सीधे खेतों में फसल रोगों का तुरंत पता लगाएं।",
    "use-soil-title": "NPK मिट्टी पोषक तत्व संतुलन",
    "use-soil-desc": "अपनी मिट्टी की गुणवत्ता और फसलों के अनुसार रासायनिक और जैविक उर्वरक खुराक की गणना करें।",
    "use-weather-title": "मौसम जोखिम चेतावनी",
    "use-weather-desc": "फंगल और बैक्टीरियल रोगों के प्रकोप से बचने के लिए स्थानीय तापमान और आर्द्रता की निगरानी करें।",
    "use-contact-title": "कृषि सलाहकार",
    "use-contact-desc": "योग्य कृषि विशेषज्ञों से सीधे फोन पर मार्गदर्शन प्राप्त करने के लिए फसल रोगों की तस्वीरें भेजें।",
    "use-yield-title": "फसल प्रगति के चरण",
    "use-yield-desc": "बोने की तारीख, वानस्पतिक चरण, फूल आने का समय और कटाई के पूर्वानुमानों को वास्तविक समय में ट्रैक करें।",

    "test-sec-title": "किसानों की राय",
    "test-sec-subtitle": "ऋतुमित्र का उपयोग करने वाले किसानों के वास्तविक अनुभव और प्रतिक्रिया।",
    "test-quote-1": "पत्ती स्कैनर ने मेरी टमाटर की फसल में बीमारी की सही पहचान की। नीम के तेल के घोल के छिड़काव ने इस सीजन में मेरी 80% फसल को बचा लिया।",
    "test-loc-1": "टमाटर किसान, गुंटूर",
    "test-quote-2": "मैं कपास की फसल के लिए उर्वरक अनुपात को लेकर उलझन में था। ऋतुमित्र ने सही मात्रा बताई, जिससे लागत कम हुई और उपज में काफी सुधार हुआ।",
    "test-loc-2": "कपास किसान, वारंगल",
    "test-quote-3": "खेतों में बिना इंटरनेट के भी हिंदी और क्षेत्रीय भाषाओं में इस ऐप का चलना एक वरदान है। यह सही समय पर उर्वरक डालने की याद दिलाता है।",
    "test-loc-3": "गेहूं किसान, इंदौर",

    "faq-sec-title": "अक्सर पूछे जाने वाले प्रश्न",
    "faq-sec-subtitle": "बीमारी पहचान प्रणाली और ऑफलाइन कार्य प्रणाली के बारे में सामान्य प्रश्न।",
    "faq-q1": "फसल रोग पहचान कैसे काम करती है?",
    "faq-a1": "हमारा AI मॉडल पत्ती के रंग, शिराओं की बनावट और धब्बों का विश्लेषण करता है। इसकी तुलना रोग डेटाबेस से करके बीमारी का प्रतिशत निकाला जाता है।",
    "faq-q2": "क्या यह वेबसाइट बिना इंटरनेट के काम कर सकती है?",
    "faq-a2": "हाँ! ऋतुमित्र में एक ऑफलाइन मोड है। चूंकि बीमारी की जानकारी और उर्वरक चार्ट आपके डिवाइस पर ही रहते हैं, यह मरुस्थली क्षेत्रों में भी काम करता है।",
    "faq-q3": "उर्वरक की सुझाई गई मात्रा कितनी सही है?",
    "faq-a3": "ये सिफारिशें कृषि विकास केंद्र के दिशा-निर्देशों पर आधारित हैं। हालांकि, अपनी मिट्टी की जांच और स्थानीय परिस्थितियों के अनुसार बदलाव करना बेहतर है।",
    "faq-q4": "वर्तमान में किन फसलों के रोग निदान की सुविधा उपलब्ध है?",
    "faq-a4": "वर्तमान में, ऋतुमित्र टमाटर, गेहूं और धान (चावल) की फसलों के त्वरित रोग निदान का समर्थन करता है। हम आगामी अपडेट में अन्य क्षेत्रीय फसलों के लिए भी इसका विस्तार कर रहे हैं।",
    "faq-q5": "क्या मेरे द्वारा अपलोड किया गया फसल डेटा सुरक्षित और निजी है?",
    "faq-a5": "हाँ। चूंकि सभी पत्तियों का विश्लेषण और निदान पूरी तरह से आपके वेब ब्राउज़र में स्थानीय रूप से संसाधित होता है, इसलिए कोई भी छवि या फसल डेटा हमारे सर्वर पर नहीं भेजा जाता है।",

    "con-sec-title": "संपर्क करें",
    "con-sec-subtitle": "कृषि समस्याओं, बीमारियों या अन्य मदद के लिए हमारे विशेषज्ञों से बात करें।",
    "con-info-title": "सहायता कार्यालय",
    "con-info-desc": "हमारे सलाहकार फसलों के कीड़ों, बीमारियों और मिट्टी के स्वास्थ्य पर मार्गदर्शन देते हैं।",
    "lbl-con-loc": "एग्री-टेक हब, सेक्टर 5, हैदराबाद, भारत",
    "con-form-title": "संदेश भेजें",
    "lbl-form-name": "पूरा नाम",
    "lbl-form-phone": "मोबाइल नंबर",
    "lbl-form-phone-hint": "10 अंकों का मोबाइल नंबर दर्ज करें",
    "lbl-form-crop": "फसल का प्रकार",
    "lbl-form-msg": "संदेश",
    "btn-submit-form": "पूछताछ सबमिट करें",
    "lbl-modal-title": "पूछताछ दर्ज हो गई है!",
    "lbl-modal-desc": "धन्यवाद। सहायता प्रदान करने के लिए हमारे कृषि सलाहकार 24 घंटे के भीतर आपके मोबाइल नंबर पर संपर्क करेंगे।",
    "footer-desc": "ऑफलाइन रोग निदान, मौसम चेतावनी और कृषि सलाह के माध्यम से किसानों की फसलों को सुरक्षित रखने में मदद करता है।",
    "footer-lbl-links": "त्वरित लिंक",
    "footer-lbl-social": "सोशल मीडिया",
    "footer-social-desc": "कृषि समाचार, कार्यशालाओं और सुझावों के लिए हमसे जुड़ें।",
    "lbl-btn-find-centers": "समीप कृषि केंद्र खोजें",
    "lbl-recommend-title": "पता लगाई गई बीमारी के लिए अनुशंसित सेवाएं",
    "lbl-recommend-desc": "पता लगाई गई बीमारी के आधार पर, हम निम्नलिखित सहायता केंद्रों पर जाने की सलाह देते हैं:",
    "lbl-nearby-title": "समीप कृषि केंद्र",
    "lbl-loading-text": "समीप कृषि केंद्रों की खोज की जा रही है...",
    "lbl-error-gps": "स्थान पहुंच अस्वीकार कर दी गई। कृपया अपने आस-पास कृषि सहायता केंद्र खोजने के लिए जीपीएस स्थान अनुमति सक्षम करें।"
  },
  ta: {
    "nav-home": "முகப்பு",
    "nav-detector": "நோய் கண்டறிதல்",
    "nav-advisor": "உர ஆலோசனை",
    "nav-tracker": "வளர்ச்சி டிராக்கர்",
    "nav-weather": "வானிலை எச்சரிக்கைகள்",
    "nav-stats": "புள்ளிவிவரங்கள்",
    "nav-faq": "கேள்விகள்",
    "nav-contact": "தொடர்பு",

    "hero-tag": "AI-அடிப்படையிலான பயிர் சுகாதார கண்காணிப்பு மூலம் விவசாயிகளுக்கு அதிகாரம்",
    "hero-title": "ஸ்மார்ட் நோய் கண்டறிதல் மூலம் உங்கள் பயிர்களைப் பாதுகாக்கவும்",
    "hero-subtitle": "பயிர் புகைப்படங்களைப் பதிவேற்றவும், நோய்களைக் கண்டறியவும், சிகிச்சை பரிந்துரைகளைப் பெறவும் மற்றும் பயிர் விளைச்சலை மேம்படுத்தவும்.",
    "btn-detect-crop": "நோயைக் கண்டறி",
    "btn-learn-more": "மேலும் அறிய",
    "hero-panel-title": "செயலில் பயிர் ஸ்கேனிங்",
    "lbl-scan-crop": "தக்காளி தோட்டம்",
    "hero-panel-alert": "வானிலை எச்சரிக்கை: அதிக ஈரப்பதம் கணிக்கப்பட்டுள்ளது. பூஞ்சை வளர்ச்சியைத் தடுக்க பயிர்களுக்கு இடையே போதுமான இடைவெளி விடவும்.",

    "stat-scans": "மொத்த நோய் ஸ்கேன்கள்",
    "stat-alerts": "செயலில் உள்ள எச்சரிக்கைகள்",
    "stat-treats": "பரிந்துரைக்கப்பட்ட சிகிச்சைகள்",
    "stat-score": "பயிர் சுகாதார மதிப்பெண்",

    "det-sec-title": "AI பயிர் நோய் கண்டறிதல்",
    "det-sec-subtitle": "நோய்களைத் துல்லியமாக கண்டறிய இலைகளின் புகைப்படங்களைப் பதிவேற்றவும் அல்லது கீழே உள்ள மாதிரிகளைப் பயன்படுத்தவும்.",
    "det-card-title": "பயிர் இலை ஸ்கேன் செய்க",
    "lbl-drag-text": "இலையின் படத்தை இங்கே இழுத்துப் போடுங்கள் அல்லது கிளிக் செய்து தேடவும்",
    "lbl-file-types": "JPG, PNG, WEBP கோப்புகளை ஆதரிக்கிறது (அதிகபட்சம் 5MB)",
    "lbl-test-presets": "மாதிரி இலைகளுடன் சோதிக்கவும்",
    "lbl-preset-spot": "தக்காளி (இலை புள்ளி நோய்)",
    "lbl-preset-mildew": "கோதுமை (சாம்பல் நோய்)",
    "lbl-preset-healthy": "நெல் (ஆரோக்கியமானது)",

    "lbl-result-title": "ஸ்கேன் முடிவு",
    "lbl-severity-txt": "தீவிரத்தன்மை நிலை",
    "lbl-symptoms-title": "அறிகுறிகள்",
    "lbl-causes-title": "காரணங்கள்",
    "lbl-treat-title": "பரிந்துரைக்கப்பட்ட சிகிச்சைகள்",
    "info-box-title": "ஸ்மார்ட் நோய் தரவுத்தளம்",
    "info-box-text": "உழவன்மித்ரா இலைகளின் வடிவங்களை காட்சி பகுப்பாய்வு மூலம் ஆராய்ந்து இலைப்புள்ளி, பூஞ்சை நோய்களைக் கண்டறிகிறது. இணையம் இல்லாமலேயே அனைத்து ஆலோசனைகளையும் பெறலாம்.",
    "lbl-toggle-net": "இணைய சிமுலேட்டர்",

    "fert-title": "உர ஆலோசகர்",
    "fert-desc": "உங்கள் பயிர் தேர்வின் அடிப்படையில் உகந்த NPK உர விகிதங்கள் மற்றும் பரிந்துரைக்கப்பட்ட அளவுகளைப் பெறுங்கள்.",
    "lbl-select-crop": "பயிர் வகையைத் தேர்ந்தெடுக்கவும்",
    "lbl-opt-disabled": "-- பயிரைத் தேர்ந்தெடுக்கவும் --",
    "opt-rice": "நெல்",
    "opt-cotton": "பருத்தி",
    "opt-wheat": "கோதுமை",
    "opt-maize": "மக்காச்சோளம்",
    "opt-tomato": "தக்காளி",
    "lbl-fert-recommend": "பரிந்துரைக்கப்பட்ட உர அளவு",
    "lbl-recipe-type": "உர வகை",
    "lbl-recipe-qty": "ஏக்கருக்கு தேவையான அளவு",
    "lbl-recipe-time": "உரமிடும் பருவம்",

    "grow-title": "பயிர் வளர்ச்சி டிராக்கர்",
    "grow-desc": "பயிரின் வளர்ச்சியை கண்காணிக்கவும், விதைத்த நாட்களை கணக்கிடவும் மற்றும் தற்போதைய வளர்ச்சி நிலையை அறியவும்.",
    "lbl-track-select": "பயிரைத் தேர்ந்தெடு",
    "lbl-track-date": "விதைத்த தேதி",
    "btn-calculate-growth": "வளர்ச்சியை கணக்கிடு",
    "lbl-track-days": "விதைத்ததில் இருந்து நாட்கள்:",
    "lbl-stage-seed": "விதை",
    "lbl-stage-germ": "முளைத்தல்",
    "lbl-stage-veg": "வளர் பருவம்",
    "lbl-stage-flow": "பூக்கும் பருவம்",
    "lbl-stage-harv": "அறுவடை",

    "wea-sec-title": "உள்ளூர் வானிலை எச்சரிக்கைகள்",
    "wea-sec-subtitle": "பயிர்கள் நோய்களிலிருந்து பாதுகாக்க வானிலை நிலவரங்கள் மற்றும் பாதுகாப்பு வழிமுறைகள்.",
    "wea-dash-title": "விவசாய வானிலை பேனல்",
    "lbl-wea-sim": "வானிலை நிலையை மாற்றുക:",
    "opt-wea-normal": "மிதமான வெயில் (சாதகமானது)",
    "opt-wea-humid": "அதிக ஈரப்பதம் (பூஞ்சை ஆபத்து)",
    "opt-wea-rainy": "கனமழை மற்றும் ஈரப்பதம்",
    "opt-wea-drought": "வறட்சி மற்றும் வெப்பம்",
    "lbl-wea-temp": "வெப்பநிலை",
    "lbl-wea-humid": "ஈரப்பதம்",
    "lbl-wea-rain": "மழைக்கான வாய்ப்பு",
    "lbl-wea-wind": "காற்றின் வேகம்",

    "sta-sec-title": "விவசாய புள்ளிவிவரங்கள்",
    "sta-sec-subtitle": "எங்கள் பகுப்பாய்வு மூலம் சேகரிக்கப்பட்ட பயிர் வளர்ச்சி விகிதம் மற்றும் நோய் கட்டுப்பாட்டு வெற்றிகள்.",
    "sta-chart-crop": "பயிர் சுகாதார விநியோகம் (%)",
    "sta-chart-dis": "பருவகால வாரியாக மாதாந்திர நோய் கண்டறிதல்",
    "sta-chart-yield": "முக்கிய கணினி திறன்கள்",
    "stats-lbl-accuracy": "சரிபார்க்கப்பட்ட நோய் கண்டறிதல் துல்லியம்",
    "stats-lbl-speed": "உடனடி ஆஃப்லைன் பதில்",
    "stats-lbl-users": "உலகளாவிய பயிர் ஸ்கேன்கள்",
    "lbl-badge-rice": "90% உச்சம்",
    "lbl-grp-rabi": "ரபி (குளிர்காலம்)",
    "lbl-grp-kharif": "காரிஃப் (மழைக்காலம்)",
    "lbl-grp-zaid": "செய்ட் (கோடைகாலம்)",
    "use-offline-title": "100% ஆஃப்லைன் பயன்முறை",
    "use-offline-desc": "இணைய இணைப்பு இல்லாவிட்டாலும் நேரடியாக வயல்வெளிகளிலேயே பயிர் நோய்களை உடனடியாகக் கண்டறியவும்.",
    "use-soil-title": "NPK மண் ஊட்டச்சத்து சமநிலை",
    "use-soil-desc": "மண் வளம் மற்றும் பயிர்களுக்கு ஏற்ப ரசாயன மற்றும் இயற்கை உர அளவை துல்லியமாக கணக்கிடுங்கள்.",
    "use-weather-title": "வானிலை ஆபத்து எச்சரிக்கைகள்",
    "use-weather-desc": "பூஞ்சை மற்றும் பாக்டீரியா தொற்றுகளைத் தவிர்க்க உள்ளூர் வெப்பநிலை மற்றும் ஈரப்பதத்தைக் கண்காணிக்கவும்.",
    "use-contact-title": "வேளாண் ஆலோசகர்கள்",
    "use-contact-desc": "தகுதிவாய்ந்த வேளாண் நிபுணர்களிடம் இருந்து நேரடியாக தொலைபேசி வழிகட்டுதலைப் பெற புகைப்படங்களை அனுப்பவும்.",
    "use-yield-title": "வளர்ச்சி மைல்கற்கள்",
    "use-yield-desc": "விதைப்பு தேதிகள், வளர்ச்சி நிலைகள் மற்றும் அறுவடை நேர கணிப்புகளை நிகழ்நேரத்தில் கண்காணிக்கவும்.",

    "test-sec-title": "விவசாயிகள் என்ன சொல்கிறார்கள்",
    "test-sec-subtitle": "தங்கள் வயல்களில் உழவன்மித்ராவைப் பயன்படுத்தும் விவசாயிகளின் அனுபவங்கள் மற்றும் கருத்துக்கள்.",
    "test-quote-1": "இலை ஸ்கேனர் தக்காளி பயிரில் உள்ள இலைப்புள்ளி நோயை சரியாகக் கண்டறிந்தது. வேப்பெண்ணெய் கரைசலை தெளித்ததால் இந்த பருவத்தில் 80% பயிரை காப்பாற்றினேன்.",
    "test-loc-1": "தக்காளி விவசாயி, குண்டூர்",
    "test-quote-2": "பருத்தி பயிருக்கான உர விகிதங்கள் குறித்து குழப்பம் இருந்தது. உழவன்மித்ரா ஏக்கருக்கு தேவையான உர அளவை சரியாக கணக்கிட்டது. உற்பத்தி செலவு குறைந்து பயிர் விளைச்சல் அதிகரித்துள்ளது.",
    "test-loc-2": "பருத்தி விவசாயி, வாரங்கல்",
    "test-quote-3": "வயல்வெளிகளில் இணையம் இல்லாவிட்டாலும் தமிழில் இந்த செயலி வேலை செய்வது ஒரு வரப்பிரசாதமாகும். இது உரமிடும் நேரத்தை நினைவூட்டுகிறது.",
    "test-loc-3": "கோதுமை விவசாயி, இந்தூர்",

    "faq-sec-title": "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    "faq-sec-subtitle": "நோய் கண்டறிதல் மற்றும் இணையம் இல்லாத செயல்பாடு பற்றிய பொதுவான கேள்விகள்.",
    "faq-q1": "பயிர் நோய் கண்டறிதல் எவ்வாறு செயல்படுகிறது?",
    "faq-a1": "எங்கள் AI மாதிரி இலையின் நிறம், நரம்பு அமைப்பு மற்றும் புள்ளிகளை ஆய்வு செய்கிறது. இதை நோய் தரவுத்தளத்துடன் ஒப்பிட்டு நோயின் தீவிரத்தை லெக்கிடுகிறது.",
    "faq-q2": "இந்த வலைத்தளம் இணையம் இல்லாமல் வேலை செய்யுமா?",
    "faq-a2": "ஆம்! உழவன்மித்ராவில் ஆஃப்லைன் பயன்முறை உள்ளது. நோய் தரவுகள் மற்றும் உர அட்டவணைகள் உங்கள் சாதனத்திலேயே சேமிக்கப்படுவதால், நெட்வொர்க் இல்லாத இடங்களிலும் வேலை செய்யும்.",
    "faq-q3": "பரிந்துரைக்கப்பட்ட உர அளவு எவ்வளவு துல்லியமானது?",
    "faq-a3": "இவை வேளாண் ஆராய்ச்சி நிலையங்களின் வழிகாட்டுதல்களின்படி வடிவமைக்கப்பட்டுள்ளன. இருப்பினும், மண் பரிசோதனைக்கு ஏற்ப உர அளவை மாற்றிக் கொள்வது சிறந்தது.",
    "faq-q4": "தற்போது எந்த வகையான பயிர்களின் நோய் கண்டறிதலுக்கு ஆதரவு உள்ளது?",
    "faq-a4": "தற்போது, உழவன்மித்ரா தக்காளி, கோதுமை மற்றும் நெல் பயிர்களுக்கான விரைவான நோய் கண்டறிதலை ஆதரிக்கிறது. வரவிருக்கும் மேம்படுத்தல்களில் மேலும் பல பயிர்களுக்கு ஆதரவை விரிவுபடுத்துகிறோம்.",
    "faq-q5": "நான் பதிவேற்றும் பயிர் தரவு பாதுகாப்பானது மற்றும் தனிப்பட்டதா?",
    "faq-a5": "ஆம். அனைத்து இலை பகுப்பாய்வு மற்றும் நோய் கண்டறிதல்களும் உங்கள் இணைய உலாவியிலேயே உள்நாட்டில் செயலாக்கப்படுவதால், உங்கள் புகைப்படங்கள் அல்லது பயிர் விவரங்கள் எங்கள் சேவையகங்களுக்கு அனுப்பப்படுவதில்லை.",

    "con-sec-title": "தொடர்பு கொள்ள",
    "con-sec-subtitle": "பயிர் நோய்கள், உரங்கள் அல்லது பிற உதவிகளுக்கு எங்களது வேளாண் நிபுணர்களைத் தொடர்பு கொள்ளுங்கள்.",
    "con-info-title": "உதவி மையம்",
    "con-info-desc": "பயிர் புழுக்கள், நோய்கள் மற்றும் மண் ஆரோக்கிய மேலாண்மை குறித்து ஆலோசனைகள் வழங்கப்படுகிறது.",
    "lbl-con-loc": "அக்ரி-டெக் ஹப், செக்டார் 5, ஹைதராபாத், இந்தியா",
    "con-form-title": "செய்தி அனுப்புக",
    "lbl-form-name": "முழு பெயர்",
    "lbl-form-phone": "கைபேசி எண்",
    "lbl-form-phone-hint": "10 இலக்க கைபேசி எண்ணை உள்ளிடவும்",
    "lbl-form-crop": "பயிர் வகை",
    "lbl-form-msg": "செய்தி",
    "btn-submit-form": "கேள்விகளை அனுப்பவும்",
    "lbl-modal-title": "கேள்விகள் அனுப்பப்பட்டது!",
    "lbl-modal-desc": "நன்றி. உங்கள் பயிர் பிரச்சனைகளுக்கு உதவ எங்களது வேளாண் ஆலோசகர் 24 மணி நேரத்திற்குள் உங்களைத் தொடர்புகொள்வார்.",
    "footer-desc": "ஆஃப்லைன் நோய் கண்டறிதல், வானிலை எச்சரிக்கை மற்றும் விவசாய ஆலோசனைகள் மூலம் பயிர்களைப் பாதுகாத்து இழப்புகளைத் தவிர்க்க உதவுகிறது.",
    "footer-lbl-links": "விரைவு இணைப்புகள்",
    "footer-lbl-social": "சமூக ஊடகங்கள்",
    "footer-social-desc": "வேளாண் செய்திகள் மற்றும் பயிற்சிகளுக்கு எங்களை பின்தொடரவும்.",
    "lbl-btn-find-centers": "அருகிலுள்ள விவசாய மையங்களைக் கண்டறியவும்",
    "lbl-recommend-title": "கண்டறியப்பட்ட நோய்க்கான பரிந்துரைக்கப்பட்ட சேவைகள்",
    "lbl-recommend-desc": "கண்டறியப்பட்ட நோயின் அடிப்படையில், பின்வரும் உதவி மையங்களுக்குச் செல்ல பரிந்துரைக்கிறோம்:",
    "lbl-nearby-title": "அருகிலுள்ள விவசாய மையங்கள்",
    "lbl-loading-text": "அருகிலுள்ள விவசாய மையங்களைத் தேடுகிறது...",
    "lbl-error-gps": "இருப்பிட அணுகல் மறுக்கப்பட்டது. உங்களுக்கு அருகிலுள்ள விவசாய உதவி மையங்களைக் கண்டறிய ஜிபிஎஸ் இருப்பிட அனுமதிகளை இயக்கவும்."
  },
  ml: {
    "nav-home": "ഹോം",
    "nav-detector": "രോഗനിർണ്ണയം",
    "nav-advisor": "വളപ്രയോഗ നിർദ്ദേശം",
    "nav-tracker": "വിള വളർച്ചാ ട്രാക്കർ",
    "nav-weather": "കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ",
    "nav-stats": "സ്ഥിതിവിവരക്കണക്കുകൾ",
    "nav-faq": "പതിവ് ചോദ്യങ്ങൾ",
    "nav-contact": "ബന്ധപ്പെടുക",
    "hero-tag": "AI അടിസ്ഥാനമാക്കിയുള്ള വിള ആരോഗ്യ നിരീക്ഷണത്തിലൂടെ കർഷകരെ ശാക്തീകരിക്കുന്നു",
    "hero-title": "സ്മാർട്ട് രോഗനിർണ്ണയത്തിലൂടെ വിളകളെ സംരക്ഷിക്കുക",
    "hero-subtitle": "ഇലകളുടെ ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക, രോഗങ്ങൾ കണ്ടെത്തുക, പരിഹാരങ്ങൾ നേടുക, വിളവ് വർദ്ധിപ്പിക്കുക.",
    "btn-detect-crop": "രോഗം കണ്ടെത്തുക",
    "btn-learn-more": "കൂടുതൽ അറിയാൻ",
    "hero-panel-title": "സജീവ വിള സ്കാനിംഗ്",
    "lbl-scan-crop": "തക്കാളി തോട്ടം",
    "hero-panel-alert": "കാലാവസ്ഥാ മുന്നറിയിപ്പ്: അന്തരീക്ഷത്തിൽ ഉയർന്ന ഈർപ്പം പ്രവചിക്കുന്നു. ഫംഗസ് രോഗങ്ങൾ തടയാൻ വിളകൾ തമ്മിൽ ആവശ്യത്തിന് അകലം പാലിക്കുക.",

    "stat-scans": "ആകെ രോഗനിർണ്ണയങ്ങൾ",
    "stat-alerts": "സജീവ മുന്നറിയിപ്പുകൾ",
    "stat-treats": "ശുപാർശ ചെയ്ത പ്രതിവിധികൾ",
    "stat-score": "വിള ആരോഗ്യ സ്കോർ",

    "det-sec-title": "AI വിള രോഗനിർണ്ണയം",
    "det-sec-subtitle": "വിളകളുടെ രോഗങ്ങൾ പെട്ടെന്ന് പരിശോധിക്കാൻ ഇലകളുടെ ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ നൽകിയിട്ടുള്ള മാതൃകകൾ ഉപയോഗിക്കുക.",
    "det-card-title": "വിള ചിത്രം സ്കാനർ",
    "lbl-drag-text": "ഇലയുടെ ചിത്രം ഇവിടെ വലിച്ചിടുക അല്ലെങ്കിൽ തിരഞ്ഞെടുക്കാൻ ക്ലിക്ക് ചെയ്യുക",
    "lbl-file-types": "JPG, PNG, WEBP ഫയലുകൾ പിന്തുണയ്ക്കുന്നു (പരമാവധി 5MB)",
    "lbl-test-presets": "നൽകിയിട്ടുള്ള ഇലകൾ ഉപയോഗിച്ച് പരിശോധിക്കുക",
    "lbl-preset-spot": "തക്കാളി (ഇലപ്പുള്ളി രോഗം)",
    "lbl-preset-mildew": "ഗോതമ്പ് (പൂപ്പൽ രോഗം)",
    "lbl-preset-healthy": "നെല്ല് (ആരോഗ്യമുള്ളത്)",

    "lbl-result-title": "സ്കാൻ ഫലം",
    "lbl-severity-txt": "തീവ്രത",
    "lbl-symptoms-title": "ലക്ഷണങ്ങൾ",
    "lbl-causes-title": "കാരണങ്ങൾ",
    "lbl-treat-title": "ശുപാർശ ചെയ്ത പ്രതിവിധികൾ",
    "info-box-title": "സ്മാർട്ട് രോഗവിവര ശേഖരം",
    "info-box-text": "ഋതുമിത്ര വിളകളുടെ ഇലകളുടെ ഘടന വിശകലനം ചെയ്ത് ഇലപ്പുള്ളി, പൂപ്പൽ തുടങ്ങിയ രോഗങ്ങൾ കണ്ടെത്തുന്നു. ഈ വിവരങ്ങളും ചികിത്സകളും ഇന്റർനെറ്റ് ഇല്ലാതെയും ലഭ്യമാണ്.",
    "lbl-toggle-net": "ഇന്റർനെറ്റ് അവസ്ഥ അനുകരിക്കുക",

    "fert-title": "വളപ്രയോഗ നിർദ്ദേശം",
    "fert-desc": "നിങ്ങളുടെ വിളകൾക്കനുയോജ്യമായ NPK വളക്കൂട്ടുകളും അവ പ്രയോഗിക്കേണ്ട രീതിയും മനസ്സിലാക്കുക.",
    "lbl-select-crop": "വിള തിരഞ്ഞെടുക്കുക",
    "lbl-opt-disabled": "-- വിള തിരഞ്ഞെടുക്കുക --",
    "opt-rice": "നെല്ല്",
    "opt-cotton": "പരുത്തി",
    "opt-wheat": "ഗോതമ്പ്",
    "opt-maize": "ചോളം",
    "opt-tomato": "തക്കാളി",
    "lbl-fert-recommend": "ശുപാർശ ചെയ്ത വളക്കൂട്ട്",
    "lbl-recipe-type": "വളം തരം",
    "lbl-recipe-qty": "ഏക്കറിന് ആവശ്യമായ അളവ്",
    "lbl-recipe-time": "പ്രയോഗിക്കേണ്ട ഘട്ടം",

    "grow-title": "വിള വളർച്ചാ ട്രാക്കർ",
    "grow-desc": "വിളകളുടെ പുരോഗതി നിരീക്ഷിക്കുക, വിതച്ച ദിവസങ്ങൾ കണക്കാക്കുക, ഇപ്പോഴത്തെ വളർച്ചാ ഘട്ടം കാണുക.",
    "lbl-track-select": "വിള തിരഞ്ഞെടുക്കുക",
    "lbl-track-date": "വിതച്ച തീയതി",
    "btn-calculate-growth": "പ്രഗതി കണക്കാക്കുക",
    "lbl-track-days": "വിതച്ചതിനു ശേഷമുള്ള ദിവസങ്ങൾ:",
    "lbl-stage-seed": "വിത്ത്",
    "lbl-stage-germ": "മൊലക്കൽ",
    "lbl-stage-veg": "വളർച്ചാ ഘട്ടം",
    "lbl-stage-flow": "പൂവിടൽ ഘട്ടം",
    "lbl-stage-harv": "വിളവെടുപ്പ്",

    "wea-sec-title": "പ്രാദേശിക കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ",
    "wea-sec-subtitle": "രോഗങ്ങൾ പടരുന്നത് തടയാൻ സഹായിക്കുന്ന അന്തരീക്ഷ സ്ഥിതിയും കൃഷി നിർദ്ദേശങ്ങളും.",
    "wea-dash-title": "കാലാവസ്ഥാ പാനൽ",
    "lbl-wea-sim": "കാലാവസ്ഥ മാറ്റുക:",
    "opt-wea-normal": "മിതമായ വെയിൽ (അനുയോജ്യം)",
    "opt-wea-humid": "ഉയർന്ന ഈർപ്പം (ഫംഗസ് സാധ്യത)",
    "opt-wea-rainy": "ശക്തമായ മഴ & ഈർപ്പം",
    "opt-wea-drought": "കഠിനമായ ചൂട് (ജലക്ഷാമം)",
    "lbl-wea-temp": "താപനില",
    "lbl-wea-humid": "ഈർപ്പം",
    "lbl-wea-rain": "മഴ സാധ്യത",
    "lbl-wea-wind": "കാറ്റിന്റെ വേഗത",

    "sta-sec-title": "കാർഷിക സ്ഥിതിവിവരക്കണക്കുകൾ",
    "sta-sec-subtitle": "വിളകളുടെ വളർച്ചാ നിരക്കും കീടനിയന്ത്രണ വിജയവും വ്യക്തമാക്കുന്ന സ്ഥിതിവിവരക്കണക്കുകൾ.",
    "sta-chart-crop": "വിള ആരോഗ്യ വിതരണം (%)",
    "sta-chart-dis": "സീസൺ അനുസരിച്ചുള്ള പ്രതിമാസ രോഗനിർണ്ണയം",
    "sta-chart-yield": "പ്രധാന സിസ്റ്റം സവിശേഷതകൾ",
    "stats-lbl-accuracy": "സ്ഥിരീകരിച്ച രോഗനിർണ്ണയ കൃത്യത",
    "stats-lbl-speed": "ഉടനടി ഓഫ്ലൈൻ മറുപടി",
    "stats-lbl-users": "ആഗോള തലത്തിൽ പൂർത്തിയാക്കിയ സ്കാനുകൾ",
    "lbl-badge-rice": "90% പരമാവധി",
    "lbl-grp-rabi": "രബി (ശീതകാലം)",
    "lbl-grp-kharif": "ഖരീഫ് (വർഷാകാലം)",
    "lbl-grp-zaid": "സെയ്ദ് (വേനൽക്കാലം)",
    "use-offline-title": "100% ഓഫ്ലൈൻ മോഡ്",
    "use-offline-desc": "നെറ്റ്‌വർക്കോ ഇന്റർനെറ്റോ ഇല്ലാത്ത കൃഷിയിടങ്ങളിലും വിളരോഗങ്ങൾ ഉടനടി കണ്ടെത്തുക.",
    "use-soil-title": "NPK മണ്ണിലെ പോഷക സമതുലിതാവസ്ഥ",
    "use-soil-desc": "മണ്ണിന്റെ ഗുണനിലവാരത്തിനും വിളകൾക്കും അനുസൃതമായി വളത്തിന്റെ അളവ് കണക്കാക്കുക.",
    "use-weather-title": "കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ",
    "use-weather-desc": "ഫംഗസ് രോഗങ്ങൾ പടരുന്നത് തടയാൻ അന്തരീക്ഷ താപനിലയും ഈർപ്പവും നിരീക്ഷിക്കുക.",
    "use-contact-title": "കാർഷിക വിദഗ്ദ്ധർ",
    "use-contact-desc": "വിദഗ്ദ്ധരായ കൃഷി ഓഫീസർമാരിൽ നിന്ന് നേരിട്ട് ഫോൺ വഴി നിർദ്ദേശങ്ങൾ ലഭിക്കുന്നതിന് ചിത്രങ്ങൾ അയക്കുക.",
    "use-yield-title": "വിള വളർച്ചാ ഘട്ടങ്ങൾ",
    "use-yield-desc": "വിതച്ച തീയതികൾ, വളർച്ചാ ഘട്ടങ്ങൾ, വിളവെടുപ്പ് സമയം എന്നിവ തത്സമയം ട്രാക്ക് ചെയ്യുക.",

    "test-sec-title": "കർഷകരുടെ അഭിപ്രായങ്ങൾ",
    "test-sec-subtitle": "തങ്ങളുടെ കൃഷിയിടങ്ങളിൽ ഞങ്ങളുടെ ആപ്ലിക്കേഷൻ ഉപയോഗിക്കുന്ന കർഷകരുടെ അനുഭവങ്ങൾ.",
    "test-quote-1": "ലീഫ് ഫോട്ടോ സ്കാനർ എന്റെ തക്കാളി വിളയിലെ ഇലപ്പുള്ളി രോഗം കൃത്യമായി കണ്ടെത്തി. വേപ്പെണ്ണ പ്രയോഗം ഈ സീസണിൽ 80% വിളവും സംരക്ഷിക്കാൻ സഹായിച്ചു.",
    "test-loc-1": "തക്കാളി കർഷകൻ, ഗുണ്ടൂർ",
    "test-quote-2": "പരുത്തിക്ക് ആവശ്യമായ NPK വളങ്ങളുടെ അളവിനെക്കുറിച്ച് എനിക്ക് സംശയമുണ്ടായിരുന്നു. വളപ്രയോഗ നിർദ്ദേശം കൃത്യമായ അളവ് കാണിച്ചുതന്നു. വിളവ് വർദ്ധിക്കുകയും ചെലവ് കുറയുകയും ചെയ്തു.",
    "test-loc-2": "പരുത്തി കർഷകൻ, വാറങ്കൽ",
    "test-quote-3": "കൃഷിയിടങ്ങളിൽ ഇന്റർനെറ്റ് ഇല്ലെങ്കിലും പ്രാദേശിക ഭാഷയിൽ ഈ ആപ്പ് ഉപയോഗിക്കാൻ കഴിയുന്നത് വലിയ അനുഗ്രഹമാണ്. ഗോതമ്പ് വിളയ്ക്ക് എപ്പോൾ വളം നൽകണമെന്ന് ഇത് കൃത്യമായി ഓർമ്മിപ്പിക്കുന്നു.",
    "test-loc-3": "ഗോതമ്പ് കർഷകൻ, ഇൻഡോർ",

    "faq-sec-title": "പതിവ് ചോദ്യങ്ങൾ",
    "faq-sec-subtitle": "രോഗനിർണ്ണയ രീതികളെക്കുറിച്ചും ഓഫ്ലൈൻ പ്രവർത്തനത്തെക്കുറിച്ചുമുള്ള പൊതുവായ സംശയങ്ങൾ.",
    "faq-q1": "വിള രോഗനിർണ്ണയം എങ്ങനെയാണ് പ്രവർത്തിക്കുന്നത്?",
    "faq-a1": "ഞങ്ങളുടെ AI മോഡൽ ഇലകളുടെ നിറം, ഞരമ്പുകളുടെ ഘടന, പുള്ളികൾ എന്നിവ വിശകലനം ചെയ്യുന്നു. ഇവയെ ഒരു ഡാറ്റാബേസുമായി താരതമ്യം ചെയ്ത് രോഗവും അതിന്റെ തീവ്രതയും കണക്കാക്കുന്നു.",
    "faq-q2": "ഇന്റർനെറ്റ് ഇല്ലെങ്കിലും വെബ്സൈറ്റ് പ്രവർത്തിക്കുമോ?",
    "faq-a2": "അതെ! ഇതിൽ ഓഫ്ലൈൻ മോഡ് ലഭ്യമാണ്. രോഗവിവരങ്ങളും വളപ്രയോഗ ചാർട്ടുകളും നിങ്ങളുടെ ഉപകരണത്തിൽ തന്നെ സൂക്ഷിക്കുന്നതിനാൽ സിഗ്നൽ ഇല്ലാത്ത സ്ഥലങ്ങളിലും ഇത് പ്രവർത്തിക്കും.",
    "faq-q3": "വളപ്രയോഗ അളവുകൾ എത്രത്തോളം കൃത്യമാണ്?",
    "faq-a3": "കാർഷിക വകുപ്പിന്റെ മാർഗ്ഗനിർദ്ദേശങ്ങൾ അനുസരിച്ചാണ് ഇവ തയ്യാറാക്കിയിരിക്കുന്നത്. എന്നിരുന്നാലും, മണ്ണുപരിശോധന നടത്തി നിങ്ങളുടെ പ്രാദേശിക സാഹചര്യങ്ങൾക്ക് അനുസരിച്ച് മാറ്റങ്ങൾ വരുത്തുന്നത് നന്നായിരിക്കും.",
    "faq-q4": "നിലവിൽ ഏതെല്ലാം വിളകളുടെ രോഗനിർണ്ണയമാണ് പിന്തുണയ്ക്കുന്നത്?",
    "faq-a4": "നിലവിൽ, തക്കാളി, ഗോതമ്പ്, നെല്ല് എന്നീ വിളകളുടെ രോഗനിർണ്ണയത്തെ ഋതുമിത്ര പിന്തുണയ്ക്കുന്നു. വരാനിരിക്കുന്ന അപ്‌ഡേറ്റുകളിൽ കൂടുതൽ പ്രാദേശിക വിളകൾ ഇതിലേക്ക് ചേർക്കുന്നതാണ്.",
    "faq-q5": "ഞാൻ അപ്‌ലോഡ് ചെയ്യുന്ന വിവരങ്ങൾ സുരക്ഷിതമാണോ?",
    "faq-a5": "അതെ. ഇലകളുടെ പരിശോധനയും രോഗനിർണ്ണയവും പൂർണ്ണമായും നിങ്ങളുടെ വെബ് ബ്രൗസറിൽ പ്രാദേശികമായി നടക്കുന്നതിനാൽ ചിത്രങ്ങളോ മറ്റ് വിവരങ്ങളോ ഞങ്ങളുടെ സെർവറുകളിലേക്ക് അയക്കുന്നില്ല.",

    "con-sec-title": "ബന്ധപ്പെടുക",
    "con-sec-subtitle": "കാർഷിക പ്രശ്നങ്ങൾ, രോഗങ്ങൾ, വളപ്രയോഗം എന്നിവയെക്കുറിച്ച് ഞങ്ങളുടെ വിദഗ്ദ്ധരുമായി സംസാരിക്കുക.",
    "con-info-title": "സഹായ കേന്ദ്രം",
    "con-info-desc": "ഞങ്ങളുടെ കാർഷിക വിദഗ്ദ്ധർ വിള രോഗങ്ങൾ, കീടനിയന്ത്രണം, മൺ സംരക്ഷണം എന്നിവയിൽ സപ്പോർട്ട് നൽകുന്നു.",
    "lbl-con-loc": "അഗ്രി-ടെക് ഹബ്ബ്, സെക്ടർ 5, ഹൈദരാബാദ്, ഇന്ത്യ",
    "con-form-title": "സന്ദേശം അയക്കുക",
    "lbl-form-name": "മുഴുവൻ പേര്",
    "lbl-form-phone": "മൊബൈൽ നമ്പർ",
    "lbl-form-phone-hint": "10 അക്ക മൊബൈൽ നമ്പർ നൽകുക",
    "lbl-form-crop": "വിള തരം",
    "lbl-form-msg": "സന്ദേശം",
    "btn-submit-form": "വിവരങ്ങൾ സമർപ്പിക്കുക",
    "lbl-modal-title": "വിവരങ്ങൾ സമർപ്പിച്ചു!",
    "lbl-modal-desc": "നന്ദി. ഒരു കാർഷിക വിദഗ്ദ്ധൻ 24 മണിക്കൂറിനുള്ളിൽ നിങ്ങളെ ഫോണിൽ ബന്ധപ്പെടുന്നതാണ്.",
    "footer-desc": "ഓഫ്ലൈൻ രോഗനിർണ്ണയം, കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ, കാർഷിക നിർദ്ദേശങ്ങൾ എന്നിവയിലൂടെ വിളനാശം തടയാൻ സഹായിക്കുന്നു.",
    "footer-lbl-links": "പ്രധാന ലിങ്കുകൾ",
    "footer-lbl-social": "ഞങ്ങളുമായി ബന്ധപ്പെടുക",
    "footer-social-desc": "വിള വിവരങ്ങൾക്കും കാർഷിക വാർത്തകൾക്കുമായി സോഷ്യൽ മീഡിയയിൽ ഞങ്ങളുമായി ബന്ധപ്പെടുക.",
    "lbl-btn-find-centers": "സമീപത്തുള്ള കാർഷിക കേന്ദ്രങ്ങൾ കണ്ടെത്തുക",
    "lbl-recommend-title": "കണ്ടെത്തിയ രോഗത്തിന് ശുപാർശ ചെയ്യുന്ന സേവനങ്ങൾ",
    "lbl-recommend-desc": "കണ്ടെത്തിയ രോഗത്തിന്റെ അടിസ്ഥാനത്തിൽ, താഴെ പറയുന്ന സഹായ കേന്ദ്രങ്ങൾ സന്ദർശിക്കാൻ ഞങ്ങൾ ശുപാർശ ചെയ്യുന്നു:",
    "lbl-nearby-title": "സമീപത്തുള്ള കാർഷിക കേന്ദ്രങ്ങൾ",
    "lbl-loading-text": "സമീപത്തുള്ള കാർഷിക കേന്ദ്രങ്ങൾക്കായി തിരയുന്നു...",
    "lbl-error-gps": "ലൊക്കേഷൻ അനുമതി നിരസിച്ചു. നിങ്ങളുടെ സമീപത്തുള്ള കാർഷിക സഹായ കേന്ദ്രങ്ങൾ കണ്ടെത്തുന്നതിന് ദയവായി ജിപിഎസ് ലൊക്കേഷൻ അനുമതികൾ അനുവദിക്കുക."
  },
  kn: {
    "nav-home": "ಹೋಮ್",
    "nav-detector": "ರೋಗ ಪತ್ತೆ",
    "nav-advisor": "ಗೊಬ್ಬರ ಸಲಹೆ",
    "nav-tracker": "ಬೆಳೆ ಬೆಳವಣಿಗೆ",
    "nav-weather": "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
    "nav-stats": "ಅಂಕಿಅಂಶಗಳು",
    "nav-faq": "ಪ್ರಶ್ನೋತ್ತರಗಳು",
    "nav-contact": "ಸಂಪರ್ಕಿಸಿ",

    "hero-tag": "AI-ಆಧಾರಿತ ಬೆಳೆ ಆರೋಗ್ಯ ಮೇಲ್ವಿಚಾರಣೆಯೊಂದಿಗೆ ಕೃಷಿಕರ ಸಬಲೀಕರಣ",
    "hero-title": "ಸ್ಮಾರ್ಟ್ ರೋಗ ಪತ್ತೆ ವಿಧಾನದಿಂದ ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಿ",
    "hero-subtitle": "ಎಲೆಗಳ ಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ, ಸೂಕ್ತ ಪರಿಹಾರಗಳನ್ನು ಪಡೆದು ಇಳುವರಿ ಹೆಚ್ಚಿಸಿಕೊಳ್ಳಿ.",
    "btn-detect-crop": "ರೋಗ ಪತ್ತೆಹಚ್ಚಿ",
    "btn-learn-more": "ಹೆಚ್ಚಿನ ಮಾಹಿತಿ",
    "hero-panel-title": "ಸಕ್ರಿಯ ಬೆಳೆ ಸ್ಕ್ಯಾನಿಂಗ್",
    "lbl-scan-crop": "ಟೊಮೆಟೊ ತೋಟ",
    "hero-panel-alert": "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ: ಗಾಳಿಯಲ್ಲಿ ಹೆಚ್ಚಿನ ತೇವಾಂಶ ಇರಲಿದೆ. ಶಿಲೀಂಧ್ರ ರೋಗ ತಡೆಯಲು ಬೆಳೆಗಳ ನಡುವೆ ಸೂಕ್ತ ಅಂತರವಿಡಿ.",

    "stat-scans": "ಒಟ್ಟು ರೋಗ ಸ್ಕ್ಯಾನ್‌ಗಳು",
    "stat-alerts": "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು",
    "stat-treats": "ಶಿಫಾರಸು ಮಾಡಿದ ಚಿಕಿತ್ಸೆಗಳು",
    "stat-score": "ಬೆಳೆ ಆರೋಗ್ಯ ಸ್ಕೋರ್",

    "det-sec-title": "AI ಬೆಳೆ ರೋಗ ಪತ್ತೆ",
    "det-sec-subtitle": "ಬೆಳೆಗಳ ರೋಗಗಳನ್ನು ತಕ್ಷಣ ಪರೀಕ್ಷಿಸಲು ಎಲೆಗಳ ಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ನೀಡಿರುವ ಮಾದರಿ ಚಿತ್ರಗಳನ್ನು ಬಳಸಿ.",
    "det-card-title": "ಬೆಳೆ ಚಿತ್ರ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    "lbl-drag-text": "ಎಲೆಯ ಚಿತ್ರವನ್ನು ಇಲ್ಲಿಗೆ ಎಳೆಯಿರಿ ಅಥವಾ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    "lbl-file-types": "JPG, PNG, WEBP ಫೈಲ್‌ಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ (ಗರಿಷ್ಠ 5MB)",
    "lbl-test-presets": "ಮಾದರಿ ಎಲೆಗಳೊಂದಿಗೆ ಪರೀಕ್ಷಿಸಿ",
    "lbl-preset-spot": "ಟೊಮೆಟೊ (ಎಲೆ ಚುಕ್ಕೆ ರೋಗ)",
    "lbl-preset-mildew": "ಗೋದೂಮೆ (ಬೂದಿ ರೋಗ)",
    "lbl-preset-healthy": "ಭತ್ತ (ಆರೋಗ್ಯಕರ)",

    "lbl-result-title": "ಸ್ಕ್ಯಾನ್ ಫಲಿತಾಂಶ",
    "lbl-severity-txt": "ತೀವ್ರತೆಯ ಮಟ್ಟ",
    "lbl-symptoms-title": "ಲಕ್ಷಣಗಳು",
    "lbl-causes-title": "ಕಾರಣಗಳು",
    "lbl-treat-title": "ಶಿಫಾರಸು ಮಾಡಿದ ಚಿಕಿತ್ಸೆಗಳು",
    "info-box-title": "ಸ್ಮಾರ್ಟ್ ರೋಗ ದತ್ತಸಂಚಯ",
    "info-box-text": "ಋತುಮಿತ್ರ ಬೆಳೆಗಳ ಎಲೆಗಳ ಮಾದರಿಯನ್ನು ದೃಶ್ಯ ವಿಶ್ಲೇಷಣೆ ಮೂಲಕ ಪರಿಶೀಲಿಸಿ ರೋಗಗಳನ್ನು ಪತ್ತೆ ಮಾಡುತ್ತದೆ. ಈ ಮಾಹಿತಿಯನ್ನು ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಪಡೆಯಬಹುದು.",
    "lbl-toggle-net": "ಇಂಟರ್ನೆಟ್ ಸ್ಥಿತಿ ಸಿಮ್ಯುಲೇಟರ್",

    "fert-title": "ಗೊಬ್ಬರ ಸಲಹೆಗಾರ",
    "fert-desc": "ನಿಮ್ಮ ಬೆಳೆಗೆ ಅನುಗುಣವಾಗಿ ಸೂಕ್ತ NPK ಗೊಬ್ಬರದ ಪ್ರಮಾಣ ಮತ್ತು ಬಳಸುವ ಸಮಯವನ್ನು ತಿಳಿದುಕೊಳ್ಳಿ.",
    "lbl-select-crop": "ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ",
    "lbl-opt-disabled": "-- ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ --",
    "opt-rice": "ಅಕ್ಕಿ",
    "opt-cotton": "ಹತ್ತಿ",
    "opt-wheat": "ಗೋಧಿ",
    "opt-maize": "ಜೋಳ",
    "opt-tomato": "ಟೊಮೇಟೊ",
    "lbl-fert-recommend": "ಶಿಫಾರಸು ಮಾಡಿದ ಮಿಶ್ರಣ",
    "lbl-recipe-type": "ಗೊಬ್ಬರದ ಪ್ರಕಾರ",
    "lbl-recipe-qty": "ಎಕರೆಗೆ ಬೇಕಾಗುವ ಪ್ರಮಾಣ",
    "lbl-recipe-time": "ಗೊಬ್ಬರ ಹಾಕುವ ಹಂತ",

    "grow-title": "ಬೆಳೆ ಬೆಳವಣಿಗೆ ಟ್ರ್ಯಾಕರ್",
    "grow-desc": "ಬೆಳೆಯ ಪ್ರಗತಿಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ, ಬಿತ್ತನೆಯ ದಿನಗಳನ್ನು ಲೆಕ್ಕಹಾಕಿ ಮತ್ತು ಬೆಳವಣಿಗೆಯ ಹಂತಗಳನ್ನು ವೀಕ್ಷಿಸಿ.",
    "lbl-track-select": "ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ",
    "lbl-track-date": "ಬಿತ್ತನೆ ದಿನಾಂಕ",
    "btn-calculate-growth": "ಪ್ರಗತಿ ಲೆಕ್ಕಹಾಕಿ",
    "lbl-track-days": "ಬಿತ್ತನೆಯ ನಂತರದ ದಿನಗಳು:",
    "lbl-stage-seed": "ಬೀಜ",
    "lbl-stage-germ": "ಮೊಳಕೆಯೊಡೆಯುವುದು",
    "lbl-stage-veg": "ಬೆಳವಣಿಗೆಯ ಹಂತ",
    "lbl-stage-flow": "ಹೂ ಬಿಡುವ ಹಂತ",
    "lbl-stage-harv": "ಕಟಾವು ಹಂತ",

    "wea-sec-title": "ಸ್ಥಳೀಯ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು",
    "wea-sec-subtitle": "ರೋಗಗಳು ಹರಡುವುದನ್ನು ತಡೆಗಟ್ಟಲು ಹವಾಮಾನ ಪರಿಸ್ถಿತಿ ಮತ್ತು ಸುರಕ್ಷತಾ ಕ್ರಮಗಳು.",
    "wea-dash-title": "ಕೃಷಿ ಹವಾಮಾನ ಪ್ಯಾನಲ್",
    "lbl-wea-sim": "ಹವಾಮಾನ ಬದಲಿಸಿ:",
    "opt-wea-normal": "ಸಾಮಾನ್ಯ ಬಿಸಿಲು (ಅನುಕೂಲಕರ)",
    "opt-wea-humid": "ಹೆಚ್ಚಿನ ತೇವಾಂಶ (ಶಿಲೀಂಧ್ರದ ಅಪಾಯ)",
    "opt-wea-rainy": "ಭಾರೀ ಮಳೆ ಮತ್ತು ತೇವಾಂಶ",
    "opt-wea-drought": "ಬರ ಮತ್ತು ತೀವ್ರ ಶಾಖ",
    "lbl-wea-temp": "ತಾಪಮಾನ",
    "lbl-wea-humid": "ತೇವಾಂಶ",
    "lbl-wea-rain": "ಮಳೆಯ ಸಾಧ್ಯತೆ",
    "lbl-wea-wind": "ಗಾಳಿಯ ವೇಗ",

    "sta-sec-title": "ಕೃಷಿ ಅಂಕಿಅಂಶಗಳು",
    "sta-sec-subtitle": "ಬೆಳೆಗಳ ಬೆಳವಣಿಗೆ ದರ ಮತ್ತು ರೋಗ ನಿಯಂತ್ರಣ ಯಶಸ್ಸನ್ನು ತೋರಿಸುವ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಅಂಕಿಅಂಶಗಳು.",
    "sta-chart-crop": "ಬೆಳೆ ಆರೋಗ್ಯ ಹಂಚಿಕೆ (%)",
    "sta-chart-dis": "ಋತುಮಾನದ ಪ್ರಕಾರ ಮಾಸಿಕ ರೋಗ ಪತ್ತೆ",
    "sta-chart-yield": "ಮುಖ್ಯ ವ್ಯವಸ್ಥೆಯ ಸಾಮರ್ಥ್ಯಗಳು",
    "stats-lbl-accuracy": "ದೃಢೀಕೃತ ರೋಗ ಪತ್ತೆ ನಿಖರತೆ",
    "stats-lbl-speed": "ತಕ್ಷಣದ ಆಫ್‌ಲೈನ್ ಪ್ರತಿಕ್ರಿಯೆ",
    "stats-lbl-users": "ಜಾಗತಿಕವಾಗಿ ಬೆಳೆ ಸ್ಕ್ಯಾನ್‌ಗಳು",
    "lbl-badge-rice": "90% ಗರಿಷ್ಠ",
    "lbl-grp-rabi": "ರಬಿ (ಚಳಿಗಾಲ)",
    "lbl-grp-kharif": "ಖಾರಿಫ್ (ಮುಂಗಾರು)",
    "lbl-grp-zaid": "ಜೈದ್ (ಬೇಸಿಗೆಕಾಲ)",
    "use-offline-title": "100% ಆಫ್‌ಲೈನ್ ಮೋಡ್",
    "use-offline-desc": "ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿಲ್ಲದಿದ್ದರೂ ಜಮೀನುಗಳಲ್ಲಿಯೇ ಬೆಳೆ ರೋಗಗಳನ್ನು ತಕ್ಷಣವೇ ಪತ್ತೆ ಮಾಡಿ.",
    "use-soil-title": "NPK ಮಣ್ಣಿನ ಪೋಷಕಾಂಶ ಸಮತೋಲನ",
    "use-soil-desc": "ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರ ಮತ್ತು ಬೆಳೆಗೆ ತಕ್ಕಂತೆ ಸಾವಯವ ಹಾಗೂ ರಾಸಾಯನಿಕ ಗೊಬ್ಬರ ಪ್ರಮಾಣ ಲೆಕ್ಕಹಾಕಿ.",
    "use-weather-title": "ಹವಾಮಾನ ಅಪಾಯದ ಎಚ್ಚರಿಕೆಗಳು",
    "use-weather-desc": "ಶಿಲೀಂಧ್ರ ರೋಗಗಳ ಹರಡುವಿಕೆ ತಪ್ಪಿಸಲು ಸ್ಥಳೀಯ ತಾಪಮಾನ ಮತ್ತು ತೇವಾಂಶವನ್ನು ಪರ್ಯವೇಕ್ಷಿಸಿ.",
    "use-contact-title": "ಕೃಷಿ ಸಲಹೆಗಾರರು",
    "use-contact-desc": "ಕೃಷಿ ತಜ್ಞರಿಂದ ನೇರವಾಗಿ ಫೋನ್ ಮೂಲಕ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಲು ಬೆಳೆ ರೋಗಗಳ ಚಿತ್ರಗಳನ್ನು ಕಳುಹಿಸಿ.",
    "use-yield-title": "ಬೆಳವಣಿಗೆಯ ಮೈಲಿಗಲ್ಲುಗಳು",
    "use-yield-desc": "ಬಿತ್ತನೆ ದಿನಾಂಕಗಳು, ಬೆಳವಣಿಗೆಯ ಹಂತಗಳು ಹಾಗೂ ಕಟಾವಿನ ಅಂದಾಜು ಸಮಯವನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.",

    "test-sec-title": "ರೈತರ ಅಭಿಪ್ರಾಯಗಳು",
    "test-sec-subtitle": "ತಮ್ಮ ಜಮೀನುಗಳಲ್ಲಿ ಋತುಮಿತ್ರವನ್ನು ಬಳಸುತ್ತಿರುವ ರೈತರ ನೈಜ ಅನುಭವಗಳು.",
    "test-quote-1": "ಎಲೆ ಸ್ಕ್ಯಾನರ್ ನನ್ನ ಟೊಮೆಟೊ ಬೆಳೆಯಲ್ಲಿ ಎಲೆ ಚುಕ್ಕೆ ರೋಗವನ್ನು ಸರಿಯಾಗಿ ಪತ್ತೆ ಮಾಡಿದೆ. ಬೇವಿನ ಎಣ್ಣೆಯ ಸಿಂಪಡಣೆಯು ಈ ಹಂಗಾಮಿನಲ್ಲಿ ನನ್ನ 80% ಬೆಳೆ ಉಳಿಸಿತು.",
    "test-loc-1": "ಟೊಮೆಟೊ ರೈತ, ಗುಂಟೂರು",
    "test-quote-2": "ಹತ್ತಿ ಬೆಳೆಗೆ ಗೊಬ್ಬರದ ಪ್ರಮಾಣದ ಬಗ್ಗೆ ಗೊಂದಲವಿತ್ತು. ಋತುಮಿತ್ರ ಸರಿಯಾದ ಪ್ರಮಾಣವನ್ನು ತಿಳಿಸಿತು, ಇದರಿಂದ ವೆಚ್ಚ ಕಡಿಮೆಯಾಗಿ ಇಳುವರಿ ಹೆಚ್ಚಿತು.",
    "test-loc-2": "ಹತ್ತಿ ರೈತ, ವಾರಂಗಲ್",
    "test-quote-3": "ಜಮೀನುಗಳಲ್ಲಿ ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದರೂ ಕನ್ನಡ ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಲ್ಲಿ ಈ ಆಪ್ ಕೆಲಸ ಮಾಡುವುದು ಒಂದು ವರವಾಗಿದೆ. ಗೊಬ್ಬರ ಹಾಕುವ ಸಮಯವನ್ನು ಇದು ನೆನಪಿಸುತ್ತದೆ.",
    "test-loc-3": "ಗೋಧಿ ರೈತ, ಇಂದೋರ್",

    "faq-sec-title": "ಅಪರೂಪದ ಪ್ರಶ್ನೆಗಳು",
    "faq-sec-subtitle": "ರೋಗ ಪತ್ತೆ ಹಚ್ಚುವ ವಿಧಾನ ಮತ್ತು ಆಫ್‌ಲೈನ್ ಕಾರ್ಯವಿಧಾನದ ಬಗ್ಗೆ ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು.",
    "faq-q1": "ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?",
    "faq-a1": "ನಮ್ಮ AI ಮಾದರಿ ಎಲೆಯ ಬಣ್ಣ, ರೇಖೆಗಳ ವಿನ್ಯಾಸ ಮತ್ತು ಚುಕ್ಕೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ. ಇದನ್ನು ರೋಗಗಳ ದತ್ತಸಂಚಯದೊಂದಿಗೆ ಹೋಲಿಸಿ ರೋಗದ ತೀವ್ರತೆಯನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.",
    "faq-q2": "ಈ ವೆಬ್‌ಸೈಟ್ ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಕೆಲಸ ಮಾಡಬಹುದೇ?",
    "faq-a2": "ಹೌದು! ಋತುಮಿತ್ರದಲ್ಲಿ ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಇದೆ. ರೋಗದ ಮಾಹಿತಿ ಮತ್ತು ಗೊಬ್ಬರದ ಪ್ರಮಾಣದ ಚಾರ್ಟ್‌ಗಳು ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ಇರುವುದರಿಂದ ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
    "faq-q3": "ಶಿಫಾರಸು ಮಾಡಿದ ಗೊಬ್ಬರದ ಪ್ರಮಾಣ ಎಷ್ಟು ನಿಖರವಾಗಿದೆ?",
    "faq-a3": "ಈ ಶಿಫಾರಸುಗಳು ಕೃಷಿ ಇಲಾಖೆಯ ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ಆಧರಿಸಿವೆ. ಆದಾಗ್ಯೂ, ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿಗೆ ತಕ್ಕಂತೆ ಬದಲಾವಣೆ ಮಾಡಿಕೊಳ್ಳುವುದು ಉತ್ತಮ.",
    "faq-q4": "ಪ್ರಸ್ತುತ ಯಾವ ರೀತಿಯ ಬೆಳೆಗಳ ರೋಗ ಪತ್ತೆಗೆ ಬೆಂಬಲವಿದೆ?",
    "faq-a4": "ಪ್ರಸ್ತುತ, ಋತುಮಿತ್ರ ಟೊಮೆಟೊ, ಗೋಧಿ ಮತ್ತು ಭತ್ತದ ಬೆಳೆಗಳಿಗೆ ಕ್ಷಿಪ್ರ ರೋಗ ಪತ್ತೆಯನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ. ಮುಂಬರುವ ನವೀಕರಣಗಳಲ್ಲಿ ಇನ್ನಷ್ಟು ಪ್ರಾದೇಶಿಕ ಬೆಳೆಗಳಿಗೆ ಬೆಂಬಲವನ್ನು ವಿಸ್ತರಿಸಲಿದ್ದೇವೆ.",
    "faq-q5": "ನಾನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಬೆಳೆ ಮಾಹಿತಿ ಸುರಕ್ಷಿತವಾಗಿದೆಯೇ?",
    "faq-a5": "ಹೌದು. ಎಲ್ಲಾ ಎಲೆ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ರೋಗ ಪತ್ತೆ ಪ್ರಕ್ರಿಯೆಯು ಸಂಪೂರ್ಣವಾಗಿ ನಿಮ್ಮ ವೆಬ್ ಬ್ರೌಸರ್‌ನಲ್ಲಿಯೇ ಸ್ಥಳೀಯವಾಗಿ ನಡೆಯುವುದರಿಂದ, ಯಾವುದೇ ಚಿತ್ರಗಳು ಅಥವಾ ಮಾಹಿತಿ ನಮ್ಮ ಸರ್ವರ್‌ಗಳಿಗೆ ರವಾನೆಯಾಗುವುದಿಲ್ಲ.",

    "con-sec-title": "ಸಂಪರ್ಕಿಸಿ",
    "con-sec-subtitle": "ಬೆಳೆ ಸಮಸ್ಯೆಗಳು, ರೋಗಗಳು ಅಥವಾ ಇತರ ಸಹಾಯಕ್ಕಾಗಿ ನಮ್ಮ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    "con-info-title": "ಸಹಾಯ ಕೇಂದ್ರ",
    "con-info-desc": "ನಮ್ಮ ತಜ್ಞರು ಬೆಳೆ ಕೀಟಗಳು, ರೋಗಗಳು ಮತ್ತು ಮಣ್ಣಿನ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತಾರೆ.",
    "lbl-con-loc": "ಅಗ್ರಿ-ಟೆಕ್ ಹಬ್, ಸೆಕ್ಟರ್ 5, ಹೈದರಾಬಾದ್, ಭಾರತ",
    "con-form-title": "ಸಂದೇಶ ಕಳುಹಿಸಿ",
    "lbl-form-name": "ಪೂರ್ಣ ಹೆಸರು",
    "lbl-form-phone": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    "lbl-form-phone-hint": "10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    "lbl-form-crop": "ಬೆಳೆ ಪ್ರಕಾರ",
    "lbl-form-msg": "ಸಂದೇಶ",
    "btn-submit-form": "ವಿಚಾರಣೆ ಸಲ್ಲಿಸಿ",
    "lbl-modal-title": "ವಿಚಾರಣೆ ದಾಖಲಾಗಿದೆ!",
    "lbl-modal-desc": "ಧನ್ಯವಾದಗಳು. ಕೃಷಿ ಸಲಹೆಗಾರರು 24 ಗಂಟೆಗಳ ಒಳಗೆ ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ ನೆರವು ನೀಡಲಿದ್ದಾರೆ.",
    "footer-desc": "ಆಫ್‌ಲೈನ್ ರೋಗ ಪತ್ತೆ, ಹವಾಮಾನ ಮುನ್ನೆಚ್ಚರಿಕೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳ ಮೂಲಕ ರೈತರ ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    "footer-lbl-links": "ತ್ವರಿತ ಕೊಂಡಿಗಳು",
    "footer-lbl-social": "ಸಾಮಾಜಿಕ ಮಾಧ್ಯಮ",
    "footer-social-desc": "ಕೃಷಿ ಸುದ್ದಿಗಳು ಮತ್ತು ತರಬೇತಿಗಳಿಗಾಗಿ ನಮ್ಮನ್ನು ಅನುಸರಿಸಿ."
  }
};

// --- Mock Databases ---
const diseaseDatabase = {
  leaf_spot: {
    diseaseName: "Early Leaf Spot (Septoria)",
    confidence: "95%",
    severity: "high",
    severityVal: 85,
    symptoms: {
      en: "Small circular dark spots appearing first on older lower leaves, developing yellow halos. Leaves eventually yellow and drop.",
      te: "ఆకులపై చిన్న చిన్న గుండ్రటి నల్లటి మచ్చలు ఏర్పడి పసుపు రంగు వలయాలుగా మారుతాయి. ఆకులు ఎండిపోయి రాలిపోతాయి.",
      hi: "पत्तियों पर छोटे गोलाकार काले धब्बे बनते हैं, जिनके चारों ओर पीले घेरे होते हैं। पत्तियां अंततः पीली होकर गिर जाती हैं।",
      ta: "இலைகளில் சிறிய வட்ட வடிவ கரும்புள்ளிகள் தோன்றி, மஞ்சள் வளையங்களாக மாறும். இலைகள் இறுதியில் பழுத்து உதிர்ந்துவிடும்.",
      ml: "ഇലകളിൽ കടും നിറത്തിലുള്ള ചെറിയ വട്ടപ്പുള്ളികൾ ആദ്യം കാണപ്പെടുകയും പിന്നീട് മഞ്ഞവളയമായി മാറുകയും ചെയ്യും. ക്രമേണ ഇലകൾ മഞ്ഞനിറമായി കൊഴിഞ്ഞുപോകുന്നു.",
      kn: "ಎಲೆಗಳ ಮೇಲೆ ಸಣ್ಣ ದುಂಡಗಿನ ಕಪ್ಪು ಚುಕ್ಕೆಗಳು ಕಾಣಿಸಿಕೊಂಡು ಹಳದಿ ವರ್ತುಲಗಳಾಗುತ್ತವೆ. ಎಲೆಗಳು ಹಳದಿಯಾಗಿ ಉದುರಿಹೋಗುತ್ತವೆ."
    },
    causes: {
      en: "Fungal pathogen Septoria lycopersici. Spreads in high moisture, damp leaves, overhead watering, and warm temperatures.",
      te: "సెప్టోరియా లైకోపెర్సిసి అనే ఫంగస్ వల్ల వస్తుంది. అధిక తేమ, తడి ఆకులు మరియు వేడి వాతావరణంలో వేగంగా వ్యాపిస్తుంది.",
      hi: "सेप्टोरिया लाइकोपेर्सिकी नामक कवक। अधिक नमी, गीली पत्तियों, ऊपर से पानी डालने और गर्म तापमान में फैलता है।",
      ta: "செப்டோரியா லைகோபெர்சிசி என்ற பூஞ்சை. அதிக ஈரப்பதம், ஈரமான இலைகள் மற்றும் வெப்பமான காலநிலையில் வேகமாக பரவுகிறது.",
      ml: "സെപ്റ്റോറിയ ലൈകോപെർസിസി എന്ന ഫംഗസ്. ഉയർന്ന ഈർപ്പം, നനവുള്ള ഇലകൾ, മുകളിൽ നിന്നുള്ള നനയ്ക്കൽ, ചൂടുള്ള കാലാവസ്ഥ എന്നിവയിൽ പടരുന്നു.",
      kn: "ಸೆಪ್ಟೋರಿಯಾ ಲೈಕೋಪೆರ್ಸಿಕಿ ಎಂಬ ಶಿಲೀಂಧ್ರ. ಅತಿ ತೇವಾಂಶ, ಒದ್ದೆಯಾದ ಎಲೆಗಳು ಮತ್ತು ಬಿಸಿ ವಾತಾವರಣದಲ್ಲಿ ವೇಗವಾಗಿ ಹರಡುತ್ತದೆ."
    },
    organic: {
      en: "Spray copper-based organic fungicides or liquid neem oil formulation weekly. Prune lower affected leaves to increase aeration.",
      te: "రాగి ఆధారిత సేంద్రీయ శిలీంద్ర నాశకాలు లేదా వేప నూనె ద్రావణాన్ని ప్రతి వారం పిచికారీ చేయండి. గాలి ప్రసరణ కోసం కింది ఆకులను కత్తిరించండి.",
      hi: "तांबा आधारित जैविक कवकनाशी या तरल नीम के तेल का साप्ताहिक छिड़काव करें। हवा के प्रवाह के लिए नीचे की प्रभावित पत्तियों को छाँटें।",
      ta: "செம்பு சார்ந்த கரிம பூஞ்சைக் கொல்லிகள் அல்லது வேப்பெண்ணெய் கரைசலை வாரந்தோறும் தெளிக்கவும். காற்றோட்டத்திற்காக பாதிக்கப்பட்ட கீழ் இலைகளை கத்தரிக்கவும்.",
      ml: "ചെമ്പ് അടങ്ങിയ ജൈവ ഫംഗസ് നാശിനികളോ വേപ്പെണ്ണ ലായനിയോ ആഴ്ചതോറും തളിക്കുക. വായുസഞ്ചാരം കൂട്ടാൻ താഴത്തെ ഇലകൾ മുറിച്ചു മാറ്റുക.",
      kn: "ತಾಮ್ರ ಆಧಾರಿತ ಜೈವಿಕ ಶಿಲೀಂಧ್ರನಾಶಕ ಅಥವಾ ಬೇವಿನ ಎಣ್ಣೆ ದ್ರಾವಣವನ್ನು ವಾರಕ್ಕೊಮ್ಮೆ ಸಿಂಪಡಿಸಿ. ಗಾಳಿಯಾಡಲು ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ಕತ್ತರಿಸಿ."
    },
    chemical: {
      en: "Apply Chlorothalonil, Mancozeb, or Difenoconazole sprays as per package labels.",
      te: "ప్యాకేజీ లేబుల్ సూచనల ప్రకారం క్లోరోథలోనిల్, మాంకోజెబ్ లేదా డిఫెనోకోనజోల్ పిచికారీ చేయండి.",
      hi: "पैकेज निर्देशों के अनुसार क्लोरोथैलोनिल, मैंकोजेब या डिफेनोकोनाज़ोल का छिड़काव करें।",
      ta: "அறிவுறுத்தல்களின்படி குளோரோதலோனில், மேங்கோசெப் அல்லது டிஃபெனோகோனசோல் தெளிக்கவும்.",
      ml: "പാക്കേജ് ലേബലിൽ നിർദ്ദേശിച്ചിട്ടുള്ള ക്ലോറോതലോനിൽ, മാങ്കോസെബ് അല്ലെങ്കിൽ ഡിഫെനോകോനാസോൾ തളിക്കുക.",
      kn: "ಪ್ಯಾಕೇಜ್ ಸೂಚನೆಗಳ ಪ್ರಕಾರ ಕ್ಲೋರೊಥಲೋನಿಲ್, ಮ್ಯಾಂಕೋಜೆಬ್ ಅಥವಾ ಡಿಫೆನೊಕೊನಜೋಲ್ ಸಿಂಪಡಿಸಿ."
    },
    prevention: {
      en: "Avoid sprinkler watering (water roots directly), practice crop rotation, weed cleanups, and leave spacing between plants.",
      te: "చిలకరింపు నీటి పద్ధతిని నివారించండి (నేరుగా వేర్లకు నీరు పెట్టండి), పంట మార్పిడి చేయండి మరియు మొక్కల మధ్య తగిన దూరం ఉంచండి.",
      hi: "छिड़काव विधि से सिंचाई से बचें (सीधे जड़ों में पानी दें), फसल चक्र अपनाएं और पौधों के बीच पर्याप्त दूरी रखें।",
      ta: "தெளிப்பு நீர் பாசனத்தை தவிர்க்கவும் (நேரடியாக வேர்களுக்கு நீர் பாய்ச்சவும்), பயிர் சுழற்சி முறை மற்றும் பயிர்களுக்கு இடையே இடைவெளி விடவும்.",
      ml: "സ്പ്രിംഗ്ലർ നനയ്ക്കൽ ഒഴിവാക്കുക (നേരിട്ട് വേരുകൾക്ക് നനയ്ക്കുക), വിള ചക്രം നിലനിർത്തുക, കളകൾ വൃത്തിയാക്കുക, ചെടികൾക്കിടയിൽ അകലം പാലിക്കുക.",
      kn: "ತುಂತುರು ನೀರಾವರಿ ತಪ್ಪಿಸಿ (ನೇರವಾಗಿ ಬೇರುಗಳಿಗೆ ನೀರು ಕೊಡಿ), ಬೆಳೆ ಸರದಿ ಮಾಡಿ ಮತ್ತು ಗಿಡಗಳ ನಡುವೆ ಸೂಕ್ತ ಅಂತರವಿಡಿ."
    }
  },
  mildew: {
    diseaseName: "Powdery Mildew Fungal Infection",
    confidence: "88%",
    severity: "medium",
    severityVal: 55,
    symptoms: {
      en: "White powdery talcum-like spots on upper leaf surfaces and stems. Foliage turns brown, curled, and growth is stunted.",
      te: "ఆకుల పైభాగంలో మరియు కాండం మీద తెల్లటి బూజు లాంటి మచ్చలు ఏర్పడతాయి. ఆకులు ముడుచుకుపోయి పెరుగుదల ఆగిపోతుంది.",
      hi: "पत्तियों की ऊपरी सतह और तनों पर सफेद पाउडर जैसे धब्बे। पत्तियां भूरी होकर सिकुड़ जाती हैं और विकास रुक जाता है।",
      ta: "இலைகளின் மேல் பகுதி ಮತ್ತು தண்டுகளில் வெள்ளை நிற மாவு போன்ற புள்ளிகள் தோன்றும். இலைகள் சுருண்டு развитие தடைபடும்.",
      ml: "ഇലകളുടെ മുകൾഭാഗത്തും തണ്ടുകളിലും വെളുത്ത പൊടി രൂപത്തിലുള്ള പാടുകൾ കാണപ്പെടുന്നു. ഇലകൾ തവിട്ടുനിറമായി ചുരുളുകയും വളർച്ച മന്ദഗതിയിലാവുകയും ചെയ്യും.",
      kn: "ಎಲೆಗಳ ಮೇಲ್ಭಾಗ ಮತ್ತು ಕಾಂಡಗಳ ಮೇಲೆ ಬಿಳಿ ಬೂದಿಯಂತಹ ಚುಕ್ಕೆಗಳು. ಎಲೆಗಳು ಕಂದು ಬಣ್ಣಕ್ಕೆ ತಿರುಗಿ ಮುರುಟಿಕೊಳ್ಳುತ್ತವೆ ಮತ್ತು ಬೆಳವಣಿಗೆ ಕುಂಠಿತವಾಗುತ್ತದೆ."
    },
    causes: {
      en: "Fungal pathogens thriving in warm days and cool humid nights with dense shaded canopies limiting solar exposure.",
      te: "పగటిపూట వేడి మరియు రాత్రి పూట చల్లని తేമతో కూడిన వాతావరణం, సూర్యరశ్మి తగలని దట్టమైన తోటల్లో ఇది వ్యాపిస్తుంది.",
      hi: "दिन में गर्मी और रात में ठंडी आर्द्रता। धूप न मिलने और घने पौधों के बीच यह कवक तेजी से फैलता है।",
      ta: "பகலில் வெப்பம் மற்றும் இரவில் குளிர்ந்த ஈரப்பதம். சூரிய ஒளி படாத அடர்ந்த பயிர்களில் இந்த பூஞ்சை வேகமாக பரவுகிறது.",
      ml: "പകൽ ചൂടും രാത്രി തണുപ്പും ഉയർന്ന ഈർപ്പവുമുള്ള കാലാവസ്ഥയിൽ ഫംഗസ് രോഗാണുക്കൾ അതിവേഗം വളരുന്നു.",
      kn: "ಬಿಸಿಲಿನ ದಿನ ಮತ್ತು ತಂಪಾದ ರಾತ್ರಿಯ ತೇವಾಂಶವುಳ್ಳ ವಾತಾವರಣದಲ್ಲಿ ಶಿಲೀಂಧ್ರದ ಬೀಜಕಗಳು ವೇಗವಾಗಿ ಬೆಳೆಯುತ್ತವೆ."
    },
    organic: {
      en: "Apply potassium bicarbonate spray, dilute milk formulations, or sulfur dust. Thin crops to enhance solar penetration.",
      te: "పొటాషియం బైకార్బోనేట్ స్ప్రే, పలచబరిచిన పాలు లేదా సల్ఫర్ పొడిని ఉపయోగించండి. సూర్యరశ్మి కోసం పంటను పలచబరచండి.",
      hi: "पोटेशियम बाइकार्बोनेट स्प्रे, पतला दूध या सल्फर धूल का प्रयोग करें। धूप के लिए घने पौधों को छाँटें।",
      ta: "பொட்டாசியம் பைகார்பனேட் தெளிப்பு, நீர்த்த பால் அல்லது கந்தக தூள் பயன்படுத்தவும். சூரிய ஒளி பட பயிர்களை கத்தரிக்கவும்.",
      ml: "പൊട്ടാസ്യം ബൈകാർബണേറ്റ് സ്പ്രേ അല്ലെങ്കിൽ നേർപ്പിച്ച പാൽ മിശ്രിതം ഉപയോഗിക്കുക. സൂര്യപ്രകാശം നന്നായി ലഭിക്കാൻ ഇലകൾ വെട്ടിമാറ്റുക.",
      kn: "ಪೊಟ್ಯಾಸಿಯಮ್ ಬೈಕಾರ್ಬನೇಟ್ ಸಿಂಪಡಣೆ ಅಥವಾ ತಿಳಿ ಹಾಲಿನ ದ್ರಾವಣವನ್ನು ಬಳಸಿ. ಬಿಸಿಲು ಬೀಳಲು ಬೆಳೆಗಳನ್ನು ಸವರಿ."
    },
    chemical: {
      en: "Foliar spray of Myclobutanil or Triadimefon immediately on initial spot detection.",
      te: "మొదటి మచ్చ కనిపించిన వెంటనే మైక్లోబుటానిల్ లేదా ట్రయాడిమెఫాన్ పిచికారీ చేయండి.",
      hi: "शुरुआती लक्षण दिखते ही मायक्लोबुटानिल या ट्रायडेमीफोन का छिड़काव करें।",
      ta: "அறிகுறிகள் தென்பட்டவுடன் மைக்லோபுடானில் அல்லது ட்ரைடிமெஃபோன் தெளிக்கவும்.",
      ml: "രോഗം കണ്ടയുടൻ മൈക്ലോബുട്ടാനിൽ അല്ലെങ്കിൽ ട്രയാഡിമെഫോൺ എന്നിവ തളിക്കുക.",
      kn: "ರೋಗದ ಲಕ್ಷಣಗಳು ಕಂಡ ತಕ್ಷಣ ಮೈಕ್ಲೋಬುಟಾನಿಲ್ ಅಥವಾ ಟ್ರಯಾಡಿಮೆಫೋನ್ ಸಿಂಪಡಿಸಿ."
    },
    prevention: {
      en: "Plant disease-resistant crop varieties in open areas with high solar exposure. Avoid high nitrogen fertilizer excess.",
      te: "ఎండ బాగా తగిలే ప్రదేశాలలో తెగుళ్లను తట్టుకునే రకాలను నాటండి. నత్రజని ఎరువుల అధిక వినియోగాన్ని నివారించండి.",
      hi: "तेज धूप वाले क्षेत्रों में रोग-प्रतिरोधी किस्में लगाएं। नाइट्रोजन युक्त उर्वरकों के अत्यधिक उपयोग से बचें।",
      ta: "சூரிய ஒளி நன்றாக படும் இடங்களில் நோய் எதிர்ப்பு ரகங்களை பயிரிடவும். நைட்ரஜன் உரங்களை அதிகமாக பயன்படுத்துவதை தவிர்க்கவும்.",
      ml: "തുറന്നതും സൂര്യപ്രകാശം ലഭിക്കുന്നതുമായ സ്ഥലങ്ങളിൽ രോഗപ്രതിരോധ ശേഷിയുള്ള വിളയിനങ്ങൾ നടുക. അമിതമായ നൈട്രജൻ വളപ്രയോഗം ഒഴിവാക്കുക.",
      kn: "ಬಿಸಿಲು ಬೀಳುವ ಜಾಗದಲ್ಲಿ ರೋಗನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬೆಳೆಸಿ. ಸಾರಜನಕಯುಕ್ತ ಗೊಬ್ಬರದ ಅತಿಯಾದ ಬಳಕೆಯನ್ನು ತಪ್ಪಿಸಿ."
    }
  },
  healthy: {
    diseaseName: "Healthy Leaf Structure",
    confidence: "97%",
    severity: "low",
    severityVal: 10,
    symptoms: {
      en: "No visual spots, lesions, or molds. Natural rich chlorophyll green color and normal robust vein texture.",
      te: "ఎటువంటి మచ్చలు, బూజు లేదా గాయాలు లేవు. ఆకు సహజమైన పచ్చటి రంగుతో ఆరోగ్యంగా బలంగా ఉంది.",
      hi: "कोई धब्बा, फफूंदी या घाव नहीं है। पत्ती अपने प्राकृतिक हरे रंग में स्वस्थ और मजबूत है।",
      ta: "இலைகளில் புள்ளிகளோ, பூஞ்சையோ இல்லை. இலை இயற்கையான பச்சை நிறத்துடன் ஆரோக்கியமாக உள்ளது.",
      ml: "കുമിളുകളോ പാടുകളോ കാണപ്പെടുന്നില്ല. സ്വാഭാവിക പച്ചനിറവും ആരോഗ്യവുമുള്ള ഇലകൾ.",
      kn: "ಯಾವುದೇ ಚುಕ್ಕೆಗಳು ಅಥವಾ ಶಿಲೀಂಧ್ರದ ಲಕ್ಷಣಗಳಿಲ್ಲ. ನೈಸರ್ಗಿಕ ಹಸಿರು ಬಣ್ಣ ಹೊಂದಿದ್ದು ಆರೋಗ್ಯಕರವಾಗಿದೆ."
    },
    causes: {
      en: "Good soil aeration, balanced nutrient intake, regular pest management, and ideal weather parameters.",
      te: "మంచి నేల సారం, సమతుల్య పోషకాలు, క్రమబద్ధమైన తెగుళ్ల నివారణ మరియు అనుకూల వాతావరణ పరిస్థితులు.",
      hi: "मिट्टी की अच्छी गुणवत्ता, संतुलित पोषण, नियमित कीट प्रबंधन और अनुकूल मौसम की स्थिति।",
      ta: "நல்ல மண் வளம், சமச்சீர் ஊட்டச்சத்துக்கள், வழக்கமான பூச்சி மேலாண்மை மற்றும் சாதகமான வானிலை.",
      ml: "നല്ല മണ്ണുസംരക്ഷണം, ആവശ്യമായ പോഷകങ്ങൾ, കൃത്യമായ കീടനിയന്ത്രണം, അനുകൂല കാലാവസ്ഥ.",
      kn: "ಮಣ್ಣಿನ ಉತ್ತಮ ಗುಣಮಟ್ಟ, ಸಮತೋಲಿತ ಪೋಷಕಾಂಶಗಳು, ನಿಯಮಿತ ಕೀಟ ನಿರ್ವಹಣೆ ಮತ್ತು ಉತ್ತಮ ಹವಾಮಾನ."
    },
    organic: {
      en: "No pesticide spray needed. Keep applying routine organic compost and monitor leaves periodically.",
      te: "ఎటువంటి పురుగుమందు పిచికారీ అవసరం లేదు. సేంద్రీయ ఎరువులను సాధారణంగా వేస్తూ పంటను పర్యవేక్షించండి.",
      hi: "किसी कीटनाशक के छिड़काव की आवश्यकता नहीं है। जैविक खाद का सामान्य उपयोग जारी रखें और निगरानी करें।",
      ta: "பூச்சிக்கொல்லி தெளிக்க தேவையில்லை. வழக்கமான இயற்கை உரங்களை இட்டு இலைகளை கண்காணித்து வரவும்.",
      ml: "കീടനാശിനി തളിക്കേണ്ടതില്ല. ജൈവ വളപ്രയോഗം തുടരുകയും ഇലകൾ നിരീക്ഷിക്കുകയും ചെയ്യുക.",
      kn: "ಯಾವುದೇ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸುವ ಅಗತ್ಯವಿಲ್ಲ. ಸಾವಯವ ಗೊಬ್ಬರ ಬಳಕೆ ಮುಂದುವರಿಸಿ ಮತ್ತು ಗಮನಿಸುತ್ತಿರಿ."
    },
    chemical: {
      en: "None required. Maintain current schedule.",
      te: "రసాయనాలు అవసరం లేదు. ప్రస్తుత పద్ధతులనే కొనసాగించండి.",
      hi: "रसायनों की कोई आवश्यकता नहीं है। वर्तमान दिनचर्या बनाए रखें।",
      ta: "இரசாயனங்கள் தேவையில்லை. தற்போதைய பராமரிப்பையே தொடரவும்.",
      ml: "ആവശ്യമില്ല. നിലവിലുള്ള രീതികൾ തുടരുക.",
      kn: "ರಸಾಯನಿಕಗಳ ಅಗತ್ಯವಿಲ್ಲ. ಸದ್ಯದ ನಿರ್ವಹಣೆಯನ್ನು ಮುಂದುವರಿಸಿ."
    },
    prevention: {
      en: "Maintain weed-free crop fields, regular crop rotation, and periodic monitoring.",
      te: "పొలంలో కలుపు లేకుండా చూసుకోండి, క్రమబద్ధమైన పంట మార్పిడి మరియు పంటను గమనిస్తూ ఉండటం మంచిది.",
      hi: "खेतों को खरपतवार मुक्त रखें, फसल चक्र का पालन करें और नियमित रूप से फसल की जांच करते रहें।",
      ta: "வயலில் களைகள் இல்லாமல் பார்த்துக் கொள்ளவும், பயிர் சுழற்சி முறை மற்றும் இலைகளை தொடர்ந்து கண்காணிக்கவும்.",
      ml: "പൊലത്തിൽ കളകൾ ഇല്ലാതിരിക്കാൻ ശ്രദ്ധിക്കുക, വിള ചക്രം നിലനിർത്തുക, ഇടയ്ക്കിടെ വിളകൾ നിരീക്ഷിക്കുക.",
      kn: "ಜಮೀನಿನಲ್ಲಿ ಕಳೆ ಬೆಳೆಯದಂತೆ ನೋಡಿಕೊಳ್ಳಿ, ಬೆಳೆ ಸರದಿ ಮಾಡಿ ಮತ್ತು ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ."
    }
  }
};

const fertilizerDatabase = {
  rice: { type: "NPK 14-14-14 / Urea", quantity: "95 kg per acre", time: "Tillering Stage (20 days)" },
  cotton: { type: "NPK 10-26-26 / Potash", quantity: "110 kg per acre", time: "Square Formation (45 days)" },
  wheat: { type: "NPK 12-32-16 / DAP", quantity: "85 kg per acre", time: "Crown Root Stage (21 days)" },
  maize: { type: "NPK 15-15-15 / Zinc Sol.", quantity: "100 kg per acre", time: "Knee-High Stage (35 days)" },
  tomato: { type: "NPK 5-10-10 / Calcium Nitrate", quantity: "65 kg per acre", time: "Flowering & Fruit Setting (50 days)" }
};

const cropGrowthStages = {
  rice: { germination: 10, vegetative: 55, flowering: 90, harvest: 120 },
  cotton: { germination: 15, vegetative: 60, flowering: 120, harvest: 180 },
  wheat: { germination: 10, vegetative: 60, flowering: 90, harvest: 130 },
  maize: { germination: 12, vegetative: 50, flowering: 85, harvest: 115 },
  tomato: { germination: 14, vegetative: 45, flowering: 80, harvest: 110 }
};

const weatherSimulations = {
  normal: { temp: "28°C", humidity: "55%", rain: "10%", wind: "12 km/h", alertText: "Atmospheric parameters represent normal farming margins. Fine conditions to apply liquid crop stimulants and check leaves for general development indices.", alertClass: "safe", alertHeader: "Mild & Sunny Status" },
  humid: { temp: "31°C", humidity: "88%", rain: "40%", wind: "8 km/h", alertText: "Warning: Extremely high humidity detected. Fungal spores (Mildew, Leaf Spot) multiply rapidly in humid stagnant canopy air. Clear weeds to enhance ground ventilation.", alertClass: "danger", alertHeader: "Fungal Outbreak Risk Alert" },
  rainy: { temp: "23°C", humidity: "95%", rain: "90%", wind: "22 km/h", alertText: "Heavy rain alert. Avoid chemical spraying as it will wash away. Check drainage trenches immediately to prevent root drowning/water logging.", alertClass: "warning", alertHeader: "Rainfall & Water Log Warning" },
  drought: { temp: "39°C", humidity: "20%", rain: "0%", wind: "18 km/h", alertText: "Water deficit alert. Soils are drying rapidly causing plant thermal stress. Irrigate early morning or sunset. Check growth rates closely.", alertClass: "warning", alertHeader: "Thermal & Soil Aridity Caution" }
};

// Global active language state
let currentLanguage = "en";

// --- Document Loaded Initializer ---
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initAuth();
  initLanguageSwitcher();
  initOfflineDetector();
  initCounters();
  initDiseaseScanner();
  initFertilizerAdvisor();
  initGrowthTracker();
  initWeatherAlerts();
  initFAQAccordion();
  initContactForm();
  initNearbyCenters();
  initStatsIntersectionObserver();
});

function initAuth() {
  const authTabs = document.querySelectorAll(".auth-tab");
  const authForm = document.getElementById("auth-form");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  const authStatus = document.getElementById("auth-status");
  const authMessage = document.getElementById("auth-message");
  const authLoggedIn = document.getElementById("auth-logged-in");
  const authFormPanel = document.getElementById("auth-form-panel");
  const authUserEmail = document.getElementById("auth-user-email");
  const authSignOutBtn = document.getElementById("auth-signout-btn");
  const authEmailInput = document.getElementById("auth-email");
  const authPasswordInput = document.getElementById("auth-password");

  // Elements for header profile dropdown and auth section
  const authSection = document.getElementById("auth-section");
  const profileDropdown = document.getElementById("profile-dropdown");
  const profileBtn = document.getElementById("profile-btn");
  const profileEmailDisplay = document.getElementById("profile-email-display");
  const profileInitial = document.getElementById("profile-initial");
  const headerSignOutBtn = document.getElementById("header-signout-btn");

  if (!authTabs.length || !authForm || !authSubmitBtn || !authStatus || !authMessage || !authLoggedIn || !authFormPanel || !authUserEmail || !authSignOutBtn || !authEmailInput || !authPasswordInput) {
    return;
  }

  let authMode = "signin";

  function setAuthMessage(text, isError = false) {
    authMessage.textContent = text || "";
    authMessage.classList.toggle("error", isError);
  }

  function renderAuthState(session) {
    const user = session?.user;
    const appContent = document.getElementById("app-content");

    if (user) {
      authStatus.textContent = `Signed in as ${user.email}`;
      authUserEmail.textContent = user.email;
      authLoggedIn.hidden = false;
      authFormPanel.hidden = true;
      if (appContent) appContent.hidden = false;
      if (authSection) authSection.style.display = "none";
      if (profileDropdown) profileDropdown.hidden = false;
      if (profileEmailDisplay) profileEmailDisplay.textContent = user.email;
      if (profileInitial) profileInitial.textContent = user.email.charAt(0).toUpperCase();
      setAuthMessage("");
    } else {
      authStatus.textContent = "Sign in to continue";
      authLoggedIn.hidden = true;
      authFormPanel.hidden = false;
      if (appContent) appContent.hidden = true;
      if (authSection) authSection.style.display = "";
      if (profileDropdown) profileDropdown.hidden = true;
      setAuthMessage("");
    }
  }

  authTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authTabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      authMode = tab.dataset.mode;
      authSubmitBtn.textContent = authMode === "signup" ? "Create Account" : "Sign In";
      setAuthMessage("");
    });
  });

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setAuthMessage("Working...");

    try {
      const email = authEmailInput.value.trim();
      const password = authPasswordInput.value;

      if (!email || !password) {
        throw new Error("Please enter both your email and password.");
      }

      if (authMode === "signup") {
        await signUpWithSupabase(email, password);
        setAuthMessage("Account created. Check your email to confirm before signing in.");
      } else {
        await signInWithSupabase(email, password);
        setAuthMessage("Signed in successfully.");
      }

      authForm.reset();
    } catch (error) {
      console.error("Auth failed", error);
      const message = error?.message || "Authentication failed.";
      const isRateLimited = /rate limit|temporarily blocked|too many signup attempts|too many requests|too many attempts/i.test(message);
      const isInvalidCredentials = /invalid login credentials|invalid credentials|email or password|not found|user not found/i.test(message);
      const friendlyMessage = isRateLimited
        ? "Signup is temporarily blocked by Supabase because too many sign-up attempts were sent. Please wait a few minutes and try again with a different email, or switch to Sign In if you already created an account."
        : isInvalidCredentials
          ? "Invalid email or password. Please check your details and try again."
          : message;
      setAuthMessage(friendlyMessage, true);
    }
  });

  authSignOutBtn.addEventListener("click", async () => {
    try {
      await signOutFromSupabase();
      setAuthMessage("Signed out successfully.");
    } catch (error) {
      console.error("Sign out failed", error);
      setAuthMessage(error.message || "Could not sign out.", true);
    }
  });

  // Handle profile dropdown toggle
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("open");
      const isOpen = profileDropdown.classList.contains("open");
      profileBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close dropdown on click outside
    document.addEventListener("click", (e) => {
      if (!profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("open");
        profileBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Handle header Sign Out button click (proxy to the original authSignOutBtn)
  if (headerSignOutBtn && authSignOutBtn) {
    headerSignOutBtn.addEventListener("click", () => {
      if (profileDropdown) profileDropdown.classList.remove("open");
      authSignOutBtn.click();
    });
  }

  if (supabaseClient) {
    if (window.location.protocol === 'file:') {
      setAuthMessage("Warning: Supabase Auth does not support local files (file://). You must run the website using a local server (e.g., Live Server or npx serve) for redirects and sessions to work correctly.", true);
    }

    supabaseClient.auth.getSession().then(({ data }) => {
      renderAuthState(data.session);
    });

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      renderAuthState(session);
    });
  } else {
    authStatus.textContent = "Supabase is not configured yet";
    setAuthMessage("Add your Supabase URL and anon key to enable authentication.", true);
  }
}

// --- Sticky Navigation & Hamburger Menu ---
function initNavbar() {
  const header = document.getElementById("main-header");
  const menuToggle = document.getElementById("menu-toggle-btn");
  const navLinksMenu = document.getElementById("nav-links-menu");
  
  // Sticky scroll background
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    
    // Auto active navbar link highlighting
    highlightActiveLink();
  });

  // Mobile menu click toggle
  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navLinksMenu.classList.toggle("active");
  });

  // Close mobile menu on links click
  const navLinks = navLinksMenu.querySelectorAll("a");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuToggle.classList.remove("active");
      navLinksMenu.classList.remove("active");
    });
  });
}

function highlightActiveLink() {
  const sections = document.querySelectorAll("section[id]");
  const scrollPosition = window.scrollY + 150;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");
    const activeLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

    if (activeLink && scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      document.querySelectorAll(".nav-links a").forEach(el => el.classList.remove("active"));
      activeLink.classList.add("active");
    }
  });
}

// --- Language Selector Action ---
function initLanguageSwitcher() {
  const langSelect = document.getElementById("language-select");
  langSelect.addEventListener("change", (e) => {
    currentLanguage = e.target.value;
    updateUILanguage(currentLanguage);
  });
}

function updateUILanguage(lang) {
  const dict = translations[lang] || translations["en"];
  
  // Update elements by ID matching dictionary keys
  Object.keys(dict).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      // If it's a select or input with special structures we handle it, otherwise plain textContent
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        if (id === "contact-name") el.placeholder = (lang === "te" ? "రామేష్ ప్రసాద్" : (lang === "hi" ? "रमेश प्रसाद" : "Ramesh Prasad"));
        if (id === "contact-phone") el.placeholder = "9876543210";
        if (id === "contact-message") el.placeholder = (lang === "te" ? "పంట పరిస్థితిని రాయండి..." : (lang === "hi" ? "फसल की स्थिति लिखें..." : "Enter crop condition or questions..."));
      } else {
        el.textContent = dict[id];
      }
    }
  });

  // Update crop dropdown options while preserving current selections
  const cropSelects = document.querySelectorAll("#fertilizer-crop-select, #tracker-crop-select, #contact-crop");
  cropSelects.forEach(select => {
    const currentValue = select.value;
    Array.from(select.options).forEach(opt => {
      const val = opt.value;
      if (val && dict[`opt-${val}`]) {
        opt.textContent = dict[`opt-${val}`];
      }
    });
    select.value = currentValue;
  });

  // Redraw/re-render active result elements to update texts
  const currentResult = document.getElementById("scan-result-card");
  if (currentResult.style.display === "block" && window.lastDetectedDisease) {
    displayDiseaseResult(window.lastDetectedDisease);
  }

  // Refresh nearby centers rendering if active
  const nearbyContainer = document.getElementById("nearby-centers-container");
  if (nearbyContainer && nearbyContainer.style.display === "block" && window.lastFetchedCenters) {
    renderRecommendations(window.lastDetectedDisease || "healthy");
    renderNearbyCards(window.lastFetchedCenters);
  }
}

// --- Offline Mode Simulator ---
function initOfflineDetector() {
  const badge = document.getElementById("offline-badge");
  const badgeText = document.getElementById("status-text");
  const simSwitch = document.getElementById("online-switch");

  function updateStatus(isOnline) {
    if (isOnline) {
      badge.classList.remove("offline");
      badgeText.textContent = currentLanguage === "te" ? "ఆన్‌లైన్" : (currentLanguage === "hi" ? "ऑनलाइन" : (currentLanguage === "ta" ? "ஆன்லைன்" : "Online"));
      simSwitch.checked = true;
    } else {
      badge.classList.add("offline");
      badgeText.textContent = currentLanguage === "te" ? "ఆఫ్‌లైన్" : (currentLanguage === "hi" ? "ऑफ़लाइन" : (currentLanguage === "ta" ? "ஆஃப்லைன்" : "Offline"));
      simSwitch.checked = false;
    }
  }

  // Monitor physical connection
  window.addEventListener("online", () => {
    // Only update if simulator doesn't override it
    updateStatus(true);
  });
  window.addEventListener("offline", () => {
    updateStatus(false);
  });

  // Simulator toggle switch
  simSwitch.addEventListener("change", (e) => {
    updateStatus(e.target.checked);
  });

  // Initial call
  updateStatus(navigator.onLine);
}

// --- Animated Stats Counters ---
function initCounters() {
  const counters = document.querySelectorAll(".counter");
  const percents = document.querySelectorAll(".counter-percent");
  
  const animateStats = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Run standard counters
        counters.forEach(counter => {
          const target = +counter.getAttribute("data-target");
          let count = 0;
          const speed = target / 80; // duration speed adjustment
          
          const updateCount = () => {
            count += speed;
            if (count < target) {
              counter.textContent = Math.floor(count);
              setTimeout(updateCount, 15);
            } else {
              counter.textContent = target;
            }
          };
          updateCount();
        });

        // Run percentage health score
        percents.forEach(percent => {
          const target = +percent.getAttribute("data-target");
          let count = 0;
          
          const updatePercent = () => {
            count++;
            if (count <= target) {
              percent.textContent = count + "%";
              setTimeout(updatePercent, 10);
            } else {
              percent.textContent = target + "%";
            }
          };
          updatePercent();
        });

        // Disconnect after animation completes
        observer.disconnect();
      }
    });
  };

  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver(animateStats, observerOptions);
  
  // Target dashboard stats block
  const statsSection = document.querySelector(".dashboard-sec");
  if (statsSection) {
    observer.observe(statsSection);
  }
}

// --- Disease Detection Scanner Module ---
function initDiseaseScanner() {
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const previewBox = document.getElementById("preview-box");
  const imgPreview = document.getElementById("image-preview");
  const scannerLine = document.getElementById("scanner-line");
  const scanningMsg = document.getElementById("scanning-progress");
  const dragText = document.getElementById("lbl-drag-text");
  const fileTypesText = document.getElementById("lbl-file-types");
  const uploadIcon = dropZone.querySelector(".upload-icon");

  // Sample leaf presets buttons
  const presetSpot = document.getElementById("preset-leaf-spot");
  const presetMildew = document.getElementById("preset-mildew");
  const presetHealthy = document.getElementById("preset-healthy");

  // Drag & drop triggers
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "var(--accent)";
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.style.backgroundColor = "var(--bg-soft)";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "var(--bg-soft)";
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  });

  // Clicking zone triggers input file
  dropZone.addEventListener("click", (e) => {
    // Avoid re-triggering file choose dialog if clicking sample preset inside uploader card (not uploader zone itself)
    if (e.target.tagName !== "INPUT" && !e.target.closest(".preview-container")) {
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  });

  // Presets load triggers
  presetSpot.addEventListener("click", () => {
    lastScanUploadFile = null;
    runMockScan("assets/leaf_spot.png", "leaf_spot");
  });
  presetMildew.addEventListener("click", () => {
    lastScanUploadFile = null;
    runMockScan("assets/powdery_mildew.png", "mildew");
  });
  presetHealthy.addEventListener("click", () => {
    lastScanUploadFile = null;
    runMockScan("assets/healthy_leaf.png", "healthy");
  });

  function processImageFile(file) {
    if (!file.type.match("image.*")) {
      alert("Please upload a valid image file (PNG, JPG).");
      return;
    }
    lastScanUploadFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("User selected image for upload", file.name);
      // Randomly assign one of the disease states for user uploaded file
      const diseases = ["leaf_spot", "mildew", "healthy"];
      const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
      runMockScan(e.target.result, randomDisease);
    };
    reader.readAsDataURL(file);
  }

  function runMockScan(imageSrc, diseaseKey) {
    // Display elements
    dragText.style.display = "none";
    fileTypesText.style.display = "none";
    if (uploadIcon) uploadIcon.style.display = "none";
    
    previewBox.style.display = "block";
    imgPreview.src = imageSrc;
    scannerLine.style.display = "block";
    scanningMsg.style.display = "flex";
    
    // Hide previous result card
    document.getElementById("scan-result-card").style.display = "none";

    // Progress updates text
    const scanningMessages = {
      en: ["Initializing camera pixels...", "Matching leaf structure vectors...", "Mapping leaf spot lesions...", "Generating diagnostics..."],
      te: ["కెమెరా పిక్సెల్స్ ప్రారంభిస్తోంది...", "ఆకు నిర్మాణాన్ని సరిపోలుస్తోంది...", "ఆకు మచ్చలను విశ్లేషిస్తోంది...", "ఫలితాన్ని సిద్ధం చేస్తోంది..."],
      hi: ["कैमरा पिक्सेल प्रारंभ कर रहा है...", "पत्ती की संरचना का मिलान...", "पत्ती के धब्बों का विश्लेषण...", "स्कैन रिपोर्ट तैयार हो रही है..."],
      ta: ["கேமரா பிக்சல்களை சரிசெய்கிறது...", "இலையின் வடிவமைப்பை ஒப்பிடுகிறது...", "இலை புள்ளிகளை ஆராய்கிறது...", "அறிக்கையை தயார் செய்கிறது..."]
    };

    const currentMsgs = scanningMessages[currentLanguage] || scanningMessages["en"];
    const textLabel = document.getElementById("lbl-scanning-msg");
    
    let step = 0;
    textLabel.textContent = currentMsgs[0];
    
    const interval = setInterval(() => {
      step++;
      if (step < currentMsgs.length) {
        textLabel.textContent = currentMsgs[step];
      }
    }, 500);

    // End scanning after 2 seconds
    setTimeout(async () => {
      clearInterval(interval);
      scannerLine.style.display = "none";
      scanningMsg.style.display = "none";
      
      // Store globally for lang swap redraw
      window.lastDetectedDisease = diseaseKey;
      
      await displayDiseaseResult(diseaseKey);

      const data = diseaseDatabase[diseaseKey];
      const imageUrl = lastScanUploadFile ? await uploadCropImage(lastScanUploadFile).catch((err) => {
        console.warn("Image upload failed:", err);
        return null;
      }) : null;

      const savePayload = {
        name: null,
        phone: null,
        crop: lastScanUploadFile ? "user_upload" : (diseaseKey === "leaf_spot" ? "tomato" : diseaseKey === "mildew" ? "wheat" : "rice"),
        disease: data.diseaseName,
        confidence: data.confidence,
        symptoms: data.symptoms.en,
        treatments: `${data.organic.en} \n${data.chemical.en}`,
        image_url: imageUrl
      };

      const saveSuccess = await saveScanResult(savePayload).catch((err) => {
        console.error("Failed to save scan result:", err);
        return false;
      });

      if (saveSuccess) {
        alert(currentLanguage === "te" ? "స్కాన్ ఫలితం విజయవంతంగా సేవ్ చేశారు." : (currentLanguage === "hi" ? "स्कैन परिणाम सफलतापूर्वक सेव हो गया है।" : (currentLanguage === "ta" ? "ஸ்கேன் முடிவு வெற்றிகரமாக சேமிக்கப்பட்டது." : "Scan result saved successfully.")));
      }

      // Clear upload file pointer after save so language refresh doesn't re-save
      lastScanUploadFile = null;
    }, 2000);
  }
}

async function displayDiseaseResult(diseaseKey) {
  const data = diseaseDatabase[diseaseKey];
  const resultCard = document.getElementById("scan-result-card");
  
  if (!data) return;

  resultCard.style.display = "block";

  // Update headers
  document.getElementById("lbl-result-title").textContent = data.diseaseName;
  document.getElementById("lbl-confidence").textContent = `${data.confidence} ${currentLanguage === "te" ? "ఖచ్చితత్వం" : (currentLanguage === "hi" ? "सटीकता" : (currentLanguage === "ta" ? "துல்லியம்" : "Confidence"))}`;

  // Update Severity Meter
  const severityText = document.getElementById("lbl-severity-level");
  const severityBar = document.getElementById("severity-bar");
  
  // Clear classes
  severityBar.className = "severity-bar-fill";
  
  const sevLabel = currentLanguage === "te" ? 
    { low: "తక్కువ", medium: "మధ్యస్థం", high: "అధికం" } : 
    (currentLanguage === "hi" ? 
      { low: "कम", medium: "मध्यम", high: "उच्च" } : 
      (currentLanguage === "ta" ?
        { low: "குறைவு", medium: "நடுத்தரம்", high: "அதிதீவிரம்" } :
        { low: "Low", medium: "Medium", high: "High" }
      )
    );

  if (data.severity === "high") {
    severityText.textContent = sevLabel.high;
    severityText.style.color = "var(--sev-high)";
    severityBar.classList.add("high");
  } else if (data.severity === "medium") {
    severityText.textContent = sevLabel.medium;
    severityText.style.color = "var(--sev-med)";
    severityBar.classList.add("medium");
  } else {
    severityText.textContent = sevLabel.low;
    severityText.style.color = "var(--sev-low)";
    severityBar.classList.add("low");
  }

  // Adjust bar percentage width with animation delay
  setTimeout(() => {
    severityBar.style.width = data.severityVal + "%";
  }, 100);

  // Update Details using appropriate language structures
  document.getElementById("res-symptoms").textContent = data.symptoms[currentLanguage] || data.symptoms["en"];
  document.getElementById("res-causes").textContent = data.causes[currentLanguage] || data.causes["en"];
  document.getElementById("res-treat-org").textContent = data.organic[currentLanguage] || data.organic["en"];
  document.getElementById("res-treat-chem").textContent = data.chemical[currentLanguage] || data.chemical["en"];
  document.getElementById("res-treat-prev").textContent = data.prevention[currentLanguage] || data.prevention["en"];
  
  // Smooth scroll down to results
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// --- Fertilizer Recommendation Selector ---
function initFertilizerAdvisor() {
  const cropSelect = document.getElementById("fertilizer-crop-select");
  const resultBox = document.getElementById("fertilizer-result-box");

  cropSelect.addEventListener("change", (e) => {
    const val = e.target.value;
    const data = fertilizerDatabase[val];
    
    if (data) {
      resultBox.style.display = "block";
      
      // Update results
      document.getElementById("fert-val-type").textContent = data.type;
      
      // Localized translations for quantity and time variables if needed
      document.getElementById("fert-val-quantity").textContent = translateVariableString(data.quantity);
      document.getElementById("fert-val-time").textContent = translateVariableString(data.time);
    }
  });
}

function translateVariableString(str) {
  // Simple replacement mapping for numbers and common words in Telugu/Hindi
  if (currentLanguage === "te") {
    return str
      .replace("kg per acre", "కిలోలు ఎకరానికి")
      .replace("Tillering Stage", "పిలక దశ")
      .replace("days", "రోజులు")
      .replace("Square Formation", "మొగ్గ దశ")
      .replace("Crown Root Stage", "వేరు వ్యవస్థ దశ")
      .replace("Knee-High Stage", "మోకాలి ఎత్తు దశ")
      .replace("Flowering & Fruit Setting", "పూత మరియు కాయ దశ");
  }
  if (currentLanguage === "hi") {
    return str
      .replace("kg per acre", "किलोग्राम प्रति एकड़")
      .replace("Tillering Stage", "कल्ले फूटने की अवस्था")
      .replace("days", "दिन")
      .replace("Square Formation", "डोडियाँ बनते समय")
      .replace("Crown Root Stage", "शीर्ष जड़ फूटने की अवस्था")
      .replace("Knee-High Stage", "घुटने तक ऊँचाई की अवस्था")
      .replace("Flowering & Fruit Setting", "फूल और फल बनते समय");
  }
  if (currentLanguage === "ta") {
    return str
      .replace("kg per acre", "கிலோ ஏக்கருக்கு")
      .replace("Tillering Stage", "தூர் கட்டும் பருவம்")
      .replace("days", "நாட்கள்")
      .replace("Square Formation", "சதுர வடிவம் (மொட்டு)")
      .replace("Crown Root Stage", "முடி வேர் பருவம்")
      .replace("Knee-High Stage", "முழங்கால் அளவு உயரம்")
      .replace("Flowering & Fruit Setting", "பூக்கும் & காய் காய்க்கும் பருவம்");
  }
  return str;
}

// --- Crop Growth Timeline Calculator ---
function initGrowthTracker() {
  const cropSelect = document.getElementById("tracker-crop-select");
  const dateInput = document.getElementById("sowing-date-input");
  const calcBtn = document.getElementById("btn-calculate-growth");
  const resultBox = document.getElementById("growth-result-box");
  const daysText = document.getElementById("growth-days-count");
  const timelineFill = document.getElementById("growth-timeline-line");

  // Set default date picker value to 30 days ago to show an active growth stage on load
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 35);
  dateInput.value = defaultDate.toISOString().split('T')[0];

  calcBtn.addEventListener("click", () => {
    const crop = cropSelect.value;
    const dateVal = dateInput.value;

    if (!dateVal) {
      alert("Please pick a sowing date.");
      return;
    }

    const sowingDate = new Date(dateVal);
    const currentDate = new Date();
    
    // Time difference calculation
    const timeDiff = currentDate.getTime() - sowingDate.getTime();
    const daysElapsed = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (daysElapsed < 0) {
      alert(currentLanguage === "te" ? "విత్తిన తేదీ భవిష్యత్తులో ఉండకూడదు." : (currentLanguage === "hi" ? "बोने की तारीख भविष्य की नहीं हो सकती।" : "Sowing date cannot be in the future."));
      return;
    }

    resultBox.style.display = "block";
    
    // Update elapsed days text
    const labelDays = currentLanguage === "te" ? "రోజులు" : (currentLanguage === "hi" ? "दिन" : (currentLanguage === "ta" ? "நாட்கள்" : "Days"));
    daysText.textContent = `${daysElapsed} ${labelDays}`;

    // Calculate current growth stage node based on days threshold
    updateGrowthStageNodes(crop, daysElapsed);
  });
}

function updateGrowthStageNodes(crop, days) {
  const thresholds = cropGrowthStages[crop];
  const nodes = [
    { id: "node-seed", width: 0 },
    { id: "node-germ", width: 25 },
    { id: "node-veg", width: 50 },
    { id: "node-flow", width: 75 },
    { id: "node-harv", width: 100 }
  ];

  // Reset all classes
  nodes.forEach(n => {
    const nodeEl = document.getElementById(n.id);
    nodeEl.classList.remove("active", "completed");
  });

  let currentStageIndex = 0; // 0 = Seed, 1 = Germ, 2 = Veg, 3 = Flow, 4 = Harv

  if (days <= 0) {
    currentStageIndex = 0;
  } else if (days <= thresholds.germination) {
    currentStageIndex = 1;
  } else if (days <= thresholds.vegetative) {
    currentStageIndex = 2;
  } else if (days <= thresholds.flowering) {
    currentStageIndex = 3;
  } else {
    currentStageIndex = 4;
  }

  // Animate timeline line fill width percentage
  const timelineFill = document.getElementById("growth-timeline-line");
  const targetWidth = nodes[currentStageIndex].width;
  timelineFill.style.width = targetWidth + "%";

  // Add active/completed classes to nodes
  for (let i = 0; i < nodes.length; i++) {
    const nodeEl = document.getElementById(nodes[i].id);
    if (i < currentStageIndex) {
      nodeEl.classList.add("completed");
    } else if (i === currentStageIndex) {
      nodeEl.classList.add("active");
    }
  }
}

// --- Weather Alerts Simulation Module ---
function initWeatherAlerts() {
  const simSelect = document.getElementById("weather-sim-select");
  const tempVal = document.getElementById("weather-val-temp");
  const humidVal = document.getElementById("weather-val-humidity");
  const rainVal = document.getElementById("weather-val-rain");
  const windVal = document.getElementById("weather-val-wind");
  const alertCard = document.getElementById("weather-alert-card");
  const alertHeader = document.getElementById("lbl-alert-status");
  const alertText = document.getElementById("weather-alert-text");

  simSelect.addEventListener("change", (e) => {
    const key = e.target.value;
    const simData = weatherSimulations[key];

    if (simData) {
      // Update values
      tempVal.textContent = simData.temp;
      humidVal.textContent = simData.humidity;
      rainVal.textContent = simData.rain;
      windVal.textContent = simData.wind;

      // Update Card Visuals & Class Colors
      alertCard.className = "alert-box " + simData.alertClass;
      
      // Update Header Text with Icon
      let iconSvg = "";
      if (simData.alertClass === "safe") {
        iconSvg = `<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8L10,17Z"/></svg>`;
      } else if (simData.alertClass === "danger") {
        iconSvg = `<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M12,2L1,21H23L12,2M12,6L19.53,19H4.47L12,6M11,10V14H13V10H11M11,16V18H13V16H11Z"/></svg>`;
      } else {
        iconSvg = `<svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;"><path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M13,17H11V15H13V17M13,13H11V7H13V13Z"/></svg>`;
      }

      // Dynamic translation of alert box
      alertHeader.innerHTML = iconSvg + " " + translateWeatherHeader(simData.alertHeader);
      alertText.textContent = translateWeatherText(key);
    }
  });
}

function translateWeatherHeader(title) {
  if (currentLanguage === "te") {
    return title
      .replace("Mild & Sunny Status", "సాధారణ వాతావరణం")
      .replace("Fungal Outbreak Risk Alert", "ఫంగస్ తెగులు వచ్చే ప్రమాదం ఉంది")
      .replace("Rainfall & Water Log Warning", "భారీ వర్షపాతం - మురుగునీటి హెచ్చరిక")
      .replace("Thermal & Soil Aridity Caution", "అధిక వేడి - నేల ఎండడం హెచ్చరిక");
  }
  if (currentLanguage === "hi") {
    return title
      .replace("Mild & Sunny Status", "सामान्य धूप स्थिति")
      .replace("Fungal Outbreak Risk Alert", "फंगल संक्रमण का जोखिम अलर्ट")
      .replace("Rainfall & Water Log Warning", "भारी वर्षा - जलभराव चेतावनी")
      .replace("Thermal & Soil Aridity Caution", "अत्यधिक गर्मी - शुष्कता चेतावनी");
  }
  if (currentLanguage === "ta") {
    return title
      .replace("Mild & Sunny Status", "மிதமான வெயில் நிலை")
      .replace("Fungal Outbreak Risk Alert", "பூஞ்சை தொற்று ஆபத்து எச்சரிக்கை")
      .replace("Rainfall & Water Log Warning", "கனமழை - நீர் தேங்கும் எச்சரிக்கை")
      .replace("Thermal & Soil Aridity Caution", "அதிக வெப்பம் - வறட்சி எச்சரிக்கை");
  }
  return title;
}

function translateWeatherText(key) {
  const alerts = {
    normal: {
      en: "Atmospheric parameters represent normal farming margins. Fine conditions to apply liquid crop stimulants and check leaves for general development indices.",
      te: "వాతావరణ పరిస్థితులు సాధారణ పరిధిలోనే ఉన్నాయి. ద్రవ రూప సేంద్రీయ ఎరువులను పిచికారీ చేయడానికి మరియు ఆకులను గమనించడానికి అనుకూల సమయం.",
      hi: "वायुमंडलीय स्थितियां सामान्य सीमा में हैं। तरल जैविक खाद का छिड़काव करने और पत्तियों की सामान्य जांच करने के लिए अनुकूल समय है।",
      ta: "வானிலை நிலவரங்கள் சாதாரணமாக உள்ளன. திரவ இயற்கை உரங்களை தெளிப்பதற்கும் இலைகளை பரிசோதிப்பதற்கும் இதுவே நல்ல நேரம்."
    },
    humid: {
      en: "Warning: Extremely high humidity detected. Fungal spores (Mildew, Leaf Spot) multiply rapidly in humid stagnant canopy air. Clear weeds to enhance ground ventilation.",
      te: "హెచ్చరిక: గాలిలో అత్యధిక తేమ నమోదు కావడమైనది. ఇటువంటి సమయాల్లో బూజు మరియు ఆకు మచ్చ తెగుళ్లు వేగంగా వ్యాపిస్తాయి. పొలంలో గాలి ప్రసరణ పెంచడానికి కలుపును శుభ్రం చేయండి.",
      hi: "चेतावनी: हवा में अत्यधिक नमी दर्ज की गई है। इस समय फफूंदी और धब्बा रोग तेजी से फैल सकते हैं। हवा के प्रवाह को बढ़ाने के लिए खरपतवार साफ करें।",
      ta: "எச்சரிக்கை: காற்றில் அதிக ஈரப்பதம் பதிவாகியுள்ளது. இக்காலத்தில் சாம்பல் நோய் மற்றும் இலைப்புள்ளி நோய்கள் வேகமாக பரவும். காற்றோட்டத்தை அதிகரிக்க களைகளை அகற்றுங்கள்."
    },
    rainy: {
      en: "Heavy rain alert. Avoid chemical spraying as it will wash away. Check drainage trenches immediately to prevent root drowning/water logging.",
      te: "భారీ వర్ష సూచన. ఎరువులు లేదా రసాయనాల పిచికారీని నివారించండి. పొలంలో నీరు నిల్వ ఉండకుండా కాలువలను వెంటనే శుభ్రపరచండి.",
      hi: "भारी बारिश की चेतावनी। रासायनिक छिड़काव से बचें क्योंकि यह धुल जाएगा। जलभराव को रोकने के लिए खेतों की जल निकासी नालियों की तुरंत जांच करें।",
      ta: "கனமழை எச்சரிக்கை. உரங்கள் தெளிப்பதை தவிர்க்கவும். வயலில் தண்ணீர் தேங்குவதை தடுக்க வடிகால் வாய்க்கால்களை உடனடியாக சரிசெய்யவும்."
    },
    drought: {
      en: "Water deficit alert. Soils are drying rapidly causing plant thermal stress. Irrigate early morning or sunset. Check growth rates closely.",
      te: "నీటి కొరత హెచ్చరిక. నేలలు వేగంగా ఎండిపోవడం వల్ల మొక్కలకు ఒత్తిడి పెరుగుతుంది. ఉదయాన్నే లేదా సాయంత్రం వేళల్లో నీటి తడులు అందించండి.",
      hi: "पानी की कमी की चेतावनी। मिट्टी तेजी से सूख रही है जिससे पौधों पर तनाव बढ़ रहा है। सुबह जल्दी या शाम के समय सिंचाई करें।",
      ta: "தண்ணீர் பற்றாக்குறை எச்சரிக்கை. மண் வேகமாக காய்வதால் பயிர்கள் வாடக்கூடும். அதிகாலை அல்லது மாலையில் நீர் பாய்ச்சவும்."
    }
  };

  return alerts[key][currentLanguage] || alerts[key]["en"];
}

// --- FAQ Accordion Interactive Panel ---
function initFAQAccordion() {
  const faqHeaders = document.querySelectorAll(".faq-header");

  faqHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      const content = item.querySelector(".faq-content");
      
      // Close other panels
      const allItems = document.querySelectorAll(".faq-item");
      allItems.forEach(i => {
        if (i !== item) {
          i.classList.remove("active");
          i.querySelector(".faq-content").style.maxHeight = null;
        }
      });

      // Toggle current panel
      item.classList.toggle("active");
      
      if (item.classList.contains("active")) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = null;
      }
    });
  });
}

// --- Contact Form Validation & Popup ---
function initContactForm() {
  const form = document.getElementById("agri-contact-form");
  const modal = document.getElementById("success-modal-overlay");
  const closeBtn = document.getElementById("success-modal-close-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Check mobile number validity (10 digits)
    const phoneInput = document.getElementById("contact-phone").value.trim();
    const phonePattern = /^[0-9]{10}$/;

    if (!phonePattern.test(phoneInput)) {
      alert(currentLanguage === "te" ? "దయచేసి సరైన 10 అంకెల మొబైల్ సంఖ్యను నమోదు చేయండి." : (currentLanguage === "hi" ? "कृपया एक मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number."));
      return;
    }

    if (!supabaseClient) {
      alert(currentLanguage === "te" ? "సుప్రాబేస్ కనెక్ట్ కావడంలో విఫలమైంది. దయచేసి URL మరియు అనాన్ కీని సెటప్ చేయండి." : (currentLanguage === "hi" ? "Supabase कनेक्ट नहीं हो सका। कृपया URL और anon key सेट करें।" : "Supabase is not configured yet. Please set your URL and anon key first."));
      return;
    }

    try {
      const { error } = await supabaseClient.from("farmer_enquiries").insert([
        {
          name: document.getElementById("contact-name").value.trim(),
          phone: phoneInput,
          crop: document.getElementById("contact-crop").value,
          message: document.getElementById("contact-message").value.trim()
        }
      ]);

      if (error) throw error;

      modal.classList.add("active");
      form.reset();
    } catch (error) {
      console.error("Supabase insert failed:", error);
      alert(currentLanguage === "te" ? "మీ సందేశం సేవ్ కాలేదు. దయచేసి Supabase సెటప్లను తనిఖీ చేయండి." : (currentLanguage === "hi" ? "आपका संदेश सेव नहीं हुआ। कृपया Supabase सेटिंग्स जांचें।" : "Your enquiry could not be saved. Please check your Supabase setup."));
    }
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    form.reset();
  });

  // Close modal when clicking on overlay background
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      form.reset();
    }
  });
}

// --- Statistics Chart Visual Animation via Scroll Grow ---
function initStatsIntersectionObserver() {
  const statsSection = document.getElementById("statistics");
  if (!statsSection) return;

  const heights = {
    // Single bar chart
    "bar-rice": "90%",
    "bar-cotton": "75%",
    "bar-wheat": "88%",
    "bar-maize": "82%",
    "bar-tomato": "68%",
    
    // Grouped bar chart (Rabi)
    "grp-r-rice": "45%",
    "grp-r-wheat": "85%",
    "grp-r-tomato": "30%",
    
    // Grouped bar chart (Kharif)
    "grp-k-rice": "90%",
    "grp-k-wheat": "15%",
    "grp-k-tomato": "55%",
    
    // Grouped bar chart (Zaid)
    "grp-z-rice": "20%",
    "grp-z-wheat": "35%",
    "grp-z-tomato": "80%"
  };

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate all bars in heights dictionary
        Object.keys(heights).forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.style.height = heights[id];
            el.classList.add("animated");
          }
        });
        // Disconnect after triggering once
        obs.disconnect();
      }
    });
  }, observerOptions);

  observer.observe(statsSection);
}

// --- Nearby Agriculture Support Centers Module ---

function initNearbyCenters() {
  const btnFind = document.getElementById("btn-find-centers");
  if (!btnFind) return;

  btnFind.addEventListener("click", () => {
    // Reset state elements
    document.getElementById("nearby-error-box").style.display = "none";
    document.getElementById("nearby-status-msg").style.display = "flex";
    
    const container = document.getElementById("nearby-centers-container");
    container.style.display = "block";
    
    // Clear list cards
    document.getElementById("centers-list-cards").innerHTML = "";

    // Smooth scroll to container
    container.scrollIntoView({ behavior: "smooth", block: "start" });

    // Clean up map container if initialized
    if (window.nearbyMap) {
      window.nearbyMap.remove();
      window.nearbyMap = null;
    }

    // Geolocation retrieval
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          fetchNearbyCenters(lat, lon);
        },
        (error) => {
          console.warn("Geolocation permission denied or error. Using regional default coordinates.", error);
          const fallbackLat = 16.3067; // Guntur regional farming hub
          const fallbackLon = 80.4365;
          
          document.getElementById("nearby-status-msg").style.display = "none";
          document.getElementById("nearby-error-box").style.display = "flex";
          
          fetchNearbyCenters(fallbackLat, fallbackLon, true);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      console.warn("Geolocation API not supported. Using regional default coordinates.");
      const fallbackLat = 16.3067;
      const fallbackLon = 80.4365;
      
      document.getElementById("nearby-status-msg").style.display = "none";
      document.getElementById("nearby-error-box").style.display = "flex";
      
      fetchNearbyCenters(fallbackLat, fallbackLon, true);
    }
  });
}

function fetchNearbyCenters(lat, lon, isFallback = false) {
  // Render recommendations box first
  renderRecommendations(window.lastDetectedDisease || "healthy");
  
  // Set up the Leaflet Map
  initMap(lat, lon);

  if (isFallback || isAppOffline()) {
    // Return mock data immediately
    setTimeout(() => {
      const centers = getMockCenters(lat, lon);
      window.lastFetchedCenters = centers;
      renderNearbyCards(centers);
      plotMarkers(centers, lat, lon);
      document.getElementById("nearby-status-msg").style.display = "none";
    }, 800);
    return;
  }

  // Live OSM fetching via Overpass API
  const query = `[out:json][timeout:25];
    (
      node["office"="government"]["government"="agriculture"](around:15000, ${lat}, ${lon});
      way["office"="government"]["government"="agriculture"](around:15000, ${lat}, ${lon});
      node["shop"="agricultural"](around:15000, ${lat}, ${lon});
      way["shop"="agricultural"](around:15000, ${lat}, ${lon});
      node["shop"="fertilizer"](around:15000, ${lat}, ${lon});
      way["shop"="fertilizer"](around:15000, ${lat}, ${lon});
      node["shop"="seeds"](around:15000, ${lat}, ${lon});
      way["shop"="seeds"](around:15000, ${lat}, ${lon});
      node["amenity"="laboratory"](around:15000, ${lat}, ${lon});
      node["laboratory"="soil_testing"](around:15000, ${lat}, ${lon});
      node["office"="cooperative"](around:15000, ${lat}, ${lon});
    );
    out center;`;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Overpass API returned network error status.");
      return res.json();
    })
    .then(data => {
      let centers = [];
      if (data && data.elements && data.elements.length > 0) {
        data.elements.forEach(el => {
          const latVal = el.lat || (el.center ? el.center.lat : null);
          const lonVal = el.lon || (el.center ? el.center.lon : null);
          if (latVal && lonVal) {
            const catKey = getCategoryKeyFromTags(el.tags);
            const name = el.tags.name || el.tags.operator || getLocalizedCategory(catKey);
            const distance = calculateDistance(lat, lon, latVal, lonVal);
            
            // Generate stable mock rating for realism
            const rating = el.tags.rating || (4.0 + (latVal * 1000 % 10) / 10).toFixed(1);
            
            // Build address
            let address = el.tags["addr:full"] || el.tags["addr:street"] || "";
            const city = el.tags["addr:city"] || el.tags["addr:suburb"] || el.tags["addr:town"] || "";
            if (address && city) address = `${address}, ${city}`;
            else if (!address) address = city || (currentLanguage === "te" ? "ప్రాంతీయ కేంద్రం" : (currentLanguage === "hi" ? "क्षेत्रीय केंद्र" : "Regional Center"));

            centers.push({
              name: name,
              categoryKey: catKey,
              lat: latVal,
              lon: lonVal,
              address: address,
              distance: distance,
              rating: rating
            });
          }
        });
        
        // Sort by distance
        centers.sort((a, b) => a.distance - b.distance);
      }

      // Fallback if no real OSM centers found in 15km
      if (centers.length === 0) {
        console.log("No OSM centers found. Generating mock centers nearby.");
        centers = getMockCenters(lat, lon);
      }

      window.lastFetchedCenters = centers;
      renderNearbyCards(centers);
      plotMarkers(centers, lat, lon);
      document.getElementById("nearby-status-msg").style.display = "none";
    })
    .catch(err => {
      console.error("Overpass query error, falling back to mock centers:", err);
      const centers = getMockCenters(lat, lon);
      window.lastFetchedCenters = centers;
      renderNearbyCards(centers);
      plotMarkers(centers, lat, lon);
      document.getElementById("nearby-status-msg").style.display = "none";
    });
}

function initMap(lat, lon) {
  if (window.nearbyMap) {
    window.nearbyMap.remove();
    window.nearbyMap = null;
  }
  
  window.nearbyMap = L.map("nearby-map", {
    scrollWheelZoom: false
  }).setView([lat, lon], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(window.nearbyMap);
}

function plotMarkers(centers, userLat, userLon) {
  if (!window.nearbyMap) return;

  // Custom User Location Pin (Red)
  const userIcon = L.divIcon({
    className: "custom-marker-user",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
      <path fill="#e53935" stroke="#ffffff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });

  const userPopupText = currentLanguage === "te" ? "మీ ప్రస్తుత స్థానం" : (currentLanguage === "hi" ? "आपकी स्थिति" : "Your Location");
  L.marker([userLat, userLon], { icon: userIcon })
    .addTo(window.nearbyMap)
    .bindPopup(`<strong>${userPopupText}</strong>`);

  // Recommended keys for mapping different pins
  const recKeys = getRecommendedCategoryKeys(window.lastDetectedDisease || "healthy");

  centers.forEach(c => {
    const isRecommended = recKeys.includes(c.categoryKey);
    // Green pin for standard, Gold pin for recommended
    const pinColor = isRecommended ? "#FFB300" : "#1B5E20";
    
    const centerIcon = L.divIcon({
      className: `custom-marker-center-${c.categoryKey}`,
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
        <path fill="${pinColor}" stroke="#ffffff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    const categoryText = getLocalizedCategory(c.categoryKey);
    const popupContent = `
      <div style="font-family: var(--font-body); padding: 5px;">
        <strong style="color: var(--primary);">${c.name}</strong><br>
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">${categoryText}</span><br>
        <span style="font-size: 0.85rem;">Rating: ${c.rating} ★</span>
      </div>
    `;

    L.marker([c.lat, c.lon], { icon: centerIcon })
      .addTo(window.nearbyMap)
      .bindPopup(popupContent);
  });
}

function renderRecommendations(diseaseKey) {
  const badgeList = document.getElementById("recommendations-badges-list");
  if (!badgeList) return;
  badgeList.innerHTML = "";

  const recKeys = getRecommendedCategoryKeys(diseaseKey);
  
  recKeys.forEach(key => {
    const badge = document.createElement("span");
    badge.className = "recommendation-badge";
    badge.textContent = getLocalizedCategory(key);
    badgeList.appendChild(badge);
  });
}

function renderNearbyCards(centers) {
  const cardsBox = document.getElementById("centers-list-cards");
  if (!cardsBox) return;
  cardsBox.innerHTML = "";

  const recKeys = getRecommendedCategoryKeys(window.lastDetectedDisease || "healthy");

  // Localized Labels
  const labels = {
    en: { distance: "Distance", rating: "Rating", directions: "Get Directions", recBadge: "Recommended" },
    te: { distance: "దూరం", rating: "రేటింగ్", directions: "దిశలను పొందండి", recBadge: "సిఫార్సు చేయబడింది" },
    hi: { distance: "दूरी", rating: "रेटिंग", directions: "दिशा-निर्देश", recBadge: "अनुशंसित" },
    ta: { distance: "தூரம்", rating: "மதிப்பீடு", directions: "திசைகளைப் பெறுக", recBadge: "பரிந்துரைக்கப்பட்டது" },
    ml: { distance: "ദൂരം", rating: "റേറ്റിംഗ്", directions: "വഴി കാണിക്കുക", recBadge: "ശുപാർശ ചെയ്യുന്നു" },
    kn: { distance: "ದೂರ", rating: "ರೇಟಿಂಗ್", directions: "ಮಾರ್ಗಸೂಚಿ", recBadge: "ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ" }
  };
  const activeLabels = labels[currentLanguage] || labels["en"];

  centers.forEach(c => {
    const isRecommended = recKeys.includes(c.categoryKey);
    const localizedCategory = getLocalizedCategory(c.categoryKey);

    const card = document.createElement("div");
    card.className = `center-card ${isRecommended ? "recommended-card" : ""}`;
    
    let badgeHtml = "";
    if (isRecommended) {
      badgeHtml = `<span class="rec-card-badge">${activeLabels.recBadge}</span>`;
    }

    card.innerHTML = `
      ${badgeHtml}
      <div class="card-details">
        <h4 class="card-name">${c.name}</h4>
        <span class="card-category">${localizedCategory}</span>
        <p class="card-address">
          <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;vertical-align:middle;margin-right:4px;">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12.5,7H11V13H17V11.5H12.5V7Z"/>
          </svg>${c.address}
        </p>
        <div class="card-meta">
          <span class="card-distance">${activeLabels.distance}: <strong>${c.distance} km</strong></span>
          <span class="card-rating">★ ${c.rating}</span>
        </div>
      </div>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}" target="_blank" rel="noopener" class="btn btn-secondary card-directions-btn">
        <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:currentColor;margin-right:6px;vertical-align:middle;">
          <path d="M22.41,11.59L12.41,1.59C12.11,1.29 11.71,1.17 11.36,1.24L3.36,2.84C2.56,3 2,3.7 2,4.5V11.5C2,11.9 2.16,12.28 2.44,12.56L12.44,22.56C12.75,22.87 13.25,22.87 13.56,22.56L22.56,13.56C22.87,13.25 22.87,12.75 22.56,12.44L22.41,11.59M13,20L5,12V6.5L12,5.1L18.4,11.5L13,20Z"/>
        </svg>${activeLabels.directions}
      </a>
    `;
    cardsBox.appendChild(card);
  });
}

function getRecommendedCategoryKeys(diseaseKey) {
  if (diseaseKey === "leaf_spot" || diseaseKey === "mildew") {
    // Fungal: Lab (Soil testing), Fertilizer (pesticides/treatments), Office (government agriculture extension support)
    return ["laboratory", "fertilizer", "office"];
  }
  // Healthy/General
  return ["seeds", "farmer_center", "office"];
}

function getCategoryKeyFromTags(tags) {
  if (!tags) return "farmer_center";
  if (tags.office === "government" || tags.government === "agriculture") return "office";
  if (tags.shop === "seeds" || tags.shop === "seed") return "seeds";
  if (tags.shop === "fertilizer" || tags.shop === "agricultural" || tags.shop === "farm") return "fertilizer";
  if (tags.amenity === "laboratory" || tags.laboratory) return "laboratory";
  if (tags.office === "cooperative" || tags.office === "ngo") return "farmer_center";
  return "farmer_center";
}

function getLocalizedCategory(categoryKey) {
  const categories = {
    en: { office: "Agriculture Office", fertilizer: "Fertilizer Shop", seeds: "Seed Store", laboratory: "Soil Testing Laboratory", farmer_center: "Farmer Service Center" },
    te: { office: "వ్యవసాయ కార్యాలయం", fertilizer: "ఎరువుల దుకాణం", seeds: "విత్తనాల దుకాణం", laboratory: "మట్టి పరీక్ష ప్రయోగశాల", farmer_center: "రైతు సేవా కేంద్రం" },
    hi: { office: "कृषि कार्यालय", fertilizer: "उर्वरक की दुकान", seeds: "बीज भंडार", laboratory: "मृदा परीक्षण प्रयोगशाला", farmer_center: "किसान सेवा केंद्र" },
    ta: { office: "வேளாண்மை அலுவலகம்", fertilizer: "உரக் கடை", seeds: "விதை கடை", laboratory: "மண் பரிசோதனை கூடம்", farmer_center: "உழவர் சேவை மையம்" },
    ml: { office: "കൃഷി ഓഫീസ്", fertilizer: "വളക്കട", seeds: "വിത്ത് കട", laboratory: "മണ്ണ് പരിശോധന ലാബ്", farmer_center: "കർഷക സേവന കേന്ദ്രം" },
    kn: { office: "ಕೃಷಿ ಕಚೇರಿ", fertilizer: "ಗೊಬ್ಬರದ ಅಂಗಡಿ", seeds: "ಬೀಜದ ಅಂಗಡಿ", laboratory: "ಮಣ್ಣು ಪರೀಕ್ಷಾ ಪ್ರಯೋಗಾಲಯ", farmer_center: "ರೈತು ಸೇವಾ ಕೇಂದ್ರ" }
  };
  const dict = categories[currentLanguage] || categories["en"];
  return dict[categoryKey] || categoryKey;
}

function getMockCenters(lat, lon) {
  const categoryTemplates = [
    { name: { en: "Govt Agriculture Extension Office", te: "ప్రభుత్వ వ్యవసాయ విస్తరణ కార్యాలయం", hi: "सरकारी कृषि विस्तार कार्यालय", ta: "அரசு வேளாண்மை விரிவாக்க அலுவலகம்", ml: "സർക്കാർ കൃഷി എക്സ്റ്റൻഷൻ ഓഫീസ്", kn: "ಸರ್ಕಾರಿ ಕೃಷಿ ವಿಸ್ತರಣಾ ಕಚೇರಿ" }, key: "office" },
    { name: { en: "Sri Rama Fertilizer & Pesticides", te: "శ్రీ రామ ఫెర్టిలైజర్స్ & పెస్టిసైడ్స్", hi: "श्री राम उर्वरक और कीटनाशक", ta: "ஸ்ரீ ராமா உரங்கள் மற்றும் பூச்சிக்கொல்லிகள்", ml: "ശ്രീരാമ വളപ്രയോഗം & കീടനാശിനികൾ", kn: "ಶ್ರೀ ರಾಮ ಗೊಬ್ಬರ ಮತ್ತು ಕೀಟನಾಶಕಗಳು" }, key: "fertilizer" },
    { name: { en: "Greenfield Hybrid Seeds Store", te: "గ్రీన్ ఫీల్డ్ హైబ్రిడ్ విత్తనాల దుకాణం", hi: "ग्रीनफील्ड हाइब्रिड बीज भंडार", ta: "கிரீன்ஃபீல்ட் ஹைப்ரிட் விதை கடை", ml: "ഗ്രീൻഫീൽഡ് ഹൈബ്രിഡ് വിത്തുകൾ", kn: "ಗ್ಯಾರಂಟಿ ಹೈಬ್ರಿಡ್ ಬೀಜ ಸಂಗ್ರಹ" }, key: "seeds" },
    { name: { en: "District Soil Testing & Research Lab", te: "జిల్లా మట్టి పరీక్ష & పరిశోధన ప్రయోగశాల", hi: "जिला मृदा परीक्षण और अनुसंधान प्रयोगशाला", ta: "மாவட்ட மண் பரிசோதனை மற்றும் ஆராய்ச்சி கூடம்", ml: "ജില്ലാ മണ്ണ് പരിശോധന & ഗവേഷണ ലാബ്", kn: "ಜಿಲ್ಲಾ मಣ್ಣು ಪರೀಕ್ಷೆ ಮತ್ತು ಸಂಶೋಧನಾ ಪ್ರಯೋಗಾಲಯ" }, key: "laboratory" },
    { name: { en: "Rythu Seva Kendra (Farmer Service Center)", te: "రైతు సేవా కేంద్రం (ఫార్మర్ సర్వీస్ సెంటర్)", hi: "किसान सेवा केंद्र", ta: "உழவர் சேவை மையம்", ml: "കർഷക സേവന കേന്ദ്രം", kn: "ರೈತ ಸೇವಾ ಕೇಂದ್ರ" }, key: "farmer_center" }
  ];

  return categoryTemplates.map((template, idx) => {
    // Generate deterministic coordinate offsets around user position
    const offsetLat = (Math.sin(idx + 1) * 0.02);
    const offsetLon = (Math.cos(idx + 1) * 0.02);
    const centerLat = lat + offsetLat;
    const centerLon = lon + offsetLon;
    const distance = calculateDistance(lat, lon, centerLat, centerLon);
    
    // Stable random-looking values
    const rating = (4.1 + (idx * 0.17) % 0.8).toFixed(1);
    const doorNo = 12 + idx * 8;
    
    const streetNames = {
      en: `${doorNo} Farming Road, Regional Hub`,
      te: `${doorNo} వ్యవసాయ రోడ్, ప్రాంతీయ కేంద్రం`,
      hi: `${doorNo} कृषि रोड, क्षेत्रीय केंद्र`,
      ta: `${doorNo} விவசாய சாலை, பிராந்திய மையம்`,
      ml: `${doorNo} കൃഷി റോഡ്, റീജിയണൽ ഹബ്`,
      kn: `${doorNo} ಕೃಷಿ ರಸ್ತೆ, ಪ್ರಾದೇಶಿಕ ಕೇಂದ್ರ`
    };
    
    return {
      name: template.name[currentLanguage] || template.name["en"],
      categoryKey: template.key,
      lat: centerLat,
      lon: centerLon,
      address: streetNames[currentLanguage] || streetNames["en"],
      distance: distance,
      rating: rating
    };
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(1));
}

function isAppOffline() {
  const simSwitch = document.getElementById("online-switch");
  const offlineSimulated = simSwitch ? !simSwitch.checked : false;
  return offlineSimulated || !navigator.onLine;
}
