import os
from pathlib import Path

from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

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
            return str(Path(os.getenv("UPLOAD_DIR")).resolve())
        if os.getenv("VERCEL") or os.getenv("NOW_REGION"):
            return "/tmp/uploads"
        backend_dir = Path(__file__).resolve().parent.parent.parent
        uploads_path = (backend_dir / "uploads").resolve()
        uploads_path.mkdir(parents=True, exist_ok=True)
        return str(uploads_path)

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

    @property
    def DATABASE_ENGINE_KWARGS(self) -> dict:
        if self.DATABASE_URL.startswith("sqlite"):
            return {
                "connect_args": {
                    "check_same_thread": False,
                }
            }
        if "pymysql" in self.DATABASE_URL:
            return {
                "connect_args": {
                    "ssl": {
                        "check_hostname": False,
                        "verify_cert": False,
                    }
                }
            }
        if "mysqlconnector" in self.DATABASE_URL:
            return {
                "connect_args": {
                    "ssl_disabled": False,
                }
            }
        return {}

    def _normalize_database_url(self, database_url: str) -> str:
        if database_url.startswith("mysql://"):
            try:
                import pymysql  # noqa: F401
                driver = "pymysql"
            except ImportError:
                driver = "mysqlconnector"
            normalized = database_url.replace("mysql://", f"mysql+{driver}://", 1)
            parsed = urlsplit(normalized)
            query = dict(parse_qsl(parsed.query, keep_blank_values=True))
            query.pop("ssl-mode", None)
            if parsed.query and not query:
                return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "", parsed.fragment))
            return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment))
        return database_url

    @property
    def CORS_ORIGINS_LIST(self) -> list[str]:
        defaults = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://localhost:3000",
        ]
        configured = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return list(dict.fromkeys(defaults + configured))


settings = Settings()