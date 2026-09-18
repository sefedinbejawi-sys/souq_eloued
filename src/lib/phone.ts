/** Convert common Algerian phone formats to the international digits-only format expected by wa.me. */
export function toWhatsAppNumber(value: string | null | undefined): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `213${digits.slice(1)}`;
  else if (!digits.startsWith('213') && digits.length <= 10) digits = `213${digits}`;
  return digits;
}
