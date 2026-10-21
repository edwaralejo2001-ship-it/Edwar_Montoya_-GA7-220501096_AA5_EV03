class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

function validatePositiveInteger(value, label) {
  if (!Number.isSafeInteger(Number(value)) || Number(value) <= 0) {
    throw new AppError(`${label} debe ser un entero mayor que cero.`);
  }
  return Number(value);
}

function validateNonNegativeNumber(value, label) {
  if (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0) {
    throw new AppError(`${label} debe ser un número mayor o igual a cero.`);
  }
  return Number(value);
}

function validateNonNegativeInteger(value, label) {
  if (!Number.isSafeInteger(Number(value)) || Number(value) < 0) {
    throw new AppError(`${label} debe ser un entero mayor o igual a cero.`);
  }
  return Number(value);
}

function validateText(value, label, maxLength = 150) {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > maxLength) {
    throw new AppError(`${label} es obligatorio y debe tener máximo ${maxLength} caracteres.`);
  }
  return value.trim();
}

module.exports = {
  AppError,
  validateNonNegativeInteger,
  validateNonNegativeNumber,
  validatePositiveInteger,
  validateText
};
