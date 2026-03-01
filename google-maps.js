let map;
let airQualityData = [];
let infoWindow;

const GOOGLE_MAPS_API_KEY = 'AIzaSyDyI1xSt2ODvqonznF29vrVzdgcsItFlbc';

const CALIFORNIA_COUNTIES = [
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, population: 10000000 },
  { name: 'San Diego', lat: 32.7157, lng: -117.1611, population: 3300000 },
  { name: 'Orange', lat: 33.7175, lng: -117.8311, population: 3200000 },
  { name: 'Riverside', lat: 33.7537, lng: -115.9747, population: 2400000 },
  { name: 'San Bernardino', lat: 34.1083, lng: -117.2898, population: 2200000 },
  { name: 'Santa Clara', lat: 37.3541, lng: -121.9552, population: 1900000 },
  { name: 'Alameda', lat: 37.6017, lng: -121.7195, population: 1700000 },
  { name: 'Sacramento', lat: 38.5816, lng: -121.4944, population: 1500000 },
  { name: 'Contra Costa', lat: 37.8534, lng: -121.9018, population: 1100000 },
  { name: 'Fresno', lat: 36.7378, lng: -119.7871, population: 1000000 },
  { name: 'Kern', lat: 35.3733, lng: -119.0187, population: 900000 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, population: 875000 },
  { name: 'Ventura', lat: 34.2804, lng: -119.2945, population: 850000 },
  { name: 'San Mateo', lat: 37.5630, lng: -122.3255, population: 775000 },
  { name: 'Stanislaus', lat: 37.6391, lng: -120.9876, population: 550000 }
];

function generateAirQualityData() {
  return CALIFORNIA_COUNTIES.map(county => {
    const baseLevel = Math.random() * 50;
    const pm25 = baseLevel + (Math.random() * 20 - 10);
    const pm10 = pm25 * 1.5 + (Math.random() * 10);
    
    let status, color;
    if (pm25 <= 12) {
      status = 'Good';
      color = '#00e676';
    } else if (pm25 <= 35) {
      status = 'Moderate';
      color = '#ffeb3b';
    } else if (pm25 <= 55) {
      status = 'Unhealthy for Sensitive';
      color = '#ff9800';
    } else {
      status = 'Unhealthy';
      color = '#f44336';
    }
    
    return {
      ...county,
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm10 * 10) / 10,
      aqi: Math.round(pm25 * 3),
      status,
      color,
      timestamp: new Date().toLocaleTimeString()
    };
  });
}

function initGoogleMaps() {
  try {
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps API not available');
    }
    
    const mapContainer = document.getElementById('googleMapContainer');
    if (!mapContainer) {
      throw new Error('Map container not found');
    }
    
    map = new google.maps.Map(mapContainer, {
      zoom: 6,
      center: { lat: 36.7783, lng: -119.4179 },
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#c9b2a6' }]
        }
      ]
    });

    infoWindow = new google.maps.InfoWindow();
    
    airQualityData = generateAirQualityData();
    
    addAirQualityMarkers();
    
    setInterval(() => {
      airQualityData = generateAirQualityData();
      updateMarkers();
    }, 30000);
    
  } catch (error) {
    console.error('Error initializing Google Maps:', error);
    showMapError(error.message);
  }
}

function addAirQualityMarkers() {
  airQualityData.forEach(data => {
    const marker = new google.maps.Marker({
      position: { lat: data.lat, lng: data.lng },
      map: map,
      title: `${data.name} County - PM2.5: ${data.pm25}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: data.color,
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    });

    marker.addListener('click', () => {
      const content = `
        <div style="font-family: Arial, sans-serif; max-width: 300px;">
          <h3 style="margin: 0 0 10px 0; color: #1976d2;">${data.name} County</h3>
          <div style="background: ${data.color}; color: white; padding: 8px; border-radius: 4px; margin-bottom: 10px;">
            <strong>Air Quality: ${data.status}</strong>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0;"><strong>PM2.5:</strong></td>
              <td style="padding: 4px 0;">${data.pm25} μg/m³</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><strong>PM10:</strong></td>
              <td style="padding: 4px 0;">${data.pm10} μg/m³</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><strong>AQI:</strong></td>
              <td style="padding: 4px 0;">${data.aqi}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><strong>Population:</strong></td>
              <td style="padding: 4px 0;">${data.population.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><strong>Last Updated:</strong></td>
              <td style="padding: 4px 0;">${data.timestamp}</td>
            </tr>
          </table>
          <div style="margin-top: 10px; padding: 8px; background: #f5f5f5; border-radius: 4px; font-size: 12px;">
            ${getHealthRecommendation(data.pm25)}
          </div>
        </div>
      `;
      
      infoWindow.setContent(content);
      infoWindow.open(map, marker);
    });
    
    data.marker = marker;
  });
}

function updateMarkers() {
  airQualityData.forEach(data => {
    if (data.marker) {
      data.marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: data.color,
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2
      });
      data.marker.setTitle(`${data.name} County - PM2.5: ${data.pm25}`);
    }
  });
}

function getHealthRecommendation(pm25) {
  if (pm25 <= 12) {
    return "✅ Air quality is satisfactory. Normal outdoor activities are safe for firefighters.";
  } else if (pm25 <= 35) {
    return "⚠️ Moderate air quality. Sensitive firefighters should consider limiting prolonged outdoor exertion.";
  } else if (pm25 <= 55) {
    return "🚨 Unhealthy for sensitive groups. All firefighters should use respiratory protection during extended operations.";
  } else {
    return "❌ Unhealthy air quality. Mandatory respiratory protection required for all firefighters. Limit outdoor exposure.";
  }
}

function initializeRealScreen8() {
  const screen8 = document.getElementById('8');
  if (!screen8) return;
  
  screen8.innerHTML = `
    <div style="width: 100%; height: 100%; position: relative; background: linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%); font-family: Arial, sans-serif;">
      
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 60px; background: rgba(13, 71, 161, 0.95); z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; backdrop-filter: blur(10px);">
        <div style="color: white; font-size: 18px; font-weight: bold;">🔥 California Air Quality Monitor</div>
        <div style="color: white; font-size: 12px;">Live PM2.5 Data</div>
      </div>
      
      <button onclick="showScreen(currentScreen > 1 ? currentScreen - 1 : 1)" style="position: absolute; top: 20px; right: 20px; background: transparent; border: none; color: white; font-size: 16px; font-weight: bold; cursor: pointer; z-index: 15; font-family: Arial, sans-serif;">EXIT</button>
      
      <div style="position: absolute; top: 60px; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; padding: 20px;">
        
        <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; padding: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); max-width: 350px; width: 100%;">
          
          <div style="text-align: center; margin-bottom: 25px;">
            <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">California Counties</h3>
            <svg width="280" height="360" viewBox="0 0 280 360" style="background: rgba(255, 255, 255, 0.95); border-radius: 15px; padding: 15px;">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
                </filter>
              </defs>
              
              <path d="M 158 10 
                      L 165 8 L 175 6 L 185 5 L 195 4 L 205 3 L 215 2 L 225 2 L 235 3 L 245 5 
                      L 250 8 L 254 12 L 257 17 L 259 23 L 260 30 L 261 37 L 262 45 L 263 53 
                      L 264 62 L 265 71 L 266 80 L 267 90 L 268 100 L 269 110 L 270 120 
                      L 271 130 L 272 140 L 273 150 L 274 160 L 275 170 L 276 180 L 277 190 
                      L 278 200 L 279 210 L 280 220 L 279 230 L 278 240 L 277 250 L 276 260 
                      L 275 270 L 274 280 L 273 290 L 271 300 L 268 308 L 264 315 L 259 321 
                      L 253 326 L 246 330 L 238 333 L 229 335 L 220 336 L 210 337 L 200 337 
                      L 190 336 L 180 334 L 170 331 L 160 327 L 150 322 L 140 316 L 130 309 
                      L 120 301 L 110 292 L 100 282 L 90 271 L 80 259 L 70 246 L 62 232 
                      L 55 217 L 49 201 L 44 184 L 40 167 L 37 149 L 35 131 L 34 113 L 34 95 
                      L 35 77 L 37 59 L 40 42 L 44 26 L 49 12 L 55 0 L 62 -10 L 70 -18 
                      L 80 -24 L 90 -28 L 100 -30 L 110 -30 L 120 -28 L 130 -24 L 140 -18 
                      L 148 -10 L 155 0 L 158 10 Z" 
                    transform="translate(-20, 20) scale(0.8, 0.8)" 
                    fill="#e8f5e8" stroke="#2e7d32" stroke-width="2" filter="url(#shadow)"/>
              
              <path d="M 70 25 
                      C 72 20, 75 18, 80 16
                      L 90 14 L 100 12 L 115 10 L 130 8 L 145 7 L 160 6 L 175 5 L 190 4 L 205 4 L 220 5 
                      C 230 6, 235 8, 238 12
                      C 240 16, 241 22, 242 28
                      L 243 35 L 244 45 L 245 55 L 246 65 L 247 75 L 248 85 L 249 95 L 250 105 
                      L 251 115 L 252 125 L 253 135 L 254 145 L 255 155 L 256 165 L 257 175 
                      L 258 185 L 259 195 L 260 205 L 261 215 L 262 225 L 263 235 L 264 245 
                      L 265 255 L 266 265 L 267 275 L 268 285 L 269 295 
                      C 269 300, 267 304, 264 307
                      C 260 310, 255 312, 250 313
                      L 240 314 L 230 313 L 220 311 L 210 308 L 200 304 L 190 299 L 180 293 
                      L 170 286 L 160 278 L 150 269 L 140 259 L 130 248 L 120 236 L 110 223 
                      L 100 209 L 90 194 L 80 178 L 72 161 
                      C 68 150, 66 138, 65 126
                      L 64 110 L 63 94 L 62 78 L 61 62 L 60 46 
                      C 60 38, 62 32, 65 28
                      C 67 25, 69 24, 70 25 Z" 
                    fill="#4caf50" stroke="#1b5e20" stroke-width="2" filter="url(#shadow)" opacity="0.9"/>
              
              <circle cx="140" cy="270" r="8" fill="#00e676" stroke="white" stroke-width="2"/>
              <text x="140" y="285" text-anchor="middle" font-size="9" fill="#0d47a1" font-weight="bold">LA</text>
              
              <circle cx="150" cy="310" r="7" fill="#ffeb3b" stroke="white" stroke-width="2"/>
              <text x="150" y="325" text-anchor="middle" font-size="9" fill="#0d47a1" font-weight="bold">SD</text>
              
              <circle cx="145" cy="280" r="6" fill="#00e676" stroke="white" stroke-width="2"/>
              <text x="145" y="295" text-anchor="middle" font-size="8" fill="#0d47a1" font-weight="bold">OC</text>
              
              <circle cx="165" cy="275" r="7" fill="#ff9800" stroke="white" stroke-width="2"/>
              <text x="165" y="290" text-anchor="middle" font-size="8" fill="#0d47a1" font-weight="bold">RIV</text>
              
              <circle cx="180" cy="250" r="7" fill="#ff9800" stroke="white" stroke-width="2"/>
              <text x="180" y="265" text-anchor="middle" font-size="8" fill="#0d47a1" font-weight="bold">SB</text>
              
            </svg>
          </div>
          
          <div style="text-align: center; color: white; font-size: 14px; opacity: 0.8;">
            Tap any county marker to view detailed air quality metrics
          </div>
          
        </div>
      </div>
    </div>
  `;
}
