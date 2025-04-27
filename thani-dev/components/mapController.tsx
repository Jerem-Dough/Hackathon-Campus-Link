import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, ActivityIndicator, View, Text, TextInput, Image, ScrollView } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Marker, UrlTile } from 'react-native-maps';
import axios from 'axios';
import { useRouter } from 'expo-router'; 
import Colors from '../constants/Colors'; 

export default function MapController() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const getPhotoUrl = (photoReference) => {
    const apiKey = 'AIzaSyBuQZm9NDoMj1KJgRHiJaJGmfaWOvsGRAY';
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
  };
  const knownTypes = [
    'restaurant',
    'cafe',
    'bar',
    'university',
    'library',
    'gym',
    'school',
    'hospital',
    'park',
    'restaurants',
    'cafes',
    'bars',
    'universities',
    'libraries',
    'gyms',
    'schools',
    'hospitals',
    'parks'
  ];
  

  useEffect(() => {
    fetchNearbyPlaces('');
  }, []);

  const fetchNearbyPlaces = async (keyword: string) => {
    const latitude = 39.6780;
    const longitude = -104.9614;
    const radius = 1500; // meters
    const apiKey = 'AIzaSyBuQZm9NDoMj1KJgRHiJaJGmfaWOvsGRAY'; 

    let url = '';

    if (knownTypes.includes(keyword.toLowerCase())) {
      const type = keyword.toLowerCase();
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${apiKey}`;
    } else {
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;
    }
  
    try {
      const response = await axios.get(url);
      setPlaces(response.data.results || []);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError(err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for a place..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => fetchNearbyPlaces(searchQuery)}
          style={styles.searchInput}
          placeholderTextColor="#aaa"
        />
        
        {searchQuery.length > 0 && (
          <Text style={styles.clearButton} onPress={() => {
            setSearchQuery('');
            fetchNearbyPlaces(); // Reload default (restaurants)
          }}>
            X
          </Text>
        )}
      </View>

      {/* Loading Spinner */}
      {!isMapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2e78b7" />
        </View>
      )}

      {/* Map */}
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
            pinColor='#38b6ff'
            key={index}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            title={place.name}
            description={place.vicinity}
            onPress={() => setSelectedPlace(place)}
            pinColor={selectedPlace?.place_id === place.place_id ? '#000' : '#38b6ff'}
          />
        ))}
      </MapView>

      {/* Popup */}
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
                    pathname: 'More Details',
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
  searchContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  searchInput: {
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  clearButton: {
    fontFamily: 'Poppins',
    position: 'absolute',
    right: 10,
    top: '90%',
    transform: [{ translateY: -10 }],
    fontSize: 18,
  },  
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  loadingOverlay: {
    fontFamily: 'Poppins',
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', zIndex: 1,
  },
  popupContainer: {
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  placeAddress: {
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
    color: 'blue',
    fontWeight: 'bold',
  },  
  moreDetailsButton: {
    fontFamily: 'Poppins',
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
