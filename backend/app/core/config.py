import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AIU Microstore"

    # Security Settings
    SECRET_KEY: str = "qYFA_vsC9EzcFsrTChWt-mrjamSBNkH578lHHVrOWKo"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Database Settings
    MYSQL_USER: str = "user"
    MYSQL_PASSWORD: str = "password"
    MYSQL_SERVER: str = "db"
    MYSQL_PORT: str = "3306"
    MYSQL_DB: str = "aiu_microstore"

    SQLALCHEMY_DATABASE_URL: str | None = None

    # Runtime Settings
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000,https://aiu-microstore.vercel.app,https://www.aiu-microstore.vercel.app"
    UPLOAD_DIR: str = "uploads"
    BACKEND_PUBLIC_URL: str = "http://localhost:8000"

    @property
    def effective_upload_dir(self) -> str:
        if os.getenv("UPLOAD_DIR"):
            return os.getenv("UPLOAD_DIR")
        if os.getenv("VERCEL") or os.getenv("NOW_REGION"):
            return "/tmp/uploads"
        return self.UPLOAD_DIR

    @property
    def UPLOAD_DIR_EFFECTIVE(self) -> str:
        return self.effective_upload_dir

    @property
    def DATABASE_URL(self) -> str:
        env_database_url = os.getenv("DATABASE_URL")
        if env_database_url:
            return self._normalize_database_url(env_database_url)

        if self.SQLALCHEMY_DATABASE_URL:
            return self._normalize_database_url(self.SQLALCHEMY_DATABASE_URL)

        return "sqlite:///./test.db"

    def _normalize_database_url(self, database_url: str) -> str:
        if database_url.startswith("mysql://"):
            return database_url.replace("mysql://", "mysql+mysqlconnector://", 1)
        return database_url

    @property
    def CORS_ORIGINS_LIST(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()