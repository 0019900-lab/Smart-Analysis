# StatLab
تشغيل محلي: افتح الطرفية في المجلد ثم `python -m http.server 8080` وافتح http://localhost:8080 — وهيظهر زر "تثبيت" أو أيقونة التثبيت في شريط العنوان.
للنشر: ارفع المجلد على أي استضافة ثابتة (GitHub Pages / Netlify) وبكده يتسطب من المتصفح.


## استيراد Excel (.xlsx)
مكتبة SheetJS 0.20.3 موجودة جاهزة في `vendor/`، وبتتحمل تلقائياً عند فتح ملف Excel (أول ورقة).

## الاختبارات
`node tests/data.test.mjs` و `node tests/xlsx.test.mjs` و `node tests/stats.test.mjs` (مقارنة مع SciPy) و `node tests/analyses.test.mjs` و`node tests/report.test.mjs`، واختبار الواجهة: `python3 tests/ui.smoke.py`
