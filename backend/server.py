from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, StringConstraints
from typing import List, Dict, Any, Literal, Optional, Annotated
import uuid
from datetime import datetime, timezone
from proxy import router as proxy_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

Id = Annotated[str, StringConstraints(max_length=64)]


class Widget(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: Id
    type: Literal["time", "app"]
    appId: Optional[Id] = None
    x: float = Field(ge=-10000, le=10000)
    y: float = Field(ge=-10000, le=10000)


class PixyState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    favorites: List[Id] = Field(default_factory=list, max_length=200)
    installed: List[Id] = Field(default_factory=list, max_length=200)
    pending: Dict[Id, float] = Field(default_factory=dict, max_length=200)
    bgId: Id = "default"
    order: List[Id] = Field(default_factory=list, max_length=200)
    dashboard: Literal["classic", "wave", "dock"] = "classic"
    theme: Id = "default"
    widgets: List[Widget] = Field(default_factory=list, max_length=50)


MAX_STATE_BYTES = 64 * 1024


def _check_device(device_id: str):
    if not (8 <= len(device_id) <= 64) or not all(c.isalnum() or c == "-" for c in device_id):
        raise HTTPException(status_code=400, detail="Invalid device id")


@api_router.get("/state/{device_id}")
async def get_pixy_state(device_id: str):
    _check_device(device_id)
    doc = await db.pixy_states.find_one({"device_id": device_id}, {"_id": 0})
    if not doc:
        return {"exists": False, "state": None}
    return {"exists": True, "state": PixyState(**doc.get("state", {})).model_dump()}


@api_router.put("/state/{device_id}")
async def put_pixy_state(device_id: str, state: PixyState, request: Request):
    _check_device(device_id)
    if int(request.headers.get("content-length") or 0) > MAX_STATE_BYTES:
        raise HTTPException(status_code=413, detail="State too large")
    await db.pixy_states.update_one(
        {"device_id": device_id},
        {"$set": {"state": state.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"ok": True}


# Include the router in the main app
api_router.include_router(proxy_router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()