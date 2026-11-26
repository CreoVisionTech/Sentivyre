// Sentivyre language support: English (default) and Arabic (right-to-left).
var LANG = 'en';
(function () {
  var AR = {
    'Dashboard': 'لوحة التحكم', 'PC Scan': 'فحص الجهاز', 'Network': 'الشبكة', 'Scam Scanner': 'كاشف الاحتيال',
    'Link Checker': 'فاحص الروابط', 'Password Guardian': 'حارس كلمات المرور', 'Vyra AI Assistant': 'المساعدة الذكية فيرا',
    'Settings': 'الإعدادات', '⚠ Panic Button': '⚠ زر الطوارئ', 'Panic Button': 'زر الطوارئ',
    'Security overview': 'نظرة عامة على الأمان', 'Your PC is being watched over by Sentivyre.': 'سنتيفاير يحمي جهازك الآن.',
    'Tip of the day': 'نصيحة اليوم', 'Safety score': 'درجة الأمان', 'Protected': 'محمي', 'Be careful': 'كن حذراً', 'At risk': 'في خطر',
    'Scans run': 'عمليات الفحص', 'messages, links & passwords': 'رسائل وروابط وكلمات مرور', 'Threats caught': 'التهديدات المكتشفة',
    'scams & dangerous links': 'احتيال وروابط خطيرة', 'Protection': 'الحماية', '● Active': '● تعمل', 'AI shield on': 'درع الذكاء الاصطناعي يعمل',
    'Recent activity': 'النشاط الأخير', 'Clear': 'مسح', 'No activity yet. Run your first scan.': 'لا يوجد نشاط بعد. ابدأ أول فحص.',
    'Scan my PC →': 'افحص جهازي ←', 'Find dangerous files': 'ابحث عن الملفات الخطيرة', 'Check a message →': 'افحص رسالة ←',
    'Paste an SMS, email or WhatsApp text': 'الصق رسالة نصية أو بريداً أو رسالة واتساب', 'Check a link →': 'افحص رابطاً ←',
    'Spot fake and phishing websites': 'اكتشف المواقع المزيفة والتصيد', 'Test a password →': 'اختبر كلمة مرور ←',
    'Checked only on your PC': 'يُفحص على جهازك فقط', 'Ask Vyra →': 'اسأل فيرا ←', 'Your AI security assistant': 'مساعدتك الأمنية الذكية',
    'Check your PC for dangerous files, and keep new downloads safe.': 'افحص جهازك بحثاً عن الملفات الخطيرة، واحمِ التنزيلات الجديدة.',
    'Ready to scan': 'جاهز للفحص',
    'Quick scan checks Downloads, Desktop, Documents, start-up programs and temporary files. Full scan checks your whole user folder.': 'الفحص السريع يفحص التنزيلات وسطح المكتب والمستندات وبرامج بدء التشغيل والملفات المؤقتة. الفحص الكامل يفحص مجلد المستخدم بالكامل.',
    'Quick scan': 'فحص سريع', 'Full scan': 'فحص كامل', 'Cancel': 'إلغاء',
    'Microsoft Defender found threats on your PC.': 'وجد Microsoft Defender تهديدات على جهازك.', 'Open Windows Security': 'افتح أمان Windows',
    'Scheduled scans': 'الفحص المجدول', 'Off': 'متوقف', 'Every day': 'كل يوم', 'Every week': 'كل أسبوع',
    'Sunday': 'الأحد', 'Monday': 'الاثنين', 'Tuesday': 'الثلاثاء', 'Wednesday': 'الأربعاء', 'Thursday': 'الخميس', 'Friday': 'الجمعة', 'Saturday': 'السبت',
    'Save schedule': 'حفظ الجدول',
    'Sentivyre runs a quick scan by itself at the time you choose (it needs to be open or in the tray).': 'يجري سنتيفاير فحصاً سريعاً تلقائياً في الوقت الذي تختاره (يجب أن يكون مفتوحاً أو في شريط النظام).',
    'Scheduled scans are off.': 'الفحص المجدول متوقف.', '✓ Schedule saved': '✓ تم حفظ الجدول', 'Scheduled scan started': 'بدأ الفحص المجدول',
    'Sentivyre is running your quick scan.': 'سنتيفاير يجري الفحص السريع الآن.',
    'Download Shield': 'درع التنزيلات', 'Scan every new download': 'افحص كل تنزيل جديد',
    'Checks each file as soon as it lands in your Downloads folder': 'يفحص كل ملف فور وصوله إلى مجلد التنزيلات',
    'No downloads checked yet.': 'لم يتم فحص أي تنزيل بعد.', 'Quarantine': 'الحجر', 'Nothing in quarantine.': 'لا يوجد شيء في الحجر.',
    "Files moved here can't run. Restore them if you're sure they're safe.": 'الملفات المنقولة هنا لا يمكن تشغيلها. استعدها فقط إذا كنت متأكداً أنها آمنة.',
    'Check your Wi-Fi and see every device on your network.': 'افحص شبكة الواي فاي وشاهد كل جهاز متصل بشبكتك.',
    'Refresh': 'تحديث', 'Wi-Fi': 'واي فاي', 'Checking…': 'جارٍ الفحص…', 'Devices on your network': 'الأجهزة على شبكتك',
    'Find phones, laptops, TVs and anything else connected.': 'ابحث عن الهواتف والحواسيب والتلفزيونات وأي جهاز متصل.',
    'Find devices': 'ابحث عن الأجهزة', 'Searching…': 'جارٍ البحث…',
    "Don't recognise a device? Change your Wi-Fi password in your router settings. Phones often use a private address, so they may show as \"Private device\".": 'لا تعرف جهازاً؟ غيّر كلمة مرور الواي فاي من إعدادات الراوتر. الهواتف غالباً تستخدم عنواناً خاصاً، لذلك قد تظهر باسم "جهاز خاص".',
    'Not on Wi-Fi': 'غير متصل بالواي فاي', 'WIRED / OFFLINE': 'سلكي / غير متصل', 'Hidden network': 'شبكة مخفية', 'SECURE': 'آمنة', 'WEAK': 'ضعيفة', 'NOT SAFE': 'غير آمنة',
    'Security': 'الحماية', 'Encryption': 'التشفير', 'Signal': 'الإشارة', 'Band': 'النطاق', '⚠ Unsafe Wi-Fi': '⚠ واي فاي غير آمن',
    'This PC': 'هذا الجهاز', 'Router': 'الراوتر', 'Private device': 'جهاز خاص', 'Unknown device': 'جهاز غير معروف', 'NEW': 'جديد',
    'Rename': 'إعادة تسمية', 'Mark as mine': 'هذا جهازي', 'My device': 'جهازي', 'Could not scan network': 'تعذر فحص الشبكة', 'Works in the Windows app': 'يعمل في تطبيق Windows',
    'This Wi-Fi has no password, so anyone nearby can see what you send. Avoid logging in or banking here.': 'هذه الشبكة بلا كلمة مرور، لذا يستطيع أي شخص قريب رؤية ما ترسله. تجنب تسجيل الدخول أو المعاملات البنكية هنا.',
    'WEP security is very old and can be broken in minutes.': 'حماية WEP قديمة جداً ويمكن اختراقها في دقائق.',
    'WPA (version 1) is outdated. Ask for WPA2 or WPA3.': 'حماية WPA (الإصدار الأول) قديمة. استخدم WPA2 أو WPA3.',
    'TKIP encryption is outdated. Switch the router to AES.': 'تشفير TKIP قديم. غيّر إعداد الراوتر إلى AES.',
    'WPA3 is the newest and strongest Wi-Fi security.': 'WPA3 هي أحدث وأقوى حماية للواي فاي.', 'WPA2 with AES is a safe, standard setup.': 'WPA2 مع AES إعداد آمن وقياسي.',
    "Paste any suspicious message, and AI will tell you if it's a scam.": 'الصق أي رسالة مشبوهة، وسيخبرك الذكاء الاصطناعي إن كانت احتيالاً.',
    'Message, email or WhatsApp text': 'رسالة نصية أو بريد أو واتساب', 'Scan message': 'افحص الرسالة', 'Try an example': 'جرّب مثالاً', 'Scanning…': 'جارٍ الفحص…',
    'Check a website address before you click it.': 'افحص عنوان الموقع قبل أن تضغط عليه.', 'Website link': 'رابط الموقع', 'Check link': 'افحص الرابط',
    'Checked on your PC. The link is not opened.': 'تم الفحص على جهازك. لم يتم فتح الرابط.',
    'See how strong your password is. It never leaves your PC.': 'اعرف مدى قوة كلمة مرورك. لا تغادر جهازك أبداً.',
    'Password': 'كلمة المرور', 'Type a password': 'اكتب كلمة مرور', 'Show': 'إظهار', 'Hide': 'إخفاء', 'Start typing…': 'ابدأ الكتابة…',
    'Generate a strong password': 'أنشئ كلمة مرور قوية', 'Weak': 'ضعيفة', 'Okay': 'مقبولة', 'Strong': 'قوية', 'Very strong': 'قوية جداً',
    'Ask anything about staying safe online, in English or Arabic.': 'اسأل أي شيء عن الأمان على الإنترنت، بالعربية أو الإنجليزية.',
    "Hi, I'm Vyra 👋 I can check if something looks like a scam, explain cyber threats in simple words, or help you if you think you've been hacked. What can I help with?": 'مرحباً، أنا فيرا 👋 أستطيع أن أتحقق إن كان شيء ما احتيالاً، وأشرح التهديدات الإلكترونية بكلمات بسيطة، وأساعدك إن ظننت أنك تعرضت للاختراق. كيف أساعدك؟',
    'Is this link safe: bit.ly/free-iphone': 'هل هذا الرابط آمن: bit.ly/free-iphone', 'I think I got hacked, what do I do?': 'أظن أنني تعرضت للاختراق، ماذا أفعل؟',
    'How do I make my Wi-Fi safe?': 'كيف أجعل شبكة الواي فاي آمنة؟', 'Ask Vyra…': 'اسأل فيرا…', 'Send': 'إرسال', 'Thinking…': 'تفكر…', 'Vyra is thinking…': 'فيرا تفكر…',
    'Vyra needs an AI key to answer. Add one in Settings → AI connection.': 'تحتاج فيرا إلى مفتاح ذكاء اصطناعي للإجابة. أضفه من الإعدادات ← اتصال الذكاء الاصطناعي.',
    'Manage your account, login and notifications.': 'إدارة حسابك وتسجيل الدخول والإشعارات.', 'Account & login': 'الحساب وتسجيل الدخول',
    'Name': 'الاسم', 'Your name': 'اسمك', 'Email': 'البريد الإلكتروني', 'Sign in': 'تسجيل الدخول', 'Sign out': 'تسجيل الخروج',
    'Your account is saved on this PC only.': 'حسابك محفوظ على هذا الجهاز فقط.', 'App lock': 'قفل التطبيق',
    'Ask for a PIN every time Sentivyre opens': 'اطلب رمز PIN في كل مرة يُفتح فيها سنتيفاير', 'Set a 4–6 digit PIN': 'عيّن رمز PIN من 4 إلى 6 أرقام', 'Save PIN': 'حفظ الرمز',
    'Notifications': 'الإشعارات', 'Threat alerts': 'تنبيهات التهديدات', 'Pop-up when a scam or dangerous link is found': 'تنبيه عند اكتشاف احتيال أو رابط خطير',
    'Safe results': 'النتائج الآمنة', 'Pop-up when a check comes back clean': 'تنبيه عندما يكون الفحص سليماً', 'Alert sound': 'صوت التنبيه',
    'Play a short sound with threat alerts': 'تشغيل صوت قصير مع تنبيهات التهديد', 'Daily security tip': 'نصيحة أمنية يومية', 'Show a tip on the dashboard': 'عرض نصيحة في لوحة التحكم',
    'Keep protecting when closed': 'استمر في الحماية عند الإغلاق', 'Sentivyre stays in the system tray and keeps checking downloads': 'يبقى سنتيفاير في شريط النظام ويواصل فحص التنزيلات',
    'Start with Windows': 'التشغيل مع Windows', 'Open Sentivyre quietly in the tray when your PC starts': 'افتح سنتيفاير بهدوء في شريط النظام عند تشغيل الجهاز',
    'Send test notification': 'إرسال إشعار تجريبي', 'Updates': 'التحديثات', 'Automatic updates': 'التحديثات التلقائية',
    'Download new versions from GitHub and install them when Sentivyre closes': 'تنزيل الإصدارات الجديدة من GitHub وتثبيتها عند إغلاق سنتيفاير',
    "Show what's new": 'عرض الجديد', 'Pop-up after Sentivyre updates': 'تنبيه بعد تحديث سنتيفاير', 'Check for updates': 'البحث عن تحديثات', 'Restart & update': 'إعادة التشغيل والتحديث',
    'Language': 'اللغة', 'Vyra also answers in the language you write in.': 'فيرا تجيب أيضاً باللغة التي تكتب بها.',
    'Business dashboard': 'لوحة تحكم الشركات', "Send this PC's safety status to your Vyrelock business dashboard, so you can see all your company's PCs on one page.": 'أرسل حالة أمان هذا الجهاز إلى لوحة تحكم Vyrelock لشركتك، لترى كل أجهزة الشركة في صفحة واحدة.',
    'Report to business dashboard': 'الإرسال إلى لوحة تحكم الشركات', "This PC's name": 'اسم هذا الجهاز', 'Team code': 'رمز الفريق', 'Firebase connection': 'اتصال Firebase',
    'Firebase project ID': 'معرّف مشروع Firebase', 'Firebase Web API key': 'مفتاح Firebase Web API', 'Save & test': 'حفظ واختبار', 'Testing…': 'جارٍ الاختبار…',
    '✓ Connected to your dashboard': '✓ تم الاتصال بلوحة التحكم', 'AI connection': 'اتصال الذكاء الاصطناعي', 'Anthropic API key': 'مفتاح Anthropic API',
    'Vyra and the AI scam scan use Claude. Paste your Anthropic API key to turn them on. Without a key, Sentivyre uses its built-in offline rules.': 'فيرا والفحص الذكي للاحتيال يستخدمان Claude. الصق مفتاح Anthropic API لتفعيلهما. بدون مفتاح، يستخدم سنتيفاير قواعده المدمجة دون اتصال.',
    'Save': 'حفظ', 'Remove key': 'إزالة المفتاح', "What's new": 'ما الجديد', 'AI is connected ✓': 'الذكاء الاصطناعي متصل ✓', 'No key saved. AI features are off.': 'لم يُحفظ مفتاح. ميزات الذكاء الاصطناعي متوقفة.',
    'Think you\'ve been hacked or scammed? Stay calm and follow these steps in order.': 'هل تظن أنك تعرضت للاختراق أو الاحتيال؟ ابقَ هادئاً واتبع هذه الخطوات بالترتيب.',
    'Reset': 'إعادة ضبط', 'Disconnect from the internet': 'افصل الإنترنت', 'Turn off Wi-Fi or unplug the cable so the attacker loses access.': 'أوقف الواي فاي أو افصل الكابل حتى يفقد المهاجم الوصول.',
    'Call your bank': 'اتصل بالبنك', 'If you shared card or bank details, ask them to block your card right away.': 'إذا شاركت بيانات بطاقتك أو حسابك، اطلب منهم إيقاف البطاقة فوراً.',
    'Change your email password first': 'غيّر كلمة مرور بريدك أولاً', 'From a different, safe device. Your email can reset all your other accounts.': 'من جهاز آخر آمن. بريدك يستطيع إعادة تعيين كل حساباتك الأخرى.',
    'Change other important passwords': 'غيّر كلمات المرور المهمة الأخرى', 'Banking, social media and shopping. Use a new, different password for each.': 'البنوك ووسائل التواصل والتسوق. استخدم كلمة مرور جديدة ومختلفة لكل حساب.',
    'Turn on two-factor authentication (2FA)': 'فعّل التحقق بخطوتين (2FA)', 'Add a code from your phone so a stolen password is not enough.': 'أضف رمزاً من هاتفك حتى لا تكفي كلمة المرور المسروقة.',
    'Run a full security scan': 'أجرِ فحصاً أمنياً كاملاً', 'Use Windows Security (Microsoft Defender) to scan and remove malware.': 'استخدم أمان Windows (Microsoft Defender) لفحص البرامج الضارة وإزالتها.',
    'Report it': 'أبلغ عن الأمر', "Tell your bank, your workplace's IT and your local police or cybercrime reporting service.": 'أخبر البنك وقسم تقنية المعلومات في عملك والشرطة أو جهة الإبلاغ عن الجرائم الإلكترونية.',
    'Sentivyre is locked': 'سنتيفاير مقفل', 'Enter PIN': 'أدخل الرمز', 'Unlock': 'فتح', 'Wrong PIN. Try again.': 'رمز خاطئ. حاول مرة أخرى.',
    'Dangerous': 'خطير', 'Suspicious': 'مشبوه', 'Looks safe': 'يبدو آمناً', 'DANGEROUS': 'خطير', 'SUSPICIOUS': 'مشبوه', 'CHECK': 'تحقق', 'SAFE': 'آمن',
    'Quarantine ': 'حجر', 'Ask Vyra': 'اسأل فيرا', 'Ignore': 'تجاهل', 'Restore': 'استعادة', 'Delete forever': 'حذف نهائي', 'Click again to delete': 'اضغط مرة أخرى للحذف',
    '⚠ Threats found': '⚠ تم العثور على تهديدات', 'Scan complete: a few files to check': 'اكتمل الفحص: بعض الملفات تحتاج مراجعة', '✓ Your PC looks safe': '✓ جهازك يبدو آمناً',
    'Scan cancelled': 'تم إلغاء الفحص', 'Scan stopped': 'توقف الفحص', '⚠ Dangerous download': '⚠ تنزيل خطير',
    'Checked by Sentivyre and Microsoft Defender': 'تم الفحص بواسطة سنتيفاير وMicrosoft Defender', 'Checked by Sentivyre': 'تم الفحص بواسطة سنتيفاير',
    '✓ Microsoft Defender is also used for a second opinion.': '✓ يُستخدم Microsoft Defender أيضاً كرأي ثانٍ.', 'Microsoft Defender was not found, so Sentivyre uses its own checks only.': 'لم يُعثر على Microsoft Defender، لذلك يستخدم سنتيفاير فحوصاته الخاصة فقط.',
    '✓ Quarantined': '✓ تم الحجر', '✓ Restored': '✓ تمت الاستعادة', '⚠ Threat detected': '⚠ تم اكتشاف تهديد', '✓ All clear': '✓ كل شيء سليم', '⚠ Test alert': '⚠ تنبيه تجريبي',
    'This is how Sentivyre warns you about a threat.': 'هكذا ينبهك سنتيفاير عند وجود تهديد.',
    'Do not reply, click links or share any codes. Delete the message and contact the company using its official number.': 'لا ترد، ولا تضغط على الروابط، ولا تشارك أي رموز. احذف الرسالة وتواصل مع الشركة عبر رقمها الرسمي.',
    'Be careful. Do not click links. Check with the sender using a phone number you already trust.': 'كن حذراً. لا تضغط على الروابط. تحقق من المرسل عبر رقم هاتف تثق به.',
    'This looks okay, but never share passwords or OTP codes with anyone.': 'تبدو سليمة، لكن لا تشارك كلمات المرور أو رموز التحقق مع أي شخص.',
    'Never share an OTP code. Real banks will never ask for it.': 'لا تشارك رمز التحقق أبداً. البنوك الحقيقية لن تطلبه منك.',
    'Turn on two-factor authentication for your email first.': 'فعّل التحقق بخطوتين لبريدك الإلكتروني أولاً.', 'Hover over a link to see where it really goes before clicking.': 'مرّر المؤشر فوق الرابط لترى وجهته الحقيقية قبل الضغط.',
    'Use a different password for every important account.': 'استخدم كلمة مرور مختلفة لكل حساب مهم.', 'Public Wi-Fi is risky. Avoid banking on it.': 'الواي فاي العام خطر. تجنب المعاملات البنكية عليه.',
    'Update Windows and your apps. Updates fix security holes.': 'حدّث Windows وتطبيقاتك. التحديثات تسد الثغرات الأمنية.', 'If a message makes you panic or rush, it is probably a scam.': 'إذا جعلتك رسالة تشعر بالذعر أو العجلة، فهي على الأرجح احتيال.',
    'Great password! Use it for one account only.': 'كلمة مرور رائعة! استخدمها لحساب واحد فقط.',
    'Use at least 12 characters.': 'استخدم 12 حرفاً على الأقل.', 'Add capital letters.': 'أضف أحرفاً كبيرة.', 'Add numbers.': 'أضف أرقاماً.', 'Add symbols like ! # $ %.': 'أضف رموزاً مثل ! # $ %.',
    'Avoid repeating the same character.': 'تجنب تكرار الحرف نفسه.', 'Avoid simple sequences like 123 or abc.': 'تجنب التسلسلات البسيطة مثل 123 أو abc.',
    'This is one of the most common passwords. Hackers try it first.': 'هذه من أكثر كلمات المرور شيوعاً، ويجربها المخترقون أولاً.',
    'Updates work in the installed app only.': 'التحديثات تعمل في التطبيق المثبت فقط.', 'Automatic updates are on.': 'التحديثات التلقائية مفعّلة.',
    'Could not reach GitHub. Check your internet connection.': 'تعذر الوصول إلى GitHub. تحقق من اتصالك بالإنترنت.', 'Checking GitHub for a new version…': 'جارٍ البحث في GitHub عن إصدار جديد…',
    '✓ Signed in': '✓ تم تسجيل الدخول', '✓ PIN saved': '✓ تم حفظ الرمز', 'App lock is on.': 'قفل التطبيق مفعّل.', '✓ AI connected': '✓ تم الاتصال بالذكاء الاصطناعي',
    'No scan yet': 'لا يوجد فحص بعد', 'PC Scan works in the installed Windows app.': 'فحص الجهاز يعمل في تطبيق Windows المثبت.'
  };
  var REASONS = {
    'Fake file type: looks like a document or picture but is really a program': 'نوع ملف مزيف: يبدو مستنداً أو صورة لكنه في الحقيقة برنامج',
    'Hides its real file type with extra spaces': 'يخفي نوعه الحقيقي بمسافات إضافية', 'Starts automatically when Windows starts': 'يعمل تلقائياً عند تشغيل Windows',
    'Unusual program type often used by malware': 'نوع برنامج غير معتاد تستخدمه البرامج الضارة غالباً', 'Program or script downloaded from the internet': 'برنامج أو سكربت تم تنزيله من الإنترنت',
    'Came from the internet': 'مصدره الإنترنت', 'Empty program file': 'ملف برنامج فارغ'
  };
  var PATTERNS = [
    [/^Welcome back, (.+)$/, 'مرحباً بعودتك، $1'], [/^Next scan: (.+)$/, 'الفحص القادم: $1'], [/^Time to crack: (.+)$/, 'وقت الاختراق: $1'],
    [/^Up to date · checked (.+)$/, 'محدّث · آخر فحص $1'], [/^Last report: (.+)$/, 'آخر إرسال: $1'], [/^([\d,]+) files checked · (\d+) to review$/, 'تم فحص $1 ملف · $2 للمراجعة'],
    [/^([\d,]+) files checked$/, 'تم فحص $1 ملف'], [/^(\d+) \/ (\d+) done$/, 'تم $1 من $2'], [/^(\d+) devices found(.*)$/, 'تم العثور على $1 جهاز'],
    [/^(Quick|Full) scan running…$/, function (m, k) { return k === 'Full' ? 'الفحص الكامل جارٍ…' : 'الفحص السريع جارٍ…'; }],
    [/^(\d+)% RISK$/, 'خطورة $1%'], [/^Checks each file as soon as it lands in (.+)$/, 'يفحص كل ملف فور وصوله إلى $1'], [/^Report failed: (.+)$/, 'فشل الإرسال: $1']
  ];
  function tr(text) {
    var t = text.trim(); if (!t) return null;
    if (AR[t]) return text.replace(t, AR[t]);
    if (REASONS[t]) return text.replace(t, REASONS[t]);
    if (t.indexOf(' · ') > 0 && t.split(' · ').every(function (p) { return REASONS[p] || /^Microsoft Defender: /.test(p); })) {
      return t.split(' · ').map(function (p) { return REASONS[p] || p.replace('Microsoft Defender: ', 'Microsoft Defender: '); }).join(' · ');
    }
    for (var i = 0; i < PATTERNS.length; i++) { if (PATTERNS[i][0].test(t)) return t.replace(PATTERNS[i][0], PATTERNS[i][1]); }
    return null;
  }
  var busy = false;
  function apply(root) {
    if (LANG !== 'ar' || busy) return; busy = true;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n; while ((n = w.nextNode())) {
      var p = n.parentNode; if (!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName) || p.closest('.msg, .explain, .path, #pwGenOut')) continue;
      var out = tr(n.nodeValue); if (out != null && out !== n.nodeValue) { if (n.__en == null) n.__en = n.nodeValue; n.nodeValue = out; }
    }
    var els = (root.querySelectorAll ? root : document).querySelectorAll('[placeholder],[aria-label]');
    for (var i = 0; i < els.length; i++) {
      ['placeholder', 'aria-label'].forEach(function (a) { var v = els[i].getAttribute(a); var o = v && tr(v); if (o) { if (!els[i]['__en_' + a]) els[i]['__en_' + a] = v; els[i].setAttribute(a, o); } });
    }
    busy = false;
  }
  function revert() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) { if (n.__en != null) { n.nodeValue = n.__en; n.__en = null; } }
    document.querySelectorAll('[placeholder],[aria-label]').forEach(function (e) { ['placeholder', 'aria-label'].forEach(function (a) { if (e['__en_' + a]) { e.setAttribute(a, e['__en_' + a]); e['__en_' + a] = null; } }); });
  }
  var mo = new MutationObserver(function (list) {
    if (LANG !== 'ar' || busy) return;
    list.forEach(function (m) {
      if (m.type === 'characterData') { var o = tr(m.target.nodeValue); if (o && o !== m.target.nodeValue) { busy = true; m.target.__en = m.target.nodeValue; m.target.nodeValue = o; busy = false; } }
      m.addedNodes.forEach(function (a) { if (a.nodeType === 1) apply(a); else if (a.nodeType === 3 && a.parentNode) apply(a.parentNode); });
    });
  });
  window.setLang = function (l) {
    LANG = l === 'ar' ? 'ar' : 'en';
    try { localStorage.setItem('svy_lang', LANG); } catch (e) { /* ignore */ }
    document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';
    if (LANG === 'ar') apply(document.body); else revert();
  };
  document.addEventListener('DOMContentLoaded', function () {
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    var saved = 'en'; try { saved = localStorage.getItem('svy_lang') || 'en'; } catch (e) { /* ignore */ }
    if (saved === 'ar') setTimeout(function () { setLang('ar'); }, 0);
  });
})();
