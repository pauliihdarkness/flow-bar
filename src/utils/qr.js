const ORDER_QR_PREFIX = 'flowbar:order:';

export const buildOrderQrValue = (orderId) => `${ORDER_QR_PREFIX}${orderId}`;

export const parseOrderQrValue = (rawValue) => {
  if (!rawValue || typeof rawValue !== 'string') {
    return null;
  }

  const trimmedValue = rawValue.trim();

  if (trimmedValue.startsWith(ORDER_QR_PREFIX)) {
    return trimmedValue.slice(ORDER_QR_PREFIX.length) || null;
  }

  return /^[A-Za-z0-9_-]{10,}$/.test(trimmedValue) ? trimmedValue : null;
};