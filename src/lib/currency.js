export function toCurrency (value, decimal = 0, section = 3, locale = 'Rp. ') {
  let money = '\\d(?=(\\d{' + (section || 3) + '})+' + (decimal > 0 ? '\\.' : '$') + ')'
  return locale + parseInt(value).toFixed(Math.max(0, ~~decimal)).replace(new RegExp(money, 'g'), '$&,')
}
