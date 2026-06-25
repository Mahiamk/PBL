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
