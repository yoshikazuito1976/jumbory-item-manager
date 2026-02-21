from pathlib import Path
import sys

from mangum import Mangum

current_dir = Path(__file__).resolve().parent
candidate_dirs = [
    current_dir / "backend",
    current_dir.parent / "backend",
]

backend_dir = next((path for path in candidate_dirs if path.exists()), None)
if backend_dir is None:
    raise RuntimeError("backend directory not found for Lambda handler")

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app

handler = Mangum(app, lifespan="auto")
