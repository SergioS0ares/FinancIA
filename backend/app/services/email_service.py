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
