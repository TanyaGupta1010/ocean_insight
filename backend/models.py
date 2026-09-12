from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from backend.database import Base


class TelemetryRecord(Base):

    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)

    # ==========================================
    # DEVICE INFORMATION
    # ==========================================

    device_id = Column(String)


    # ==========================================
    # GPS LOCATION
    # ==========================================

    latitude = Column(Float)

    longitude = Column(Float)

    gps_accuracy = Column(Float)


    # ==========================================
    # OCEAN / WATER PARAMETERS
    # ==========================================

    temperature = Column(Float)

    salinity = Column(Float)

    ph = Column(Float)

    dissolved_oxygen = Column(Float)

    conductivity = Column(Float)

    turbidity = Column(Float)


    # ==========================================
    # PLATFORM HEALTH
    # ==========================================

    battery = Column(Float)

    signal_strength = Column(Float)


    # ==========================================
    # TIMESTAMP
    # ==========================================

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )