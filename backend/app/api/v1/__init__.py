from fastapi import APIRouter

from . import routes_auth
from . import routes_auth as routes_auth_users
from . import routes_auth_email, routes_health
from . import routes_assistant
from . import routes_recommendations

api_v1 = APIRouter()
api_v1.include_router(routes_auth.router)
api_v1.include_router(routes_auth_email.router)
api_v1.include_router(routes_health.router)
api_v1.include_router(routes_auth_users.router)
api_v1.include_router(routes_assistant.router)
api_v1.include_router(routes_recommendations.router)
