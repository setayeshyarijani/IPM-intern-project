export function formatCalendarDate(value, language = 'fa', { withTime = false, weekday = false } = {}) {
  // تعریف locale مناسب بر اساس زبان
  let locale;
  if (language === 'fa') {
    locale = 'fa-IR-u-ca-persian'; // حذف nu-arabext برای راست‌چین شدن اعداد
  } else {
    locale = 'en-US-u-ca-gregory';
  }
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(weekday ? { weekday: 'long' } : {}),
    ...(withTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }
      : {}),
  };

  // برای تاریخ فارسی، اعداد را به صورت راست‌چین نمایش می‌دهیم
  if (language === 'fa') {
    // استفاده از تنظیمات فارسی با اعداد راست‌چین
    return new Intl.DateTimeFormat('fa-IR', options).format(new Date(value));
  }
  
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}