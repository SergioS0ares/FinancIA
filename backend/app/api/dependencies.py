from fastapi import Depends

from ..core.config import Settings, get_settings


def get_app_settings() -> Settings:
    return get_settings()


SettingsDep = Depends(get_app_settings)

