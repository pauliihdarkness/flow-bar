/**
 * Formatea un número como pesos argentinos (ARS)
 * @param {number} amount - El monto a formatear
 * @param {boolean} includeDecimals - Si debe incluir centavos (por defecto false para Bares/Inflación)
 * @returns {string} - El monto formateado como $ 1.234
 */
export const formatARS = (amount, includeDecimals = false) => {
  if (amount === undefined || amount === null) return '$ 0';
  
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });

  // Reemplazamos el símbolo pegado por uno con espacio para mejor legibilidad premium
  return formatter.format(amount).replace('$', '$ ');
};
