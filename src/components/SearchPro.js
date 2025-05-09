import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './SearchPro.css';

const SearchPro = ({ onClose }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const [conversations, setConversations] = useState([
    "Potholes on highways",
    "Traffic light malfunction",
    "Broken street signs",
    "Road construction updates",
    "Street flooding reports"
  ]);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [activeDropdown, setActiveDropdown] = useState(null); // Track which dropdown is open
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Generate mock data for search results
  const generateMockResults = (searchType) => {
    // Base data for different road issues
    const locations = [
      "Bukit Timah Road 49",
      "Toa Payoh Link 16",
      "Toa Payoh Drive 8",
      "Clementi Avenue 33",
      "Toa Payoh Road 36",
      "Punggol Avenue 40",
      "Woodlands Drive 15",
      "Ang Mo Kio Avenue 3",
      "Orchard Road 22",
      "Jurong East Street 32"
    ];

    // Generate dates within different time periods
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Generate a series of results with appropriate dates
    const results = locations.map((location, index) => {
      let date;
      let timeGroup;
      
      if (index < 2) {
        // Today
        date = formatDate(today);
        timeGroup = "Today";
      } else if (index < 4) {
        // Yesterday
        date = formatDate(yesterday);
        timeGroup = "Yesterday";
      } else if (index < 7) {
        // Last week
        const daysAgo = Math.floor(Math.random() * 5) + 3;
        date = formatDate(new Date(today.setDate(today.getDate() - daysAgo)));
        timeGroup = "Last Week";
        today.setDate(today.getDate() + daysAgo); // Reset today
      } else {
        // Last month
        const daysAgo = Math.floor(Math.random() * 20) + 10;
        date = formatDate(new Date(today.setDate(today.getDate() - daysAgo)));
        timeGroup = "Last Month";
      }
      
      return {
        id: index + 1,
        title: `${searchType.includes("Pothole") ? "Pothole" : searchType} at ${location}`,
        description: `${searchType.includes("Pothole") ? "Pothole" : searchType} reported by road user, requiring attention`,
        date: date,
        timeGroup: timeGroup,
        imageUrl: `https://placehold.co/300x200/e9e9e9/333333?text=Pothole+${index + 1}`
      };
    });

    return results;
  };

  const formatDate = (date) => {
    return date.toISOString().slice(0, 10);
  };

  // Group results by time period
  const groupResultsByTime = (results) => {
    const groups = {};
    
    results.forEach(result => {
      if (!groups[result.timeGroup]) {
        groups[result.timeGroup] = [];
      }
      groups[result.timeGroup].push(result);
    });
    
    // Order of time groups
    const orderedGroups = ["Today", "Yesterday", "Last Week", "Last Month"];
    
    return orderedGroups
      .filter(group => groups[group] && groups[group].length > 0)
      .map(group => ({
        title: group,
        items: groups[group]
      }));
  };
  
  // Initialize map
  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [103.8198, 1.3521], // Singapore coordinates
      zoom: 11
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    return () => {
      // Clean up map when component unmounts
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add markers to map when in map view
  useEffect(() => {
    if (!map.current || viewMode !== 'map' || !searchResults.length) return;
    
    // Wait for map to be loaded
    if (!map.current.loaded()) {
      map.current.on('load', () => addMarkersToMap());
      return;
    }
    
    addMarkersToMap();
    
    return () => {
      // Clean up markers when component unmounts or view changes
      document.querySelectorAll('.mapboxgl-marker').forEach(marker => {
        marker.remove();
      });
    };
  }, [viewMode, searchResults]);
  
  // Function to add markers to map
  const addMarkersToMap = () => {
    // Remove existing markers
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => {
      marker.remove();
    });
    
    // Generate Singapore coordinates for results
    const markers = searchResults.map(result => {
      // Create mock coordinates for Singapore (will be slightly different for each result)
      const lat = 1.3521 + (Math.random() - 0.5) * 0.1; // Singapore latitude + random offset
      const lng = 103.8198 + (Math.random() - 0.5) * 0.1; // Singapore longitude + random offset
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'map-marker';
      
      // Add popup with result info
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="marker-popup">
            <h3>${result.title}</h3>
            <p>${result.description}</p>
            <p><strong>Date:</strong> ${result.date}</p>
          </div>
        `);
      
      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);
      
      return marker;
    });
    
    // If we have markers, fit the map to show all of them
    if (markers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 15
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Add the query to conversations if it's not already there
      if (!conversations.includes(query)) {
        setConversations(prev => [query, ...prev.slice(0, 9)]);
      }
      
      // Generate and display results
      const results = generateMockResults(query);
      setSearchResults(results);
      setShowResults(true);
      
      // No need to clear query - keep it in the input
    }
  };

  const handleConversationClick = (conversation) => {
    console.log('Selected conversation:', conversation);
    setQuery(conversation);
    
    // Generate and display results
    const results = generateMockResults(conversation);
    setSearchResults(results);
    setShowResults(true);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Group search results by time period
  const groupedResults = groupResultsByTime(searchResults);

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'map' : 'list');
  };

  // New function to handle export
  const handleExport = (format, conversation) => {
    console.log(`Exporting "${conversation}" in ${format} format`);
    // Close the dropdown after export action
    setActiveDropdown(null);
    // Here you would implement the actual export functionality
  };

  // Function to handle drag start
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add a class to the dragged item for styling
    e.currentTarget.classList.add('dragging');
  };

  // Function to handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverItem(index);
  };

  // Function to handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    
    // If we're not dragging or don't have a valid drag target, return
    if (draggedItem === null || dragOverItem === null || draggedItem === dragOverItem) {
      return;
    }
    
    // Create a copy of the conversations array
    const newConversations = [...conversations];
    
    // Remove the dragged item from the array
    const draggedItemValue = newConversations[draggedItem];
    newConversations.splice(draggedItem, 1);
    
    // Insert the dragged item at the new position
    newConversations.splice(dragOverItem, 0, draggedItemValue);
    
    // Update state with the new order
    setConversations(newConversations);
    
    // Reset drag state
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Function to handle drag end
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="search-pro-overlay">
      <div className="search-pro-container">
        {/* Sidebar */}
        <div className="search-pro-sidebar">
          <div className="search-pro-logo">
            <button className="back-button" onClick={onClose}>
              &lt; Back to Standard Search
            </button>
          </div>
          <div className="search-pro-history">
            <div className="projects-header">
              <h3 className="projects-heading">Projects</h3>
              <button 
                className="add-project-button" 
                onClick={() => {
                  setShowResults(false);
                  setQuery(''); // Clear query so placeholder will show
                }}
                title="Create new project"
              >
                +
              </button>
            </div>
            {conversations.map((conversation, index) => (
              <div 
                key={index} 
                className={`history-item ${dragOverItem === index ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
              >
                <div 
                  className="history-item-text"
                  onClick={() => handleConversationClick(conversation)}
                >
                  {conversation}
                </div>
                <div className="history-item-actions">
                  <button 
                    className="menu-dots-button"
                    onMouseDown={(e) => {
                      // When mousedown on dots, prepare for dragging
                      // The parent div has the draggable attribute
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      // Only open dropdown on click if not dragging
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === index ? null : index);
                    }}
                  >
                    ⋮
                  </button>
                  {activeDropdown === index && (
                    <div className="export-dropdown">
                      <div className="export-menu-header">Export as:</div>
                      <button 
                        className="export-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport('CSV', conversation);
                        }}
                      >
                        CSV
                      </button>
                      <button 
                        className="export-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport('SHP', conversation);
                        }}
                      >
                        SHP
                      </button>
                      <button 
                        className="export-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport('KML', conversation);
                        }}
                      >
                        KML
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content with Map */}
        <div className="search-pro-main">
          <div ref={mapContainer} className="search-pro-map"></div>
          
          {!showResults ? (
            <div className="search-pro-overlay-content">
              <h1>Create new project</h1>
              
              <form onSubmit={handleSubmit} className="search-pro-input-container">
                <div className="search-pro-input-wrapper">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Start defining your project..."
                    className="search-pro-input"
                  />
                  <button type="submit" className="search-circle-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </button>
                </div>
                
                <div className="filter-pills-container">
                  <button className="filter-pill">Area of interest</button>
                  <button className="filter-pill">Time period</button>
                  <button className="filter-pill">Feature</button>
                  <button className="filter-pill">...</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="search-results-container">
              <div className="search-results-header">
                <h2>Search Results ({searchResults.length})</h2>
                <button 
                  className="view-mode-button"
                  onClick={toggleViewMode}
                >
                  {viewMode === 'list' ? 'Map View' : 'List View'}
                </button>
              </div>
              
              {viewMode === 'list' ? (
                <div className="search-results-content">
                  {groupedResults.map((group, groupIndex) => (
                    <div key={groupIndex} className="time-group">
                      <h3 className="time-group-title">{group.title}</h3>
                      <div className="result-cards">
                        {group.items.map(result => (
                          <div key={result.id} className="result-card">
                            <div className="result-image">
                              <img src={result.imageUrl} alt={result.title} />
                            </div>
                            <div className="result-details">
                              <h4>{result.title}</h4>
                              <p>{result.description}</p>
                              <div className="result-date">
                                <strong>Date:</strong> {result.date}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="map-results-view">
                  {/* The map is already visible in the background */}
                  <div className="map-overlay-info">
                    <div className="map-results-summary">
                      <p>{searchResults.length} results shown on map</p>
                      <p>Click on a marker to see details</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="search-input-bar">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="search-input-small"
                />
                <button type="submit" className="submit-button-small">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPro; 