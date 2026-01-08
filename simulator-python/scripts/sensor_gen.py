#!/usr/bin/env python3
"""
Smart City Energy Simulator
Generates and sends random energy readings to the Spring Boot backend.
"""

import os
import sys
import json
import time
import pytz
import random
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8080/api/v1')
INTERVAL_SECONDS = int(os.getenv('INTERVAL_SECONDS', '5'))
VOLTAGE_MIN = int(os.getenv('VOLTAGE_MIN', '210'))
VOLTAGE_MAX = int(os.getenv('VOLTAGE_MAX', '240'))
KWH_MIN = float(os.getenv('KWH_MIN', '0.5'))
KWH_MAX = float(os.getenv('KWH_MAX', '15.0'))


class EnergySimulator:
    def __init__(self):
        self.sensors = []
        self.running = True
        
    def fetch_sensors(self):
        """Fetch all registered sensors from the backend."""
        try:
            response = requests.get(f'{API_BASE_URL}/sensors', timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                self.sensors = data.get('data', [])
                print(f"✅ Fetched {len(self.sensors)} sensors from backend")
            else:
                print(f"❌ Failed to fetch sensors: {data.get('message')}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to backend. Is the Spring Boot server running?")
            print(f"   URL: {API_BASE_URL}")
        except requests.exceptions.Timeout:
            print("❌ Request timeout while fetching sensors")
        except Exception as e:
            print(f"❌ Error fetching sensors: {e}")
    
    def generate_energy_reading(self, sensor):
        """Generate random energy reading for a sensor."""
        # Adjust kWh based on energy source
        if sensor.get('energySource') == 'Solar':
            # Solar produces less at night (simulate time-based generation)
            tz_jakarta = pytz.timezone('Asia/Jakarta')
            jakarta_time = datetime.now(timezone.utc).astimezone(tz_jakarta)
            hour = jakarta_time.hour
            
            if 6 <= hour <= 18:  # Daytime
                kwh = random.uniform(KWH_MIN * 2, KWH_MAX)
            else:  # Night
                kwh = random.uniform(0, KWH_MIN)
        else:
            # Grid has more consistent usage
            kwh = random.uniform(KWH_MIN, KWH_MAX)
        
        # Voltage varies slightly
        voltage = random.randint(VOLTAGE_MIN, VOLTAGE_MAX)
        
        return {
            'sensorId': sensor.get('sensorId'),
            'kwhUsage': round(kwh, 2),
            'voltage': voltage
        }
    
    def send_energy_data(self, reading):
        """Send energy reading to the backend."""
        try:
            response = requests.post(
                f'{API_BASE_URL}/energy/ingest',
                json=reading,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 201:
                return True
            else:
                print(f"⚠️  Failed to send data for sensor {reading['sensorId'][:8]}...")
                return False
                
        except requests.exceptions.ConnectionError:
            print("❌ Lost connection to backend")
            return False
        except Exception as e:
            print(f"❌ Error sending data: {e}")
            return False
    
    def run_simulation(self):
        """Main simulation loop - Updated to be fully dynamic."""
        print("\n" + "="*60)
        print("🏙️  SMART CITY ENERGY SIMULATOR (DYNAMIC MODE)")
        print("="*60)
        print(f"📡 API URL: {API_BASE_URL}")
        print(f"⏱️  Interval: {INTERVAL_SECONDS} seconds")
        print("="*60 + "\n")
        
        print("\n🚀 Starting simulation... (Press Ctrl+C to stop)\n")
        
        iteration = 0
        while self.running:
            iteration += 1
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # --- PERBAIKAN: Refresh daftar sensor setiap 5 iterasi agar tidak berat ---
            if iteration == 1 or iteration % 5 == 0:
                print(f"🔍 [{timestamp}] Syncing sensor list from database...")
                self.fetch_sensors()
            
            # Filter hanya sensor yang berstatus 'Active'
            active_sensors = [s for s in self.sensors if s.get('status') == 'Active']
            
            if not active_sensors:
                print(f"⚠️ [{timestamp}] No active sensors found. Waiting for sensors...")
            else:
                print(f"\n[{timestamp}] 📤 Sending batch #{iteration} for {len(active_sensors)} sensors")
                print("-" * 40)
                
                success_count = 0
                for sensor in active_sensors:
                    reading = self.generate_energy_reading(sensor)
                    if self.send_energy_data(reading):
                        success_count += 1
                        source_icon = "☀️" if sensor.get('energySource') == 'Solar' else "⚡"
                        print(f"  {source_icon} {sensor.get('districtName')}: {reading['kwhUsage']} kWh")
                
                print(f"\n✅ Sent {success_count}/{len(active_sensors)} readings successfully")
            
            print(f"💤 Waiting {INTERVAL_SECONDS} seconds...")
            try:
                time.sleep(INTERVAL_SECONDS)
            except KeyboardInterrupt:
                break
    
    def stop(self):
        """Stop the simulation."""
        self.running = False


def main():
    simulator = EnergySimulator()
    
    try:
        simulator.run_simulation()
    except KeyboardInterrupt:
        print("\n\n⏹️  Stopping simulator...")
        simulator.stop()


if __name__ == '__main__':
    main()
