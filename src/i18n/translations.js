/* C Guard — bilingual translation dictionary.
 *
 * Authority pages (Login, Dashboard, Shelter Management) are explicitly NOT
 * translated. The Navbar used by authority pages (TopNavbar) does not pull
 * from this dictionary.
 */

export const SUPPORTED_LANGUAGES = ['en', 'ur'];

export const translations = {
  en: {
    /* Navbar */
    'navbar.home': 'Home',
    'navbar.map': 'Map',
    'navbar.emergency': 'Emergency',
    'navbar.contact': 'Contact',
    'navbar.authority_login': 'Authority Login',
    'navbar.back': '← Back to Previous Page',
    'navbar.lang_toggle_label': 'Switch language',
    'navbar.lang_en': 'EN',
    'navbar.lang_ur': 'اردو',

    /* Home */
    'home.map.title': 'Live Flood Risk Map',
    'home.map.subtitle': 'Real-time visualization of flood risk across Chenab River Basin',
    /* Landing Page */
    'landing.title': 'C GUARD',
    'landing.subtitle': 'Chenab River Basin Flood Forecasting System',
    'landing.highlight': 'Real-time monitoring and early warning technology',
    'landing.description':
      'Protecting lives with early flood risk insights and timely warnings to support safer communities along the Chenab River Basin through advanced monitoring and forecasting technology.',
    'landing.cta': 'Check Flood Risk',
    /* Map */
    'map.search': 'Search UC or District',

    'map.legend.title': 'Map Legend',
    'map.legend.river': 'Chenab River',
    'map.legend.boundaries': 'UC Boundaries',
    'map.legend.percent': '% = Flood Risk Level',
    'map.legend.levels': 'FLOOD RISK LEVELS',

    'map.overview.title': 'Basin Overview',
    'map.overview.live': 'LIVE',
    'map.overview.updated': 'Updated',

    'map.toggle.map': 'Map',
    'map.toggle.satellite': 'Satellite',

    /* Risk Labels */
    'risk.normal': 'Normal',
    'risk.low': 'Low',
    'risk.medium': 'Medium',
    'risk.high': 'High',
    'risk.very_high': 'Very High',
    'risk.exc_high': 'Exceptionally High',

    /* Risk Meanings (short description of each category) */
    'risk.meaning.normal': 'Safe conditions',
    'risk.meaning.low': 'Slight flood possibility',
    'risk.meaning.medium': 'Moderate flood threat',
    'risk.meaning.high': 'Dangerous flood conditions',
    'risk.meaning.very_high': 'Severe flooding expected',
    'risk.meaning.exc_high': 'Extreme flood emergency',

    'map.overview.ucs': 'UCs Monitored',

    'map.overview.normal': 'Normal',
    'map.overview.low': 'Low Risk',
    'map.overview.medium': 'Medium Risk',
    'map.overview.high': 'High Risk',
    'map.overview.very_high': 'Very High Risk',
    'map.overview.exc_high': 'Exceptionally High Risk',

    'map.overview.summary_button': 'View Basin Summary',
    /* Emergency */
    'emergency.back': 'Back',
    'emergency.title': 'Emergency Information',
    'emergency.subtitle': 'Critical helplines and shelter availability for the Chenab flood response network.',

    'emergency.helpline.title': 'Emergency Helpline Numbers',
    'emergency.helpline.subtitle': 'Immediate contacts for rescue, police, and district response coordination.',

    'emergency.card.service': 'Emergency Service',
    'emergency.card.call_now': 'Call Now',
    'emergency.card.call': 'Call',
    'emergency.card.at': 'at',

    'emergency.shelters.title': 'Flood Shelters',
    'emergency.shelters.subtitle': 'Verified shelter locations with capacity and support facility details.',
    'emergency.shelter.label': 'Flood Shelter',
    'emergency.shelter.persons': 'persons',

    'emergency.status.available': 'Available',
    'emergency.status.full': 'Full',

    'emergency.facility.drinking_water': 'Drinking Water',
    'emergency.facility.medical_aid': 'Medical Aid',
    'emergency.facility.electricity': 'Electricity',
    'emergency.facility.other': 'Facility',
    'emergency.location.Jhang District': 'Jhang District',
    'emergency.location.Chiniot': 'Chiniot',
    'emergency.location.Faisalabad': 'Faisalabad',
    'emergency.location.Gujrat': 'Gujrat',
    'floodrisk.header.title': 'C Guard | Chenab Basin',
    'floodrisk.back': '← Back to Home',
    'floodrisk.location.default': 'Your Location',
    'floodrisk.location.unavailable': 'Location unavailable',
    'floodrisk.voice.unsupported': 'Voice search is not supported in your browser.',
    'floodrisk.guide.title': 'Map Guide',
    'floodrisk.risk_levels': 'Risk Levels',
    'floodrisk.location.title': 'Share Your Location',
    'floodrisk.location.subtitle': 'Allow access to your location to view flood risk information for your area',
    'floodrisk.location.note': 'Used only for local flood risk guidance',
    'floodrisk.location.allow': 'Allow Location Access',
    'floodrisk.location.not_now': 'Not Now',
    /* FloodMap */
    'floodmap.no_data': 'NO DATA',
    'floodmap.not_available': 'N/A',

    'floodmap.status.detecting': 'DETECTING',
    'floodmap.status.outside_area': 'OUTSIDE AREA',
    'floodmap.status.risk': 'RISK',

    'floodmap.detecting.aria': 'Detecting your union council',

    'floodmap.outside.title': 'Outside Chenab Basin coverage',
    'floodmap.outside.body': 'C Guard currently monitors flood-prone Union Councils along the Chenab River Basin.',
    'floodmap.outside.hint': 'Move toward monitored Chenab regions to view UC-level flood forecasts.',

    'floodmap.detail.union_council': 'Union Council',
    'floodmap.detail.district': 'District',
    'floodmap.detail.distance': 'Distance from River',
    'floodmap.detail.coordinates': 'Coordinates',

    'floodmap.unnamed_uc': 'Unnamed UC',
    'floodmap.unknown': 'Unknown',

    'floodmap.forecast.aria': 'Forecast flood risk',
    'floodmap.forecast.24h': '24h Forecast',
    'floodmap.forecast.48h': '48h Forecast',
    'floodmap.forecast.72h': '72h Forecast',

    'floodmap.preview.connected': 'Live ML flood forecast connected successfully.',

    'floodmap.meta.last_updated': 'Last updated',
    'floodmap.meta.live_update': 'Live Update',

    'floodmap.alerts.aria': 'Alert preferences',
    'floodmap.alerts.title': 'Alert Preferences',
    'floodmap.alerts.subtitle': 'Get flood alerts for this location.',
    'floodmap.alerts.active': 'Active',
    'floodmap.alerts.email': 'Email Alerts',
    'floodmap.alerts.sms': 'SMS Alerts',
    'floodmap.alerts.notify': 'Notify me when risk is',
    'floodmap.alerts.saving': 'Saving Alerts...',
    'floodmap.alerts.enable': 'Enable Location Alerts',
    'floodmap.alerts.info': 'You will receive alerts based on the selected channels when flood risk reaches your chosen level.',

    'floodmap.alert.error.channel': 'Please select at least one alert channel.',
    'floodmap.alert.error.email': 'Please enter your email address.',
    'floodmap.alert.error.phone': 'Please enter your phone number.',
    'floodmap.alert.no_uc': 'No active union council selected.',
    'floodmap.alert.success': 'Location alerts enabled successfully.',
    'floodmap.alert.fail': 'Unable to save alerts right now.',

    'floodmap.threshold.medium': 'Medium or above',
    'floodmap.threshold.high': 'High or above',
    'floodmap.threshold.veryhigh': 'Very High only',

    'floodmap.emergency.title': 'View Emergency Resources',
    'floodmap.emergency.subtitle': 'Shelters, Contacts & More',

    'floodmap.modal.title': 'Enable Flood Alerts',
    'floodmap.modal.close': 'Close',
    'floodmap.modal.threshold': 'Risk threshold',
    'floodmap.modal.email': 'Email address',
    'floodmap.modal.email_placeholder': 'Enter your email address',
    'floodmap.modal.phone': 'Phone number',
    'floodmap.modal.phone_placeholder': 'Enter phone number, e.g. +923001234567',
    'floodmap.modal.cancel': 'Cancel',
    'floodmap.modal.save': 'Save Alert Subscription',

    'floodmap.error.boundaries': 'Unable to load Chenab UC boundaries.',
    'floodmap.error.live_unavailable': 'Live data refresh failed. Showing last available data.',
    'floodmap.error.personal_risk': 'Unable to load backend flood risk for this UC.',

    'floodmap.reset': 'Reset View',
    'floodmap.dev.title': 'Development-only: simulate a user location inside a Chenab UC',
    'floodmap.dev.clear': 'Clear Test UC',
    'floodmap.dev.test': 'Test Inside UC',

    'floodmap.you_are_here': 'You are here',
    'floodmap.loading.title': 'Preparing flood map',
    'floodmap.loading.boundaries': 'Loading Chenab UC boundaries.',
    'floodmap.loading.live': 'Refreshing live flood data.',

    'floodmap.your_uc': 'Your UC',
    'floodmap.flood_status': 'Flood Status',
    'floodmap.title.detecting': 'Detecting Your Location',
    'floodmap.title.outside': 'Outside Chenab Basin Coverage',

    'floodmap.popup.station': 'Station',
    'floodmap.popup.discharge': 'Discharge',
    'floodmap.popup.risk': 'Risk',
    'floodmap.popup.category': 'Category',

    /* Contact */
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We’d love to hear from you',

    'contact.form.name': 'Name',
    'contact.form.email': 'Email',
    'contact.form.subject': 'Subject',
    'contact.form.message': 'Message',

    'contact.placeholder.name': 'Enter your name',
    'contact.placeholder.email': 'Enter your email',
    'contact.placeholder.subject': 'Enter subject',
    'contact.placeholder.message': 'Write your message...',

    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.success': 'Message sent successfully.',
    'contact.error': 'Unable to send message. Please try again.',

    'contact.footer.description': 'Chenab River Flood Forecasting & Early Warning System',
    'contact.footer.contact': 'Contact',
    'contact.footer.bottom': '© 2026 C Guard | Final Year Project',

    /* Chatbot header / shell */
    'chatbot.title': 'C Guard AI Assistant',
    'chatbot.status': 'Online • Flood Safety Guide',
    'chatbot.welcome':
      'Hi! 👋 I can help you understand flood risk, shelters, emergency contacts, and alerts. How can I help you today?',
    'chatbot.quick_questions_label': 'Quick questions',
    'chatbot.input_placeholder': 'Ask me about floods, shelters, alerts...',
    'chatbot.input_aria': 'Message C Guard AI Assistant',
    'chatbot.fallback':
      'I’m still learning. Please use the quick options or visit the relevant C Guard page for more details.',
    'chatbot.open_label': 'Open C Guard Assistant',
    'chatbot.close_label': 'Close C Guard Assistant',
    'chatbot.send_label': 'Send message',
    'chatbot.tooltip': 'Need Flood Help?',

    /* Chatbot quick prompts */
    'chatbot.quick.flood_risk': 'How do I check my flood risk?',
    'chatbot.quick.shelters': 'Where can I find shelters?',
    'chatbot.quick.risk_levels': 'What do risk levels mean?',
    'chatbot.quick.alerts': 'How do alerts work?',
    'chatbot.quick.contacts': 'Emergency contacts',

    /* Chatbot canned answers */
    'chatbot.answer.flood_risk':
      'Click the Check Flood Risk button on the home page, allow location access, and C Guard will show your Union Council level 24h, 48h, and 72h flood forecast.',
    'chatbot.answer.shelters':
      'Open the Emergency page or View Emergency Resources to see available flood shelters, capacity, and support facilities.',
    'chatbot.answer.risk_levels':
      'Flood risk is shown as Normal, Low, Medium, High, Very High, and Exceptionally High using percentage-based categories.',
    'chatbot.answer.alerts':
      'You can enable email or SMS alerts from the flood risk page after your location and Union Council are detected.',
    'chatbot.answer.contacts':
      'Visit the Emergency page to view PDMA, Rescue 1122, police, and district administration contact numbers.',
    /* Footer */
    'footer.description':
      'Chenab River flood forecasting and early warning support for emergency response teams and local communities.',

    'footer.tagline':
      'Protecting lives with early flood risk insights and coordinated response information.',

    'footer.quick_links': 'Quick Links',
    'footer.flood_map': 'Flood Map',
    'footer.contact': 'Contact',
    'footer.logo': 'C Guard',

    'footer.location': 'Chenab River Basin, Pakistan',

    'footer.project': 'Final Year Project',

    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
  },

  ur: {
    /* Navbar */
    'navbar.home': 'ہوم',
    'navbar.map': 'نقشہ',
    'navbar.emergency': 'ہنگامی',
    'navbar.contact': 'رابطہ',
    'navbar.authority_login': 'اتھارٹی لاگ ان',
    'navbar.back': '← پچھلے صفحے پر واپس',
    'navbar.lang_toggle_label': 'زبان تبدیل کریں',
    'navbar.lang_en': 'EN',
    'navbar.lang_ur': 'اردو',

    /* Home */
    'home.map.title': 'لائیو سیلابی خطرے کا نقشہ',
    'home.map.subtitle': 'دریائے چناب کے علاقے میں سیلابی خطرے کی حقیقی وقت کی نقشہ جاتی نمائش',
    /* Landing Page */
    'landing.title': 'C Guard',
    'landing.subtitle': 'دریائے چناب بیسن سیلابی پیش گوئی نظام',
    'landing.highlight': 'حقیقی وقت کی نگرانی اور ابتدائی انتباہی ٹیکنالوجی',
    'landing.description':
      'دریائے چناب کے اطراف محفوظ کمیونٹیز کے لیے جدید نگرانی اور پیش گوئی کی مدد سے بروقت انتباہات اور ابتدائی سیلابی خطرے کی معلومات فراہم کر کے جانوں کا تحفظ۔',
    'landing.cta': 'سیلابی خطرہ چیک کریں',
    /* Map */
    'map.search': 'یونین کونسل یا ضلع تلاش کریں',

    'map.legend.title': 'نقشے کی رہنمائی',
    'map.legend.river': 'دریائے چناب',
    'map.legend.boundaries': 'یونین کونسل حدود',
    'map.legend.percent': '% = سیلابی خطرے کی سطح',
    'map.legend.levels': 'سیلابی خطرے کی سطحیں',

    'map.overview.title': 'بیسن کا جائزہ',
    'map.overview.live': 'لائیو',
    'map.overview.updated': 'اپڈیٹ',

    'map.overview.ucs': 'مانیٹر شدہ یونین کونسلز',
    'map.overview.normal': 'نارمل',
    'map.overview.low': 'کم خطرہ',
    'map.overview.medium': 'درمیانہ خطرہ',
    'map.overview.high': 'زیادہ خطرہ',
    'map.overview.very_high': 'بہت زیادہ خطرہ',
    'map.overview.exc_high': 'انتہائی زیادہ خطرہ',
    'map.overview.summary_button': 'بیسن کا خلاصہ دیکھیں',

    'map.toggle.map': 'نقشہ',
    'map.toggle.satellite': 'سیٹلائٹ',
    /* Emergency */
    'emergency.back': 'واپس',
    'emergency.title': 'ہنگامی معلومات',
    'emergency.subtitle': 'دریائے چناب کے سیلابی امدادی نیٹ ورک کے لیے اہم ہیلپ لائنز اور پناہ گاہوں کی دستیابی۔',

    'emergency.helpline.title': 'ہنگامی ہیلپ لائن نمبرز',
    'emergency.helpline.subtitle': 'ریسکیو، پولیس اور ضلعی امدادی رابطہ کاری کے لیے فوری رابطے۔',

    'emergency.card.service': 'ہنگامی سروس',
    'emergency.card.call_now': 'ابھی کال کریں',
    'emergency.card.call': 'کال کریں',
    'emergency.card.at': 'پر',

    'emergency.shelters.title': 'سیلابی پناہ گاہیں',
    'emergency.shelters.subtitle': 'گنجائش اور سہولیات کی تفصیل کے ساتھ تصدیق شدہ پناہ گاہیں۔',
    'emergency.shelter.label': 'سیلابی پناہ گاہ',
    'emergency.shelter.persons': 'افراد',

    'emergency.status.available': 'دستیاب',
    'emergency.status.full': 'مکمل',

    'emergency.facility.drinking_water': 'پینے کا پانی',
    'emergency.facility.medical_aid': 'طبی امداد',
    'emergency.facility.electricity': 'بجلی',
    'emergency.facility.other': 'سہولت',
    'emergency.location.Jhang District': 'ضلع جھنگ',
    'emergency.location.Chiniot': 'چنیوٹ',
    'emergency.location.Faisalabad': 'فیصل آباد',
    'emergency.location.Gujrat': 'گجرات',
    'floodrisk.header.title': 'C Guard | دریائے چناب',
    'floodrisk.back': '← ہوم پر واپس جائیں',
    'floodrisk.location.default': 'آپ کی لوکیشن',
    'floodrisk.location.unavailable': 'لوکیشن دستیاب نہیں',
    'floodrisk.voice.unsupported': 'آپ کے براؤزر میں وائس سرچ سپورٹ نہیں ہے۔',
    'floodrisk.guide.title': 'نقشہ رہنمائی',
    'floodrisk.risk_levels': 'خطرے کی سطحیں',
    'floodrisk.location.title': 'اپنی لوکیشن شیئر کریں',
    'floodrisk.location.subtitle': 'اپنے علاقے کے سیلابی خطرات دیکھنے کے لیے لوکیشن کی اجازت دیں',
    'floodrisk.location.note': 'صرف مقامی سیلابی رہنمائی کے لیے استعمال کیا جائے گا',
    'floodrisk.location.allow': 'لوکیشن کی اجازت دیں',
    'floodrisk.location.not_now': 'ابھی نہیں',
    /* FloodMap */
    'floodmap.no_data': 'ڈیٹا نہیں',
    'floodmap.not_available': 'دستیاب نہیں',

    'floodmap.status.detecting': 'شناخت ہو رہی ہے',
    'floodmap.status.outside_area': 'علاقے سے باہر',
    'floodmap.status.risk': 'خطرہ',

    'floodmap.detecting.aria': 'آپ کی یونین کونسل شناخت ہو رہی ہے',

    'floodmap.outside.title': 'دریائے چناب بیسن کوریج سے باہر',
    'floodmap.outside.body': 'C Guard اس وقت دریائے چناب بیسن کے سیلاب سے متاثرہ یونین کونسلز کی نگرانی کرتا ہے۔',
    'floodmap.outside.hint': 'یونین کونسل سطح کی سیلابی پیش گوئی دیکھنے کے لیے مانیٹر شدہ چناب علاقوں کی طرف جائیں۔',

    'floodmap.detail.union_council': 'یونین کونسل',
    'floodmap.detail.district': 'ضلع',
    'floodmap.detail.distance': 'دریا سے فاصلہ',
    'floodmap.detail.coordinates': 'کوآرڈینیٹس',

    'floodmap.unnamed_uc': 'نامعلوم یونین کونسل',
    'floodmap.unknown': 'نامعلوم',

    'floodmap.forecast.aria': 'سیلابی خطرے کی پیش گوئی',
    'floodmap.forecast.24h': '24 گھنٹے کی پیش گوئی',
    'floodmap.forecast.48h': '48 گھنٹے کی پیش گوئی',
    'floodmap.forecast.72h': '72 گھنٹے کی پیش گوئی',

    'floodmap.preview.connected': 'لائیو ایم ایل سیلابی پیش گوئی کامیابی سے منسلک ہو گئی۔',

    'floodmap.meta.last_updated': 'آخری اپڈیٹ',
    'floodmap.meta.live_update': 'لائیو اپڈیٹ',

    'floodmap.alerts.aria': 'الرٹ ترجیحات',
    'floodmap.alerts.title': 'الرٹ ترجیحات',
    'floodmap.alerts.subtitle': 'اس لوکیشن کے لیے سیلابی الرٹس حاصل کریں۔',
    'floodmap.alerts.active': 'فعال',
    'floodmap.alerts.email': 'ای میل الرٹس',
    'floodmap.alerts.sms': 'ایس ایم ایس الرٹس',
    'floodmap.alerts.notify': 'مجھے اطلاع دیں جب خطرہ ہو',
    'floodmap.alerts.saving': 'الرٹس محفوظ ہو رہے ہیں۔۔۔',
    'floodmap.alerts.enable': 'لوکیشن الرٹس فعال کریں',
    'floodmap.alerts.info': 'جب سیلابی خطرہ آپ کی منتخب سطح تک پہنچے گا تو آپ کو منتخب چینلز کے ذریعے الرٹس ملیں گے۔',

    'floodmap.alert.error.channel': 'براہ کرم کم از کم ایک الرٹ چینل منتخب کریں۔',
    'floodmap.alert.error.email': 'براہ کرم اپنا ای میل درج کریں۔',
    'floodmap.alert.error.phone': 'براہ کرم اپنا فون نمبر درج کریں۔',
    'floodmap.alert.no_uc': 'کوئی فعال یونین کونسل منتخب نہیں۔',
    'floodmap.alert.success': 'لوکیشن الرٹس کامیابی سے فعال ہو گئے۔',
    'floodmap.alert.fail': 'اس وقت الرٹس محفوظ نہیں ہو سکے۔',

    'floodmap.threshold.medium': 'درمیانہ یا اس سے اوپر',
    'floodmap.threshold.high': 'زیادہ یا اس سے اوپر',
    'floodmap.threshold.veryhigh': 'صرف بہت زیادہ',

    'floodmap.emergency.title': 'ہنگامی وسائل دیکھیں',
    'floodmap.emergency.subtitle': 'پناہ گاہیں، رابطے اور مزید',

    'floodmap.modal.title': 'سیلابی الرٹس فعال کریں',
    'floodmap.modal.close': 'بند کریں',
    'floodmap.modal.threshold': 'خطرے کی حد',
    'floodmap.modal.email': 'ای میل ایڈریس',
    'floodmap.modal.email_placeholder': 'اپنا ای میل ایڈریس درج کریں',
    'floodmap.modal.phone': 'فون نمبر',
    'floodmap.modal.phone_placeholder': 'فون نمبر درج کریں، مثال: +923001234567',
    'floodmap.modal.cancel': 'منسوخ کریں',
    'floodmap.modal.save': 'الرٹ سبسکرپشن محفوظ کریں',

    'floodmap.error.boundaries': 'چناب یونین کونسل حدود لوڈ نہیں ہو سکیں۔',
    'floodmap.error.live_unavailable': 'لائیو ڈیٹا ریفریش ناکام۔ آخری دستیاب ڈیٹا دکھایا جا رہا ہے۔',
    'floodmap.error.personal_risk': 'اس یونین کونسل کے لیے بیک اینڈ سیلابی خطرہ لوڈ نہیں ہو سکا۔',

    'floodmap.reset': 'ویو ری سیٹ کریں',
    'floodmap.dev.title': 'ڈیولپمنٹ صرف: چناب یونین کونسل کے اندر یوزر لوکیشن simulate کریں',
    'floodmap.dev.clear': 'ٹیسٹ یونین کونسل صاف کریں',
    'floodmap.dev.test': 'ٹیسٹ یونین کونسل',

    'floodmap.you_are_here': 'آپ یہاں ہیں',
    'floodmap.loading.title': 'سیلابی نقشہ تیار ہو رہا ہے',
    'floodmap.loading.boundaries': 'چناب یونین کونسل حدود لوڈ ہو رہی ہیں۔',
    'floodmap.loading.live': 'لائیو سیلابی ڈیٹا اپڈیٹ ہو رہا ہے۔',

    'floodmap.your_uc': 'آپ کی یونین کونسل',
    'floodmap.flood_status': 'سیلابی صورتحال',
    'floodmap.title.detecting': 'آپ کی لوکیشن شناخت ہو رہی ہے',
    'floodmap.title.outside': 'دریائے چناب بیسن کوریج سے باہر',

    'floodmap.popup.station': 'اسٹیشن',
    'floodmap.popup.discharge': 'اخراج',
    'floodmap.popup.risk': 'خطرہ',
    'floodmap.popup.category': 'کیٹیگری',



    /* Risk Labels */
    'risk.normal': 'نارمل',
    'risk.low': 'کم',
    'risk.medium': 'درمیانہ',
    'risk.high': 'زیادہ',
    'risk.very_high': 'بہت زیادہ',
    'risk.exc_high': 'انتہائی زیادہ',

    /* Risk Meanings (short description of each category) */
    'risk.meaning.normal': 'محفوظ صورتحال',
    'risk.meaning.low': 'سیلاب کا معمولی امکان',
    'risk.meaning.medium': 'درمیانے درجے کا سیلابی خطرہ',
    'risk.meaning.high': 'خطرناک سیلابی صورتحال',
    'risk.meaning.very_high': 'شدید سیلاب متوقع',
    'risk.meaning.exc_high': 'انتہائی سیلابی ایمرجنسی',
    /* Contact */
    'contact.title': 'ہم سے رابطہ کریں',
    'contact.subtitle': 'ہم آپ کی رائے سننا پسند کریں گے',

    'contact.form.name': 'نام',
    'contact.form.email': 'ای میل',
    'contact.form.subject': 'موضوع',
    'contact.form.message': 'پیغام',

    'contact.placeholder.name': 'اپنا نام درج کریں',
    'contact.placeholder.email': 'اپنا ای میل درج کریں',
    'contact.placeholder.subject': 'موضوع درج کریں',
    'contact.placeholder.message': 'اپنا پیغام لکھیں۔۔۔',

    'contact.send': 'پیغام بھیجیں',
    'contact.sending': 'بھیجا جا رہا ہے۔۔۔',
    'contact.success': 'پیغام کامیابی سے بھیج دیا گیا۔',
    'contact.error': 'پیغام بھیجنے میں مسئلہ ہوا۔ براہ کرم دوبارہ کوشش کریں۔',

    'contact.footer.description': 'دریائے چناب سیلابی پیش گوئی اور ابتدائی انتباہی نظام',
    'contact.footer.contact': 'رابطہ',
    'contact.footer.bottom': '© 2026 C Guard | فائنل ایئر پروجیکٹ',

    /* Chatbot header / shell */
    'chatbot.title': 'C Guard اے آئی اسسٹنٹ',
    'chatbot.status': 'آن لائن • سیلاب سے حفاظت کا رہنما',
    'chatbot.welcome':
      'السلام علیکم! 👋 میں آپ کو سیلاب کے خطرے، پناہ گاہوں، ہنگامی رابطوں اور الرٹس کے بارے میں مدد دے سکتا ہوں۔ آپ کو کس چیز میں مدد چاہیے؟',
    'chatbot.quick_questions_label': 'فوری سوالات',
    'chatbot.input_placeholder': 'سیلاب، پناہ گاہوں یا الرٹس کے بارے میں پوچھیں...',
    'chatbot.input_aria': 'C Guard اسسٹنٹ کو پیغام بھیجیں',
    'chatbot.fallback':
      'میں ابھی سیکھ رہا ہوں۔ براہ کرم فوری اختیارات استعمال کریں یا متعلقہ C Guard صفحہ ملاحظہ کریں۔',
    'chatbot.open_label': 'C Guard اسسٹنٹ کھولیں',
    'chatbot.close_label': 'C Guard اسسٹنٹ بند کریں',
    'chatbot.send_label': 'پیغام بھیجیں',
    'chatbot.tooltip': 'سیلاب میں مدد چاہیے؟',

    /* Chatbot quick prompts */
    'chatbot.quick.flood_risk': 'میں سیلاب کا خطرہ کیسے چیک کروں؟',
    'chatbot.quick.shelters': 'مجھے پناہ گاہیں کہاں ملیں گی؟',
    'chatbot.quick.risk_levels': 'خطرے کی سطحوں کا کیا مطلب ہے؟',
    'chatbot.quick.alerts': 'الرٹس کیسے کام کرتے ہیں؟',
    'chatbot.quick.contacts': 'ہنگامی رابطے',

    /* Chatbot canned answers */
    'chatbot.answer.flood_risk':
      'ہوم پیج پر Check Flood Risk بٹن پر کلک کریں، لوکیشن کی اجازت دیں، پھر C Guard آپ کے یونین کونسل کی 24، 48 اور 72 گھنٹوں کی سیلابی پیش گوئی دکھائے گا۔',
    'chatbot.answer.shelters':
      'Emergency صفحے یا View Emergency Resources میں جا کر قریبی پناہ گاہیں، گنجائش اور دستیاب سہولیات دیکھیں۔',
    'chatbot.answer.risk_levels':
      'سیلابی خطرہ Normal، Low، Medium، High، Very High اور Exceptionally High سطحوں میں دکھایا جاتا ہے، جو فیصدی خطرے کی بنیاد پر ہوتا ہے۔',
    'chatbot.answer.alerts':
      'اپنی لوکیشن اور یونین کونسل detect ہونے کے بعد آپ flood risk page سے email یا SMS alerts enable کر سکتے ہیں۔',
    'chatbot.answer.contacts':
      'Emergency صفحے پر PDMA، Rescue 1122، پولیس اور ضلعی انتظامیہ کے رابطہ نمبرز دیکھے جا سکتے ہیں۔',
    /* Footer */
    'footer.description':
      'دریائے چناب کے علاقوں کے لیے سیلابی پیش گوئی اور ابتدائی انتباہی معاونت۔',

    'footer.tagline':
      'ابتدائی سیلابی خطرات اور مربوط امدادی معلومات کے ذریعے جانوں کا تحفظ۔',

    'footer.quick_links': 'فوری روابط',
    'footer.flood_map': 'سیلابی نقشہ',
    'footer.contact': 'رابطہ',

    'footer.location': 'دریائے چناب، پاکستان',

    'footer.project': 'فائنل ایئر پروجیکٹ',

    'footer.privacy': 'پرائیویسی پالیسی',
    'footer.terms': 'سروس کی شرائط',
    'footer.logo': 'C Guard',

  },
};

export const isSupportedLanguage = (value) => SUPPORTED_LANGUAGES.includes(value);