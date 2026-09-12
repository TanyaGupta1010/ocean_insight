import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

try:
    from backend.database import SessionLocal, engine
    from backend.models import Base, TelemetryRecord
except ImportError:
    from database import SessionLocal, engine
    from models import Base, TelemetryRecord


# ==================================================
# CREATE DATABASE TABLES
# ==================================================

Base.metadata.create_all(bind=engine)


# ==================================================
# CREATE FASTAPI APPLICATION
# ==================================================

app = FastAPI(
    title="Ocean Observation Platform API",
    description="Real-time telemetry API for the Ocean Observation Platform"
)


# ==================================================
# ENABLE CORS FOR REACT FRONTEND & VERCEL DEPLOYMENTS
# ==================================================

cors_origins_env = os.environ.get("CORS_ORIGINS", "")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
]

if cors_origins_env:
    for origin in cors_origins_env.split(","):
        if origin.strip():
            allowed_origins.append(origin.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if cors_origins_env else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# TELEMETRY REQUEST MODEL
# ==================================================

class Telemetry(BaseModel):

    # Device
    device_id: str

    # GPS
    latitude: float
    longitude: float
    gps_accuracy: float

    # Ocean / Water Parameters
    temperature: float
    salinity: float
    ph: float
    dissolved_oxygen: float
    conductivity: float
    turbidity: float

    # Platform Health
    battery: float
    signal_strength: float


# ==================================================
# DATABASE DEPENDENCY
# ==================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==================================================
# HOME ROUTE
# ==================================================

@app.get("/")
def home():

    return {
        "message": "Ocean Observation Platform Backend is Running",
        "status": "online"
    }


# ==================================================
# POST TELEMETRY
# Used by GPS / Telemetry Simulator
# ==================================================

@app.post("/telemetry")
def receive_telemetry(
    data: Telemetry,
    db: Session = Depends(get_db)
):

    telemetry_record = TelemetryRecord(

        # Device
        device_id=data.device_id,

        # GPS
        latitude=data.latitude,
        longitude=data.longitude,
        gps_accuracy=data.gps_accuracy,

        # Ocean / Water Parameters
        temperature=data.temperature,
        salinity=data.salinity,
        ph=data.ph,
        dissolved_oxygen=data.dissolved_oxygen,
        conductivity=data.conductivity,
        turbidity=data.turbidity,

        # Platform Health
        battery=data.battery,
        signal_strength=data.signal_strength
    )


    db.add(telemetry_record)

    db.commit()

    db.refresh(telemetry_record)


    return {
        "message": "Telemetry stored successfully",
        "id": telemetry_record.id,
        "data": {

            "id": telemetry_record.id,

            "device_id": telemetry_record.device_id,

            "latitude": telemetry_record.latitude,
            "longitude": telemetry_record.longitude,
            "gps_accuracy": telemetry_record.gps_accuracy,

            "temperature": telemetry_record.temperature,
            "salinity": telemetry_record.salinity,
            "ph": telemetry_record.ph,
            "dissolved_oxygen": telemetry_record.dissolved_oxygen,
            "conductivity": telemetry_record.conductivity,
            "turbidity": telemetry_record.turbidity,

            "battery": telemetry_record.battery,
            "signal_strength": telemetry_record.signal_strength,

            "timestamp": telemetry_record.timestamp
        }
    }


# ==================================================
# GET ALL TELEMETRY
# ==================================================

@app.get("/telemetry")
def get_all_telemetry(
    db: Session = Depends(get_db)
):

    records = (
        db.query(TelemetryRecord)
        .order_by(TelemetryRecord.timestamp.asc())
        .all()
    )


    return [

        {
            "id": record.id,

            "device_id": record.device_id,

            "latitude": record.latitude,
            "longitude": record.longitude,
            "gps_accuracy": record.gps_accuracy,

            "temperature": record.temperature,
            "salinity": record.salinity,
            "ph": record.ph,
            "dissolved_oxygen": record.dissolved_oxygen,
            "conductivity": record.conductivity,
            "turbidity": record.turbidity,

            "battery": record.battery,
            "signal_strength": record.signal_strength,

            "timestamp": record.timestamp
        }

        for record in records
    ]


# ==================================================
# GET LATEST TELEMETRY
# ==================================================

@app.get("/latest")
def get_latest_telemetry(
    db: Session = Depends(get_db)
):

    latest_record = (

        db.query(TelemetryRecord)

        .order_by(
            TelemetryRecord.timestamp.desc()
        )

        .first()
    )


    if latest_record is None:

        return {
            "message": "No telemetry data available"
        }


    return {

        "id": latest_record.id,

        "device_id": latest_record.device_id,

        "latitude": latest_record.latitude,
        "longitude": latest_record.longitude,
        "gps_accuracy": latest_record.gps_accuracy,

        "temperature": latest_record.temperature,
        "salinity": latest_record.salinity,
        "ph": latest_record.ph,
        "dissolved_oxygen": latest_record.dissolved_oxygen,
        "conductivity": latest_record.conductivity,
        "turbidity": latest_record.turbidity,

        "battery": latest_record.battery,
        "signal_strength": latest_record.signal_strength,

        "timestamp": latest_record.timestamp
    }


# ==================================================
# GET TELEMETRY HISTORY
# Used for Dashboard Charts
# ==================================================

@app.get("/history")
def get_telemetry_history(
    db: Session = Depends(get_db)
):

    records = (

        db.query(TelemetryRecord)

        .order_by(
            TelemetryRecord.timestamp.asc()
        )

        .all()
    )


    return [

        {

            "id": record.id,

            "device_id": record.device_id,

            "latitude": record.latitude,
            "longitude": record.longitude,
            "gps_accuracy": record.gps_accuracy,

            "temperature": record.temperature,
            "salinity": record.salinity,
            "ph": record.ph,
            "dissolved_oxygen": record.dissolved_oxygen,
            "conductivity": record.conductivity,
            "turbidity": record.turbidity,

            "battery": record.battery,
            "signal_strength": record.signal_strength,

            "timestamp": record.timestamp
        }

        for record in records
    ]


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)