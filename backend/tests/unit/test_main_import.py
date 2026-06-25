import importlib
import sys
from pathlib import Path


def test_main_imports_when_backend_root_is_not_on_sys_path(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./test.db")

    repo_root = Path(__file__).resolve().parents[2]
    backend_root = repo_root / "backend"

    sys.path = [p for p in sys.path if Path(p).resolve() != backend_root]
    sys.path.insert(0, str(repo_root))

    for module_name in list(sys.modules):
        if module_name == "app" or module_name.startswith("app."):
            sys.modules.pop(module_name, None)

    importlib.invalidate_caches()
    module = importlib.import_module("app.main")

    assert module.app is not None
