from typing import Any, Dict


async def send_reset_password_email(email: str, context: Dict[str, Any]) -> None:
    """
    Esqueleto de envio de e-mail.

    Aqui você pode integrar com qualquer serviço de e-mail
    (SendGrid, Amazon SES, etc.). Por enquanto, é apenas um stub.
    """
    # TODO: implementar envio real de e-mail
    _ = (email, context)

