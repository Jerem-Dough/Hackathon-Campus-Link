import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import MapView, { PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { View } from '@/components/Themed';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        showsUserLocation={true}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: 39.6780,      // University of Denver
          longitude: -104.9614,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <UrlTile
          urlTemplate="https://api.mapbox.com/styles/v1/pravasiap/cm9ym33wp00ze01so7evi212q/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoicHJhdmFzaWFwIiwiYSI6ImNtOXlsb3NtZzFrNjIycXBtNjk0ZjRlc3cifQ.obt9ZywKXyz4vauoooSxwQ"
          maximumZ={19}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
