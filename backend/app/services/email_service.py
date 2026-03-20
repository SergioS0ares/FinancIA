import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Any, Dict

from app.core.config import settings


async def send_reset_password_email(email: str, context: Dict[str, Any]) -> None:
    """
    Envia o e-mail real de redefinição de senha usando o Gmail (HTML bonito).
    """
    remetente = settings.EMAIL_HOST_USER
    senha = settings.EMAIL_HOST_PASSWORD

    reset_link = context.get("reset_link", "http://localhost:4200/login")

    msg = MIMEMultipart()
    msg["From"] = remetente
    msg["To"] = email
    msg["Subject"] = "Financia - Redefinição de Senha"

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333333; text-align: center;">Redefinição de Senha</h2>
          <p style="color: #555555; font-size: 16px;">Olá,</p>
          <p style="color: #555555; font-size: 16px;">
            Recebemos um pedido para redefinir a senha da sua conta no <strong>Financia</strong>.
          </p>
          <p style="color: #555555; font-size: 16px;">
            Clique no botão abaixo para criar uma nova senha:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}"
               style="background-color: #ffc107; color: #333; padding: 12px 24px; text-decoration: none;
                      font-weight: bold; border-radius: 4px; display: inline-block;">
              Redefinir Minha Senha
            </a>
          </div>

          <p style="color: #999999; font-size: 14px; text-align: center;">
            Se você não solicitou essa mudança, pode ignorar este e-mail.
            Este link expira em 15 minutos.
          </p>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(remetente, senha)
        server.sendmail(remetente, email, msg.as_string())
        server.quit()
        print(f"✅ E-mail de redefinição enviado com sucesso para {email}")
    except Exception as e:  # pragma: no cover - apenas log
        print(f"❌ Erro ao enviar e-mail: {e}")


async def send_verification_email(email: str, context: Dict[str, Any]) -> None:
    """
    E-mail HTML de verificação em duas etapas (código + link com id_verificacao).
    `context` deve incluir: codigo, confirm_link e opcionalmente id_verificacao.
    """
    remetente = settings.EMAIL_HOST_USER
    senha = settings.EMAIL_HOST_PASSWORD

    confirm_link = context.get("confirm_link", "http://localhost:4200/login")
    codigo_verificacao = context.get("codigo", "000000")

    msg = MIMEMultipart()
    msg["From"] = remetente
    msg["To"] = email
    msg["Subject"] = "FinanciA - Código de Verificação"

    # Cores marca: navy-teal #1a2a3a + amarelo #f0c030
    html_body = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#e8ecf0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#e8ecf0; padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width:600px; background:#ffffff; border-radius:8px;
                   box-shadow:0 4px 10px rgba(0,0,0,0.1); overflow:hidden; border-top:5px solid #1a2a3a;">
              <tr>
                <td style="padding:28px 32px 8px; text-align:center;">
                  <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                    <tr>
                      <td style="vertical-align:middle; padding-right:10px;">
                        <div style="width:48px;height:48px;background:linear-gradient(135deg,#f0c030,#e5a820);
                                    border-radius:8px;text-align:center;line-height:48px;font-size:22px;font-weight:bold;color:#1a2a3a;">
                          F
                        </div>
                      </td>
                      <td style="vertical-align:middle;">
                        <span style="color:#1a2a3a;font-size:24px;font-weight:bold;">Financi</span><span style="color:#f0c030;font-size:24px;font-weight:bold;">A</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 32px 16px; text-align:center;">
                  <h1 style="margin:0; font-size:20px; font-weight:bold; color:#1a2a3a; letter-spacing:0.04em;">
                    VERIFICAÇÃO DE DOIS FATORES
                  </h1>
                  <p style="margin:16px 0 0; font-size:15px; line-height:1.55; color:#555555;">
                    Recebemos um pedido de verificação para o seu e-mail. Utilize o código abaixo ou clique no botão para confirmar sua identidade.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 32px 24px;">
                  <div style="text-align:center; background-color:#f9f9fb; padding:22px 16px; border-radius:8px;
                              border:1px solid #e8e8ec;">
                    <p style="margin:0 0 8px; font-size:12px; font-weight:bold; letter-spacing:0.12em; color:#1a2a3a;">
                      SEU CÓDIGO DE ACESSO
                    </p>
                    <span style="font-size:36px; font-weight:bold; color:#1a2a3a; letter-spacing:8px;">
                      {codigo_verificacao}
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 8px; text-align:center;">
                  <p style="margin:0; font-size:15px; color:#555555;">Ou confirme pelo link seguro:</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 32px 28px; text-align:center;">
                  <a href="{confirm_link}" style="display:inline-block; background-color:#f0c030; color:#1a2a3a;
                     padding:14px 28px; text-decoration:none; font-weight:bold; font-size:15px; border-radius:6px;">
                    Confirmar minha identidade
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 28px; border-top:1px solid #eeeeee;">
                  <p style="margin:20px 0 0; font-size:13px; line-height:1.6; color:#999999; text-align:center;">
                    Este código e o link expiram em <strong>10 minutos</strong>.<br>
                    Se você não solicitou este código, pode ignorar este e-mail com segurança.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(remetente, senha)
        server.sendmail(remetente, email, msg.as_string())
        server.quit()
        print(f"✅ E-mail de verificação enviado para {email}")
    except Exception as e:  # pragma: no cover
        print(f"❌ Erro ao enviar e-mail de verificação: {e}")
