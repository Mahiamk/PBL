# Import all the models here so that Base has them before being
# imported by Alembic or the app
from app.db.base_class import Base  # noqa
from app.models.user import User  # noqa