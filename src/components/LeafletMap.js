import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function LeafletMap({ location, destination, onSetDestination }) {
  const webViewRef = useRef(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; height: 100vh; overflow: hidden; }
        #map { height: 100%; width: 100%; }
        .user-dot { 
            background-color: #007AFF; 
            border-radius: 50%; 
            width: 16px; 
            height: 16px; 
            border: 3px solid white; 
            box-shadow: 0 0 5px rgba(0,0,0,0.5); 
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Init map
        const map = L.map('map', { zoomControl: false }).setView([${location.latitude}, ${location.longitude}], 14);
        
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Map Click Listener to send coordinate back
        map.on('contextmenu', function(e) {
            // Emulate long press via context menu event on mobile Leaflet
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'LONG_PRESS', 
                latitude: e.latlng.lat, 
                longitude: e.latlng.lng 
            }));
        });
        
        // Also support click just because context menu might be tricky to trigger in some webviews
        let pressTimer;
        map.on('mousedown', function(e) {
            pressTimer = window.setTimeout(function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    type: 'LONG_PRESS', 
                    latitude: e.latlng.lat, 
                    longitude: e.latlng.lng 
                }));
            }, 800);
        });
        map.on('mouseup', function(e) { clearTimeout(pressTimer); });
        map.on('mousemove', function(e) { clearTimeout(pressTimer); });
        
        map.on('touchstart', function(e) {
            pressTimer = window.setTimeout(function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    type: 'LONG_PRESS', 
                    latitude: e.latlng.lat, 
                    longitude: e.latlng.lng 
                }));
            }, 800);
        });
        map.on('touchend', function(e) { clearTimeout(pressTimer); });
        map.on('touchmove', function(e) { clearTimeout(pressTimer); });

        // Markers
        let destinationMarker = null;
        let radiusCircle = null;
        const _userIcon = L.divIcon({ className: 'user-dot', iconSize: [22, 22], iconAnchor: [11, 11] });
        let userMarker = L.marker([${location.latitude}, ${location.longitude}], { icon: _userIcon }).addTo(map);

        // Listen for messages from React Native to update state dynamically without reloading html
        document.addEventListener('message', function(event) { handleAction(event.data); });
        window.addEventListener('message', function(event) { handleAction(event.data); });

        function handleAction(dataString) {
           const data = JSON.parse(dataString);
           if (data.type === 'UPDATE_DESTINATION') {
               if (destinationMarker) { map.removeLayer(destinationMarker); }
               if (radiusCircle) { map.removeLayer(radiusCircle); }
               
               if (data.latitude && data.longitude) {
                   destinationMarker = L.marker([data.latitude, data.longitude]).addTo(map);
                   radiusCircle = L.circle([data.latitude, data.longitude], {
                       color: 'rgba(0, 112, 255, 0.8)',
                       fillColor: 'rgba(0, 112, 255, 0.15)',
                       fillOpacity: 0.5,
                       radius: 5000
                   }).addTo(map);
                   map.setView([data.latitude, data.longitude], 12);
               }
           }
           if (data.type === 'UPDATE_LOCATION') {
               userMarker.setLatLng([data.latitude, data.longitude]);
           }
        }

        // Initialize any default destination passed on first render
        ${destination ? `handleAction(JSON.stringify({type: 'UPDATE_DESTINATION', latitude: ${destination.latitude}, longitude: ${destination.longitude}}));` : ''}

      </script>
    </body>
    </html>
  `;

  // Bridge props to WebView efficiently
  useEffect(() => {
    if (webViewRef.current) {
        if (destination) {
            webViewRef.current.injectJavaScript(`try { handleAction(JSON.stringify({type: 'UPDATE_DESTINATION', latitude: ${destination.latitude}, longitude: ${destination.longitude}})); } catch(e){} true;`);
        } else {
            webViewRef.current.injectJavaScript(`try { handleAction(JSON.stringify({type: 'UPDATE_DESTINATION', latitude: null, longitude: null})); } catch(e){} true;`);
        }
    }
  }, [destination]);

  useEffect(() => {
    if (webViewRef.current && location) {
         webViewRef.current.injectJavaScript(`try { handleAction(JSON.stringify({type: 'UPDATE_LOCATION', latitude: ${location.latitude}, longitude: ${location.longitude}})); } catch(e){} true;`);
    }
  }, [location]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'LONG_PRESS') {
                onSetDestination(data.latitude, data.longitude);
            }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e3df',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});
