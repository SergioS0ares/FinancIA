import { environment } from '../../environments/environment';

declare const google: any;

let gisInitialized = false;

function ensureInitialized(): boolean {
  if (typeof google === 'undefined') {
    return false;
  }
  if (!gisInitialized) {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      ux_mode: 'redirect',
      login_uri: 'http://localhost:8000/api/auth/google/callback',
    });
    gisInitialized = true;
  }
  return true;
}

function isDarkTheme(): boolean {
  const el = document.documentElement;
  return el.classList.contains('dark') || el.classList.contains('theme-dark');
}

export type GoogleButtonText = 'continue_with' | 'signup_with' | 'signin_with';

/**
 * Re-renderiza o botão oficial do Google (GIS) conforme o tema claro/escuro da página.
 */
export function renderGoogleIdentityButton(
  host: HTMLElement | null,
  options: { text?: GoogleButtonText } = {}
): void {
  if (!host || !ensureInitialized()) {
    return;
  }
  host.innerHTML = '';
  const text = options.text ?? 'continue_with';
  google.accounts.id.renderButton(host, {
    theme: isDarkTheme() ? 'filled_black' : 'outline',
    size: 'large',
    width: '100%',
    text,
  });
}

/**
 * Renderiza e passa a atualizar o botão quando `.dark` / `.theme-dark` mudam no &lt;html&gt;.
 */
export function bindGoogleButtonToTheme(
  host: HTMLElement | null,
  options: { text?: GoogleButtonText } = {}
): () => void {
  renderGoogleIdentityButton(host, options);
  const observer = new MutationObserver(() => renderGoogleIdentityButton(host, options));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}
