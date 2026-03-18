/**
 * Extrai mensagem de erro da resposta da API (FastAPI usa detail como string ou array).
 * Usado nos toasts para mostrar o erro retornado pelo backend.
 */
export function getApiErrorMessage(err: any, fallback: string): string {
  const detail = err?.error?.detail ?? err?.error?.erro ?? err?.error?.message ?? err?.message;
  if (detail == null) return fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    return typeof first === 'object' && first != null && 'msg' in first
      ? String((first as { msg: string }).msg)
      : String(first);
  }
  return fallback;
}
