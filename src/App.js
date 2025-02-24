import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';

// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic3dpamV3YXIiLCJhIjoiY203aW5ka3k3MHkzdzJqcHl0NzlhZXFrciJ9.zN-YAdr2tk8c3h5BBp9hEg';


// Mock image data
const mockImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
    description: 'Urban highway with multiple lanes and traffic',
    tags: ['highway', 'traffic', 'urban', 'multilane'],
    coordinates: [-74.006, 40.7128], // New York coordinates
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=400',
    description: 'Country road through forest',
    tags: ['rural', 'forest', 'nature', 'scenic'],
    coordinates: [-118.2437, 34.0522], // Los Angeles coordinates
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1542338106-1b4bfe84d5df?w=400',
    description: 'City intersection with traffic lights',
    tags: ['intersection', 'urban', 'traffic', 'signals'],
    coordinates: [-87.6298, 41.8781], // Chicago coordinates
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1544306094-e2dcf9479da3?w=400',
    description: 'Empty residential street',
    tags: ['residential', 'suburban', 'quiet', 'neighborhood'],
    coordinates: [-71.0589, 42.3601], // Boston coordinates
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1531765408077-9a1f85f90f04?w=400',
    description: 'Bridge over river with heavy traffic',
    tags: ['bridge', 'infrastructure', 'traffic', 'water'],
    coordinates: [-122.4194, 37.7749], // San Francisco coordinates
  }
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-98.5795);
  const [lat, setLat] = useState(39.8283);
  const [zoom, setZoom] = useState(3);

  useEffect(() => {
    if (viewMode === 'map') {
      if (!map.current) {
        try {
          map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [lng, lat],
          zoom: zoom
          });
        } catch (error) {
          console.error('Error initializing map:', error);
          return;
        }

        map.current.on('load', () => {
          if (!searchResults || searchResults.length === 0) return;
          map.current.addSource('search-results', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: searchResults.map(image => ({
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: image.coordinates
                },
                properties: {
                  weight: 1,
                  description: image.description,
                  tags: image.tags
                }
              }))
            }
          });

          map.current.addLayer({
            id: 'heatmap',
            type: 'heatmap',
            source: 'search-results',
            paint: {
              'heatmap-weight': 1,
              'heatmap-intensity': 1,
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0, 165, 80, 0)',
                0.2, 'rgba(0, 165, 80, 0.2)',
                0.4, 'rgba(0, 165, 80, 0.4)',
                0.6, 'rgba(0, 165, 80, 0.6)',
                0.8, 'rgba(0, 165, 80, 0.8)',
                1, 'rgba(0, 165, 80, 1)'
              ],
              'heatmap-radius': 30
            }
          });
        });
      } else {
        // Update existing map data
        const source = map.current.getSource('search-results');
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: searchResults.map(image => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: image.coordinates
              },
              properties: {
                weight: 1,
                description: image.description,
                tags: image.tags
              }
            }))
          });
        }
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [viewMode, searchResults, lng, lat, zoom]);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Perform search
    const results = mockImages.filter(img => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        img.description.toLowerCase().includes(searchTerm) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    });

    // Simulate API delay
    setTimeout(() => {
      setSearchResults(results);
      setIsLoading(false);
    }, 500);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="App">
      <main className="main-content">
        <div className="header">
          <h1 className="title"><strong>Karta</strong> Vision</h1>
          <div className="user-menu">
            <button onClick={toggleDropdown} className="user-button">
              <div className="user-icon"></div>
              <span className="username">John Doe</span>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item">Filters</button>
                <button className="dropdown-item">Account Settings</button>
                <button className="dropdown-item">Contact Us</button>
              </div>
            )}
          </div>
        </div>
        
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="road"
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          <div className="view-controls">
            <button 
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid View
            </button>
            <button 
              className={`view-button ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              Map View
            </button>
          </div>

          <div className="results-area">
            {isLoading ? (
              <div className="loading">Searching...</div>
            ) : searchResults === null ? (
              <div className="initial-state">Enter a search term to begin</div>
            ) : searchResults.length === 0 ? (
              <div className="no-results">No results found. Try adjusting your search criteria.</div>
            ) : viewMode === 'grid' ? (
              <div className="image-grid">
                {searchResults.map(image => (
                  <div key={image.id} className="image-card">
                    <img src={image.url} alt={image.description} />
                    <div className="image-info">
                      <p className="image-description">{image.description}</p>
                      <div className="image-tags">
                        {image.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="map-container" ref={mapContainer} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
