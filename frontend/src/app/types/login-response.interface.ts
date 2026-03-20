export type TipoUsuario = 'CLIENTE' | 'RESTAURANTE' | 'FUNCIONARIO';

/** Resposta do backend Python: login/google devolve access_token (refresh vai no cookie HTTP-Only). */
export interface LoginResponse {
  access_token?: string;
  token?: string; // compatibilidade
  token_type?: string;
  refresh_token?: string; // enviado no JSON mas o app usa o cookie; pode ignorar
  tipoUsuario?: TipoUsuario;
  nome?: string;
  id?: string;
  imagem?: string | null;
  restauranteId?: string;
  idVerificacao?: string;
  mensagem?: string;
}

/** Resposta do backend Python /auth/registrar (cadastro com verificação por e-mail). */
export interface RegisterResponse {
  message?: string;
  idVerificacao?: string;
  id?: string;
  email?: string;
  nome?: string;
  is_active?: boolean;
  data_criacao?: string;
  mensagem?: string;
}

