import { StyleSheet, View } from 'react-native';
import MapController from '@/components/mapController'; 

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapController />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
