// Функция для фильтрации ввода только цифр, точки и запятой
export const filterNumericInput = (value: string): string => {
  let filtered = value.replace(/[^0-9.,]/g, '');

  filtered = filtered.replace(',', '.');

  const parts = filtered.split('.');
  if (parts.length > 2) {
    filtered = parts[0] + '.' + parts.slice(1).join('');
  }

  if (filtered.length > 0) {
    const [integerPart, decimalPart] = filtered.split('.');

    const cleanedInteger = integerPart.replace(/^0+/, '') || '0';

    filtered =
      decimalPart !== undefined
        ? `${cleanedInteger}.${decimalPart}`
        : cleanedInteger;
  }

  return filtered;
};

export function formatNumber(
  value: number | string,
  separator: string = ' ',
  decimalSeparator: string = '.'
): string {
  // Конвертируем в число
  const num = typeof value === 'string' ? parseFloat(value) : value;

  // Проверка на валидность числа
  if (isNaN(num)) {
    return '0';
  }

  // Разделяем на целую и дробную части
  const [integerPart, decimalPart] = num.toFixed(2).split('.');

  // Форматируем целую часть с разделителями тысяч
  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    separator
  );

  // Возвращаем результат с дробной частью если она есть
  if (decimalPart && parseInt(decimalPart) !== 0) {
    return `${formattedInteger}${decimalSeparator}${decimalPart}`;
  }

  return formattedInteger;
}
