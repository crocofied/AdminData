## =========================== IMPORTS ===========================
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

## =========================== IMPORT DEPENDENCIES AND ROUTES ===========================
from .dependencies import token_required
from .routers import user, setup


# Setup FastAPI and define CORS middleware
app = FastAPI(dependencies=[Depends(token_required)])
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
app.include_router(user.router)
app.include_router(setup.router)
