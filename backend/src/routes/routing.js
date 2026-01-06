const express = require('express');
const router = express.Router();

// OpenRouteService API key (JWT token)
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQzYmM5YTgxNTA1ZjQ2OTA5YzhhNzA1MDdmNjliM2ZkIiwiaCI6Im11cm11cjY0In0=';

// Proxy route for OpenRouteService directions API
router.post('/directions/:profile', async (req, res) => {
  const { profile } = req.params;
  const { coordinates, options } = req.body;

  // Validate profile
  const validProfiles = [
    'foot-walking', 'foot-hiking',
    'cycling-regular', 'cycling-road', 'cycling-safe', 'cycling-mountain',
    'driving-car'
  ];

  if (!validProfiles.includes(profile)) {
    return res.status(400).json({
      success: false,
      message: `Invalid profile. Valid profiles: ${validProfiles.join(', ')}`
    });
  }

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'At least 2 coordinates required'
    });
  }

  try {
    const requestBody = { coordinates };
    
    if (options && options.avoid_features) {
      requestBody.options = {
        avoid_features: options.avoid_features
      };
    }

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ORS_API_KEY
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ORS API error:', response.status, errorText);
      return res.status(response.status).json({
        success: false,
        message: 'Routing service error',
        details: errorText
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Routing proxy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get route',
      error: error.message
    });
  }
});

module.exports = router;
