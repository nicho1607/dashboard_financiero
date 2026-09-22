/**
 * Formatea un número a formato latino de moneda (puntos para miles, coma para decimales).
 * Ejemplo: 143955.38 -> "143.955,38"
 */
export function formatMoney(value: number): string {
  return value.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
