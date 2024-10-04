## =========================== IMPORTS ===========================
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

## =========================== IMPORT DEPENDENCIES AND ROUTES ===========================
from .routers import tables_operations, user, setup, database
from fastapi_pagination import Page, add_pagination, paginate
import os
from dotenv import load_dotenv

load_dotenv()


# Setup FastAPI and define CORS middleware
app = FastAPI()
add_pagination(app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
app.include_router(user.router)
app.include_router(setup.router)
app.include_router(database.router)
app.include_router(tables_operations.router)
