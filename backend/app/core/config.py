from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # These names match the 'environment' variables in your docker-compose.yml
    MYSQL_USER: str = "user"
    MYSQL_PASSWORD: str = "password"
    MYSQL_SERVER: str = "db"  # Service name in your docker-compose
    MYSQL_PORT: str = "3306"
    MYSQL_DB: str = "aiu_microstore"

    # This dynamically builds the connection string for SQLAlchemy
    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_SERVER}:{self.MYSQL_PORT}/{self.MYSQL_DB}"

settings = Settings()