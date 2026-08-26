import os

from app.core.config import Settings


def test_database_url_prefers_environment_override(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "mysql+pymysql://root:root@db:3306/appdb")
    monkeypatch.delenv("SQLALCHEMY_DATABASE_URL", raising=False)

    settings = Settings(_env_file=None)

    assert settings.DATABASE_URL == "mysql+pymysql://root:root@db:3306/appdb"


def test_database_url_normalizes_mysql_scheme_for_sqlalchemy(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "mysql://user:password@host:3306/appdb")
    monkeypatch.delenv("SQLALCHEMY_DATABASE_URL", raising=False)

    settings = Settings(_env_file=None)

    assert settings.DATABASE_URL == "mysql+mysqlconnector://user:password@host:3306/appdb"


def test_upload_dir_uses_temp_path_on_vercel(monkeypatch):
    monkeypatch.delenv("UPLOAD_DIR", raising=False)
    monkeypatch.setenv("VERCEL", "1")

    settings = Settings(_env_file=None)

    assert settings.UPLOAD_DIR_EFFECTIVE == "/tmp/uploads"


def test_mysqlconnector_ssl_mode_is_normalized(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "mysql://user:password@host:3306/appdb?ssl-mode=REQUIRED")
    monkeypatch.delenv("SQLALCHEMY_DATABASE_URL", raising=False)

    settings = Settings(_env_file=None)

    assert settings.DATABASE_URL == "mysql+mysqlconnector://user:password@host:3306/appdb"
    assert settings.DATABASE_ENGINE_KWARGS["connect_args"]["ssl_disabled"] is False


def test_sqlite_engine_kwargs(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("SQLALCHEMY_DATABASE_URL", raising=False)

    settings = Settings(_env_file=None)

    assert settings.DATABASE_URL == "sqlite:///./test.db"
    assert settings.DATABASE_ENGINE_KWARGS["connect_args"]["check_same_thread"] is False
