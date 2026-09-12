import requests
import random
import time


import os

# ==================================================
# BACKEND API CONFIGURATION
# Supports local development, Render production, or custom API_URL
# ==================================================

DEFAULT_ENDPOINTS = [
    "https://ocean-insight.onrender.com/telemetry",
    "http://127.0.0.1:8000/telemetry",
]

env_urls = os.environ.get("API_URLS", os.environ.get("API_URL", ""))
TARGET_URLS = [u.strip() for u in env_urls.split(",") if u.strip()] if env_urls else DEFAULT_ENDPOINTS


# ==================================================
# DEVICE INFORMATION
# ==================================================

DEVICE_ID = "OCEAN_001"


# ==================================================
# DEMO LOCATION
# ==================================================

BASE_LATITUDE = 28.450643
BASE_LONGITUDE = 77.583798


# Current simulated device location
latitude = BASE_LATITUDE
longitude = BASE_LONGITUDE


# ==================================================
# INITIAL SENSOR VALUES
# ==================================================

temperature = 28.0
salinity = 34.5
ph = 8.0
dissolved_oxygen = 7.2
conductivity = 52000.0
turbidity = 3.0

# Initial battery in healthy demonstration range (85-95%)
battery = round(random.uniform(91.5, 93.5), 2)
solar_charging_active = False
signal_strength = 90.0
gps_accuracy = 4.0


# ==================================================
# GPS LOCATION SIMULATION
# ==================================================

def generate_location():

    global latitude, longitude

    # Small movement around the demo area
    latitude += random.uniform(-0.0003, 0.0003)
    longitude += random.uniform(-0.0003, 0.0003)

    # Keep the simulated device within a limited area
    latitude = max(
        BASE_LATITUDE - 0.003,
        min(latitude, BASE_LATITUDE + 0.003)
    )

    longitude = max(
        BASE_LONGITUDE - 0.003,
        min(longitude, BASE_LONGITUDE + 0.003)
    )

    return latitude, longitude


# ==================================================
# GPS ACCURACY SIMULATION
# ==================================================

def generate_gps_accuracy():

    global gps_accuracy

    gps_accuracy += random.uniform(-0.5, 0.5)

    # Accuracy in meters
    gps_accuracy = max(
        2.0,
        min(gps_accuracy, 8.0)
    )

    return gps_accuracy


# ==================================================
# TEMPERATURE SIMULATION
# ==================================================

def generate_temperature():

    global temperature

    temperature += random.uniform(-0.15, 0.15)

    temperature = max(
        25.0,
        min(temperature, 32.0)
    )

    return temperature


# ==================================================
# SALINITY SIMULATION
# ==================================================

def generate_salinity():

    global salinity

    salinity += random.uniform(-0.04, 0.04)

    salinity = max(
        33.5,
        min(salinity, 35.5)
    )

    return salinity


# ==================================================
# pH SIMULATION
# ==================================================

def generate_ph():

    global ph

    ph += random.uniform(-0.02, 0.02)

    ph = max(
        7.7,
        min(ph, 8.4)
    )

    return ph


# ==================================================
# DISSOLVED OXYGEN SIMULATION
# ==================================================

def generate_dissolved_oxygen():

    global dissolved_oxygen

    dissolved_oxygen += random.uniform(-0.1, 0.1)

    dissolved_oxygen = max(
        5.0,
        min(dissolved_oxygen, 9.0)
    )

    return dissolved_oxygen


# ==================================================
# CONDUCTIVITY SIMULATION
# ==================================================

def generate_conductivity():

    global conductivity

    conductivity += random.uniform(-200, 200)

    conductivity = max(
        48000,
        min(conductivity, 56000)
    )

    return conductivity


# ==================================================
# TURBIDITY SIMULATION
# ==================================================

def generate_turbidity():

    global turbidity

    turbidity += random.uniform(-0.3, 0.3)

    turbidity = max(
        1.0,
        min(turbidity, 8.0)
    )

    return turbidity


# ==================================================
# BATTERY SIMULATION
# ==================================================

def generate_battery():

    global battery, solar_charging_active

    # Boundary check for realistic demonstration range [80.0% - 95.0%]
    if battery <= 80.2:
        solar_charging_active = True
    elif battery >= 92.5:
        solar_charging_active = False

    if solar_charging_active:
        # Very slow solar recovery
        battery += random.uniform(0.003, 0.008)
    else:
        # Realistic slow discharge (~2% total decrease over 30 minutes)
        battery -= random.uniform(0.003, 0.008)

    # Strictly keep within healthy demonstration range [80.0, 95.0]
    battery = max(80.0, min(95.0, battery))

    return round(battery, 2)


# ==================================================
# SIGNAL STRENGTH SIMULATION
# ==================================================

def generate_signal_strength():

    global signal_strength

    signal_strength += random.uniform(-3, 3)

    signal_strength = max(
        40.0,
        min(signal_strength, 100.0)
    )

    return signal_strength


# ==================================================
# SEND TELEMETRY
# ==================================================

def send_telemetry():

    # GPS
    current_latitude, current_longitude = generate_location()
    current_gps_accuracy = generate_gps_accuracy()

    # Water parameters
    current_temperature = generate_temperature()
    current_salinity = generate_salinity()
    current_ph = generate_ph()
    current_dissolved_oxygen = generate_dissolved_oxygen()
    current_conductivity = generate_conductivity()
    current_turbidity = generate_turbidity()

    # Platform health
    current_battery = generate_battery()
    current_signal_strength = generate_signal_strength()


    # ==================================================
    # TELEMETRY PAYLOAD
    # ==================================================

    data = {

        # Device
        "device_id": DEVICE_ID,


        # GPS
        "latitude": round(current_latitude, 6),
        "longitude": round(current_longitude, 6),
        "gps_accuracy": round(current_gps_accuracy, 2),


        # Ocean / Water Parameters
        "temperature": round(current_temperature, 2),
        "salinity": round(current_salinity, 2),
        "ph": round(current_ph, 2),
        "dissolved_oxygen": round(
            current_dissolved_oxygen,
            2
        ),
        "conductivity": round(
            current_conductivity,
            2
        ),
        "turbidity": round(
            current_turbidity,
            2
        ),


        # Platform Health
        "battery": round(current_battery, 2),
        "signal_strength": round(
            current_signal_strength,
            2
        )
    }


    for target_url in TARGET_URLS:
        try:
            response = requests.post(
                target_url,
                json=data,
                timeout=3
            )

            if response.status_code == 200:
                print(f"[SUCCESS] Telemetry stored on {target_url}")
                print(f"   -> Battery: {data['battery']}% | Temp: {data['temperature']}°C | Salinity: {data['salinity']} PSU")
            else:
                print(f"[WARN] Status {response.status_code} from {target_url}: {response.text}")

        except requests.exceptions.RequestException as error:
            print(f"[NOTICE] Could not connect to {target_url}: {error.__class__.__name__}")


# ==================================================
# RUN SIMULATOR
# ==================================================

if __name__ == "__main__":
    print("==========================================")
    print("OCEAN OBSERVATION TELEMETRY SIMULATOR")
    print("==========================================")

    print("Device ID:", DEVICE_ID)

    print("Mode: DEMO / SIMULATED TELEMETRY")

    print(
        "Base Location:",
        BASE_LATITUDE,
        ",",
        BASE_LONGITUDE
    )

    print("Target URLs:", TARGET_URLS)
    print("Sending data every 5 seconds...")

    print("==========================================")

    while True:
        send_telemetry()
        # Send telemetry every 5 seconds
        time.sleep(5)