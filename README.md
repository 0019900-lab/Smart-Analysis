# StatLab
تشغيل محلي: افتح الطرفية في المجلد ثم `python -m http.server 8080` وافتح http://localhost:8080 — وهيظهر زر "تثبيت" أو أيقونة التثبيت في شريط العنوان.
للنشر: ارفع المجلد على أي استضافة ثابتة (GitHub Pages / Netlify) وبكده يتسطب من المتصفح.


## استيراد Excel (.xlsx)
نزّل `xlsx.full.min.js` من SheetJS (https://cdn.sheetjs.com) وحطه في `vendor/xlsx.full.min.js`، والتطبيق بيحمله تلقائياً عند فتح ملف Excel.

## اختبار منطق البيانات
`node tests/data.test.mjs`
