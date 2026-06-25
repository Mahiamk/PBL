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

    # We use this local file to avoid the 'db' connection error
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./test.db"

    @property
    def DATABASE_URL(self) -> str:
        # If we are testing locally and want to use SQLite:
        if self.SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
            return self.SQLALCHEMY_DATABASE_URL
        
        # Otherwise, use MySQL (for Docker/Production)
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_SERVER}:{self.MYSQL_PORT}/{self.MYSQL_DB}"

settings = Settings()