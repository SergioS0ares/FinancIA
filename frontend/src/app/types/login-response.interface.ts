export type TipoUsuario = 'CLIENTE' | 'RESTAURANTE' | 'FUNCIONARIO';

export interface LoginResponse {
  token: string;
  tipoUsuario: TipoUsuario;
  nome: string;
  id: string;
  imagem?: string | null;
  restauranteId?: string;

  // Campos opcionais usados nos fluxos de verificação/cadastro
  idVerificacao?: string;
  mensagem?: string;
}

export interface RegisterResponse {
  idVerificacao: string;
  mensagem: string;
}

