export function formatCalendarDate(value, language = 'fa', { withTime = false, weekday = false } = {}) {
  const locale = language === 'fa' ? 'fa-IR-u-ca-persian-nu-arabext' : 'en-US-u-ca-gregory';
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

  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}
