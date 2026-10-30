/**
 * Formate une date en chaîne locale française
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formate une date sans heure
 */
export const formatDateOnly = (date: string | Date | null | undefined): string => {
  if (!date) return '-';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formate l'heure uniquement
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Capitalise la première lettre
 */
export const capitalize = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Tronque une chaîne
 */
export const truncate = (str: string | null | undefined, length: number = 50): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Slugify une chaîne (pour URLs)
 */
export const slugify = (str: string): string => {
  if (!str) return '';

  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Formate un nombre en devise
 *
 * @param value - Nombre, string ou null
 * @param currency - Code devise (EUR, USD, GBP...)
 * @param locale - Locale pour le formatage (défaut: 'fr-FR')
 * @returns Chaîne formatée (ex: "1 234,56 €")
 */
export const formatCurrency = (
  value: number | string | null | undefined,
  currency: string = 'EUR',
  locale: string = 'fr-FR',
): string => {
  if (value === null || value === undefined || value === '') {
    return formatCurrency(0, currency, locale);
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return formatCurrency(0, currency, locale);
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Formate un nombre avec séparateur de milliers
 */
export const formatNumber = (value: number | string | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Formate un pourcentage
 */
export const formatPercent = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '0%';

  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';

  return `${num}%`;
};

/**
 * Retourne la valeur par défaut si la valeur est vide
 */
export const defaultValue = <T>(value: T | null | undefined, fallback: T): T => {
  return value ?? fallback;
};

export const capitalizeFirstLetter = (value: string): string => {
  if (value.length === 0) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// Convertir  ISO string → Date object
export const toDate = (isoString: Date | null): Date | null => {
  if (!isoString) return null;
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
};

// Convertir Date object → ISO string
export const fromDate = (date: Date | Date[] | (Date | null)[] | null | undefined): string | null => {
  if (!date) return null;
  if (Array.isArray(date)) {
    return date
      .filter((d) => d !== null)
      .map((d) => d!.toISOString())
      .join(',');
  }
  return date.toISOString();
};
