import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, ActivityIndicator, View, Text, Image, ScrollView } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Marker, UrlTile } from 'react-native-maps';
import axios from 'axios';
import { useRouter } from 'expo-router'; 

export default function MapController() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchNearbyPlaces();
  }, []);

  const fetchNearbyPlaces = async () => {
    const latitude = 39.6780;
    const longitude = -104.9614;
    const radius = 1500; // meters (~1 mile)
    const type = 'restaurant';

    const apiKey = 'AIzaSyBuQZm9NDoMj1KJgRHiJaJGmfaWOvsGRAY'; 

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;

    try {
      const response = await axios.get(url);
      setPlaces(response.data.results);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError(err);
    }
  };

  const getPhotoUrl = (photoReference) => {
    const apiKey = 'AIzaSyBuQZm9NDoMj1KJgRHiJaJGmfaWOvsGRAY';
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
  };

  return (
    <View style={styles.container}>
      {!isMapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2e78b7" />
        </View>
      )}

      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: 39.6780,
          longitude: -104.9614,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onMapReady={() => setIsMapLoaded(true)}
        onPress={(e) => {
        if (e.nativeEvent.action !== 'marker-press') {
          setSelectedPlace(null);
        }
      }}
      >
        <UrlTile
          urlTemplate="https://api.mapbox.com/styles/v1/pravasiap/cm9ym33wp00ze01so7evi212q/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicHJhdmFzaWFwIiwiYSI6ImNtOXlsb3NtZzFrNjIycXBtNjk0ZjRlc3cifQ.obt9ZywKXyz4vauoooSxwQ"
          maximumZ={19}
        />

        {places.map((place, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
            description={place.vicinity}
            onPress={() => setSelectedPlace(place)}
          />
        ))}
      </MapView>

          {selectedPlace && (
      <View style={styles.popupContainer}>
        <ScrollView>
          {selectedPlace.photos && selectedPlace.photos.length > 0 && (
            <Image
              source={{ uri: getPhotoUrl(selectedPlace.photos[0].photo_reference) }}
              style={styles.placeImage}
            />
          )}
          <Text style={styles.placeTitle}>{selectedPlace.name}</Text>
          <Text style={styles.placeAddress}>{selectedPlace.vicinity}</Text>

          <View style={styles.buttonRow}>
          <Text style={styles.closeButton} onPress={() => setSelectedPlace(null)}>
            Close
          </Text>
          <Text
            style={styles.moreDetailsButton}
            onPress={() => {
              router.push({
                pathname: 'placeDetailsController',
                params: {
                  placeName: selectedPlace.name,
                  address: selectedPlace.vicinity,
                  rating: selectedPlace.rating,
                  placeId: selectedPlace.place_id,
                  types: selectedPlace.types ? selectedPlace.types.join(', ') : '',
                },
              });
            }}
          >
            More Details
          </Text>
        </View>

        </ScrollView>
      </View>
    )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', zIndex: 1,
  },
  popupContainer: {
    position: 'absolute',
    bottom: 125,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 2,
  },
  placeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  placeAddress: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
  placeImage: {
    width: '100%',
    height: 150,
    marginBottom: 10,
    borderRadius: 10,
  },
  errorBox: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    zIndex: 2,
  },
  closeButton: {
    color: 'blue',
    fontWeight: 'bold',
  },  
  moreDetailsButton: {
    color: 'blue',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 0,
  },    
});
