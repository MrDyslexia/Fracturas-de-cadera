export const normEmail = (s: string) => (s || '').trim().toLowerCase();
export const strongPwd = (s: string) => s?.length >= 8 && /[A-Z]/.test(s) && /\d/.test(s);

/** Valida RUT chileno con dígito verificador (formato flexible). */
export function isValidRutCl(raw: string): boolean {
  if (!raw) return false;
  const clean = raw.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let suma = 0, multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  const dvCalc = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvCalc;
}

/** Formatea 12345678-9 => 12.345.678-9 */
export function formatRutCl(raw: string): string {
  const c = raw.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  const cuerpo = c.slice(0, -1);
  const dv = c.slice(-1);
  const rev = cuerpo.split('').reverse().join('').match(/.{1,3}/g)?.join('.') ?? cuerpo;
  return `${rev.split('').reverse().join('')}-${dv}`;
}
