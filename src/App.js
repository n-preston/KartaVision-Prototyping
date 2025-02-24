import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic3dpamV3YXIiLCJhIjoiY203aW5ka3k3MHkzdzJqcHl0NzlhZXFrciJ9.zN-YAdr2tk8c3h5BBp9hEg';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng] = useState(103.8198); // Singapore coordinates
  const [lat] = useState(1.3521);
  const [zoom] = useState(11);
  
  // Generate coordinates within Singapore bounds
  const generateSingaporeCoordinates = () => {
    // Singapore bounds (approximate)
    const bounds = {
      north: 1.4504,
      south: 1.2494,
      east: 104.0120,
      west: 103.6055
    };
    
    // Generate random coordinates within bounds
    const lat = bounds.south + Math.random() * (bounds.north - bounds.south);
    const lng = bounds.west + Math.random() * (bounds.east - bounds.west);
    return [lng, lat];
  };

  // Generate mock locations in major Singapore areas
  const generateLocation = () => {
    const areas = [
      'Woodlands',
      'Jurong East',
      'Tampines',
      'Ang Mo Kio',
      'Toa Payoh',
      'Clementi',
      'Bedok',
      'Punggol',
      'Bukit Timah',
      'Geylang'
    ];
    const roads = [
      'Street',
      'Road',
      'Avenue',
      'Link',
      'Drive'
    ];
    const number = Math.floor(Math.random() * 50) + 1;
    const area = areas[Math.floor(Math.random() * areas.length)];
    const road = roads[Math.floor(Math.random() * roads.length)];
    return `${area} ${road} ${number}`;
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('What are you looking for?');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isResultsVisible, setIsResultsVisible] = useState(true);

  // Generate 100 mock potholes
  const mockResults = Array.from({ length: 100 }, (_, i) => {
    const severities = ['High', 'Medium', 'Low'];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const coordinates = generateSingaporeCoordinates();
    const imageNumber = (i % 3) + 1; // Cycle through images 1-3
    
    return {
      id: i + 1,
      title: `Pothole at ${generateLocation()}`,
      description: `Pothole reported by road user, requiring attention`,
      location: generateLocation(),
      severity,
      coordinates,
      reportDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within last 7 days
      status: ['Reported', 'Under Investigation', 'Scheduled for Repair'][Math.floor(Math.random() * 3)],
      imageUrl: `/images/pothole${imageNumber}.jpg`
    };
  });
  
  // Initialize map with heat map and markers
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add map layers when the map loads
    map.current.on('load', () => {
      // Add source for heat map and markers
      map.current.addSource('potholes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: mockResults.map(result => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: result.coordinates
            },
            properties: {
              id: result.id,
              severity: result.severity,
              weight: result.severity === 'High' ? 1 : result.severity === 'Medium' ? 0.6 : 0.3,
              imageUrl: result.imageUrl
            }
          }))
        }
      });

      // Add heat map layer (initially hidden)
      map.current.addLayer({
        id: 'potholes-heat',
        type: 'heatmap',
        source: 'potholes',
        maxzoom: 14,
        layout: {
          visibility: 'none'
        },
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            14, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 255, 0, 0)',
            0.2, 'rgb(0, 255, 0)',
            0.4, 'rgb(255, 255, 0)',
            0.6, 'rgb(255, 140, 0)',
            0.8, 'rgb(255, 0, 0)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            14, 20
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13, 1,
            14, 0
          ]
        }
      });

      // Add marker layer
      map.current.addLayer({
        id: 'potholes-markers',
        type: 'circle',
        source: 'potholes',
        minzoom: 14,
        layout: {
          visibility: 'none'
        },
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match',
            ['get', 'severity'],
            'High', '#ff0000',
            'Medium', '#ffa500',
            'Low', '#00ff00',
            '#000000'
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Store markers array for later reference
      const markers = [];
      
      // Add markers with popups
      mockResults.forEach(result => {
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'marker-popup';
        markerEl.style.visibility = 'hidden'; // Initially hidden
        markerEl.style.display = 'none'; // Initially hidden
        
        // Create image element
        const img = document.createElement('img');
        img.src = result.imageUrl;
        img.className = 'marker-popup-image';
        
        // Create severity indicator
        const severity = document.createElement('div');
        severity.className = `severity-indicator severity-${result.severity.toLowerCase()}`;
        severity.textContent = result.severity;
        
        markerEl.appendChild(img);
        markerEl.appendChild(severity);

        // Add marker to map
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(result.coordinates)
          .addTo(map.current);
        
        markers.push({ marker, element: markerEl });
      });

      // Handle zoom changes
      map.current.on('zoom', () => {
        const zoom = map.current.getZoom();
        markers.forEach(({ element }) => {
          if (element.style.visibility === 'visible') {
            element.style.display = zoom >= 14 ? 'block' : 'none';
          }
        });
      });
    });
  });

  // Handle placeholder animation
  useEffect(() => {
    // Don't start animation if input is focused
    if (isInputFocused) return;

    const examples = [
      'Potholes on highways',
      'Traffic light malfunction',
      'Broken street signs',
      'Road construction updates',
      'Street flooding reports'
    ];
    let currentExampleIndex = 0;
    let timeoutId;

    const typeText = (text, index) => {
      if (index <= text.length) {
        setPlaceholder(text.slice(0, index));
        timeoutId = setTimeout(() => typeText(text, index + 1), 100);
      } else {
        // Keep the text visible for 2 seconds before starting deletion
        timeoutId = setTimeout(() => deleteText(text), 2000);
      }
    };

    const deleteText = (text, index = text.length) => {
      if (index >= 0) {
        setPlaceholder(text.slice(0, index));
        timeoutId = setTimeout(() => deleteText(text, index - 1), 50);
      } else {
        // Move to next example immediately after deletion
        currentExampleIndex = (currentExampleIndex + 1) % examples.length;
        typeText(examples[currentExampleIndex], 0);
      }
    };

    const startAnimation = () => {
      const initialText = 'What are you looking for?';
      // Start by deleting the initial text
      deleteText(initialText);
    };

    // Start the animation after 3 seconds
    timeoutId = setTimeout(startAnimation, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Show markers only for pothole-related searches
    if (searchQuery.toLowerCase().includes('pothole')) {
      setSearchResults(mockResults);
      setIsResultsVisible(true);
      
      // Show both heat map and markers when results are visible
      if (map.current && map.current.getSource('potholes')) {
        map.current.setLayoutProperty('potholes-heat', 'visibility', 'visible');
        map.current.setLayoutProperty('potholes-markers', 'visibility', 'visible');
        
        // Show markers based on current zoom level
        const currentZoom = map.current.getZoom();
        document.querySelectorAll('.marker-popup').forEach(popup => {
          popup.style.visibility = 'visible';
          popup.style.display = currentZoom >= 14 ? 'block' : 'none';
        });
      }
    } else {
      setSearchResults([]);
      setIsResultsVisible(false);
      
      // Hide heat map and markers
      if (map.current && map.current.getSource('potholes')) {
        map.current.setLayoutProperty('potholes-heat', 'visibility', 'none');
        map.current.setLayoutProperty('potholes-markers', 'visibility', 'none');
        // Hide all marker popups
        document.querySelectorAll('.marker-popup').forEach(popup => {
          popup.style.visibility = 'hidden';
        });
      }
    }
  };

  useEffect(() => {
    if (map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lng, lat],
        zoom: zoom,
        pitch: 45,
        bearing: -17.6,
        antialias: true
      });

      map.current.on('load', () => {
        // Add 3D building layer
        map.current.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#d1d5db',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.5
          }
        });
      });

      // Add navigation controls to bottom right
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [lng, lat, zoom]);

  return (
    <div className="App">
      <div className="map-container" ref={mapContainer}></div>
      <div className="logo-container">
        <div className="logo">
          <span className="logo-karta">Karta</span>
          <span className="logo-vision">Vision</span>
        </div>
      </div>
      <div className="search-overlay">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className={`search-input ${isInputFocused ? 'focused' : ''}`}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          <button type="submit" className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="search-icon">
              <path d="M21.71 20.29l-5.01-5.01C17.54 13.68 18 11.91 18 10c0-4.41-3.59-8-8-8S2 5.59 2 10s3.59 8 8 8c1.91 0 3.68-0.46 5.28-1.3l5.01 5.01c0.39 0.39 1.02 0.39 1.41 0C22.1 21.32 22.1 20.68 21.71 20.29zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6S13.31 16 10 16z"/>
            </svg>
          </button>
        </form>
      </div>
      <div className="user-container">
        <button className="user-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="user-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </button>
      </div>
      {searchResults.length > 0 && (
        <div className={`results-container ${!isResultsVisible ? 'hidden' : ''}`}>
          <div className="results-header">
            <h2>Search Results ({searchResults.length})</h2>
            <button 
              className="toggle-results-button"
              onClick={() => {
                const newVisibility = !isResultsVisible;
                setIsResultsVisible(newVisibility);
                
                // Keep heat map visible always, only toggle markers
                if (map.current && map.current.getSource('potholes') && searchQuery.toLowerCase().includes('pothole')) {
                  // Hide markers when collapsed
                  if (!newVisibility) {
                    document.querySelectorAll('.marker-popup').forEach(popup => {
                      popup.style.visibility = 'hidden';
                      popup.style.display = 'none';
                    });
                  } else {
                    // Show markers based on current zoom level when expanded
                    const currentZoom = map.current.getZoom();
                    document.querySelectorAll('.marker-popup').forEach(popup => {
                      popup.style.visibility = 'visible';
                      popup.style.display = currentZoom >= 14 ? 'block' : 'none';
                    });
                  }
                }
              }}
            >
              {isResultsVisible ? 'Hide' : 'Show'}
            </button>
          </div>
          {isResultsVisible && (
            <div className="results-cards">
              {searchResults.map(result => (
                <div key={result.id} className="result-card">
                  <div className="result-image">
                    <img src={result.imageUrl} alt={result.title} />
                  </div>
                  <div className="result-card-content">
                    <h3>{result.title}</h3>
                    <p className="description">{result.description}</p>
                    <div className="result-details">
                      <div className="detail-row">
                        <strong>Date:</strong>
                        <span className="detail-value">{result.reportDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
