// StatLab – اللغة والمصطلحات | Language & terminology
// T(ar,en) يرجّع النص حسب لغة الواجهة الحالية. آمن للاستخدام داخل Node.
export const lang=()=>globalThis.document?.documentElement?.lang==='en'?'en':'ar';
export const T=(ar,en)=>lang()==='ar'?ar:(en??ar);
// قاموس المصطلحات الموحّد: [عربي، English، شرح مبسّط عربي، plain English]
// ملاحظة: نتائج التحاليل بتفضل بمصطلحات SPSS الإنجليزية (معيار النشر العلمي)، والواجهة بتعرض الاثنين.
export const GLOSSARY=[
['متغير','Variable','عمود في الجدول بيمثل صفة بتتقاس (زي العمر أو الجنس).','A column that holds one measured attribute.'],
['حالة','Case','صف واحد في الجدول (شخص أو مشاهدة).','One row: a person or observation.'],
['قيمة مفقودة','Missing value','خلية فاضية أو قيمة معرّفة كـ «غير متاح» وبتتستبعد من الحساب.','An empty or flagged value excluded from calculations.'],
['تسمية القيمة','Value label','نص بيفسّر كود رقمي، مثلاً 1 = ذكر.','Text that explains a numeric code, e.g. 1 = Male.'],
['مستوى القياس','Measure','اسمي (Nominal) أو رتبي (Ordinal) أو كمّي (Scale).','Nominal, Ordinal or Scale.'],
['المتوسط الحسابي','Mean','مجموع القيم مقسوم على عددها.','Sum of values divided by their count.'],
['الوسيط','Median','القيمة اللي في نص الترتيب.','The middle value when sorted.'],
['المنوال','Mode','القيمة الأكثر تكراراً.','The most frequent value.'],
['الانحراف المعياري','Std. Deviation','مقياس لتشتت القيم حول المتوسط.','How spread out values are around the mean.'],
['التباين','Variance','مربع الانحراف المعياري.','The squared standard deviation.'],
['الخطأ المعياري','Std. Error','مقدار عدم الدقة في تقدير المتوسط.','Uncertainty of an estimate such as the mean.'],
['الالتواء','Skewness','مدى عدم تماثل التوزيع.','Asymmetry of a distribution.'],
['التفلطح','Kurtosis','مدى حدة قمة التوزيع وسُمك ذيوله.','Peakedness and tail weight.'],
['الدلالة الإحصائية','Sig. (p-value)','احتمال ظهور النتيجة بالصدفة؛ أقل من 0.05 تُعتبر دالة.','Chance of such a result under no effect; < .05 is significant.'],
['درجات الحرية','df','عدد القيم الحرة في الحساب.','Number of values free to vary.'],
['فترة الثقة 95%','95% CI','المدى اللي غالباً بيحتوي القيمة الحقيقية.','Range likely to contain the true value.'],
['حجم التأثير','Effect size','قوة الفرق أو العلاقة بغض النظر عن حجم العينة.','Strength of an effect regardless of sample size.'],
['اختبار T','T Test','مقارنة متوسطين.','Compares two means.'],
['تحليل التباين','ANOVA','مقارنة متوسطات أكتر من مجموعتين.','Compares means of 3+ groups.'],
['الارتباط','Correlation','قوة واتجاه العلاقة بين متغيرين.','Strength and direction of a relationship.'],
['جدول تقاطعي','Crosstab','جدول تكرارات لمتغيرين فئويين.','Frequency table for two categorical variables.'],
['مربع كاي','Chi-square','اختبار الاستقلال بين متغيرين فئويين.','Tests independence of categorical variables.'],
['المخرجات','Output','نافذة النتائج (جداول وملاحظات).','The results window.'],
['عرض البيانات','Data View','شبكة البيانات اللي بتكتب فيها.','The data grid.'],
['عرض المتغيرات','Variable View','جدول تعريف خصائص المتغيرات.','Where variables are defined.']];
