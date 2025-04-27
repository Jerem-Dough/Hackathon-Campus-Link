import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_CARD_WIDTH = SCREEN_WIDTH * 0.7;
const H_CARD_MARGIN = 15;

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: any;
}

export default function EventsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const placeholderColor = Colors[colorScheme].tabIconDefault;
  const textColor = Colors[colorScheme].text;
  const borderColor = Colors[colorScheme].tabIconDefault;
  const backgroundColor = Colors[colorScheme].background;

  const [searchText, setSearchText] = useState('');
  const [events, setEvents] = useState<Event[]>([]);

  // ─────────────────────────────────── Fetch events ──────────────
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('http://10.5.176.13:5000/api/events/');
        const data = await resp.json();
        const mapped: Event[] = data.map((e: any) => ({
          ...e,
          id: e.id ?? `evt-${Math.random().toString(36).slice(2, 9)}`,
          image: require('../../assets/images/human.png'),
        }));
        const unique = mapped.filter(
          (e, i, arr) => i === arr.findIndex((x) => x.id === e.id)
        );
  
        setEvents(uniqueEvents);
      } catch (err) {
        console.error('Fetch events error:', err);
      }
    })();
  }, []);

  // ─────────────────────────────────── Filtering ─────────────────
  const filtered = useMemo(() => {
    const q = searchText.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }, [searchText, events]);

  // ────────────────────────────── Renderers ──────────────────────
  const renderHorizontal = ({ item }: { item: Event }) => (
    <View
      key={`h-${item.id}`}
      style={[
        styles.card,
        styles.horizontalCard,
        { borderColor, width: H_CARD_WIDTH, marginRight: H_CARD_MARGIN },
      ]}
    >
      <Image
        source={item.image}
        style={{
          width: '100%',
          height: 180,
          borderRadius: 10,
        }}
        resizeMode="cover"
      />
      <Text style={[styles.eventTitle, { color: textColor }]} numberOfLines={2}>
        {item.title}
      </Text>
    </View>
  );

  const renderVertical = (item: Event) => {
    const shortDesc =
      item.description.length > 100
        ? `${item.description.slice(0, 100)}…`
        : item.description;

    return (
      <View key={`v-${item.id}`} style={[styles.card, { borderColor }]}>
        <Image
          source={item.image}
          style={{
            width: '100%',
            height: 150,
            borderRadius: 10,
          }}
          resizeMode="cover"
        />
        <Text style={[styles.eventTitle, { color: textColor }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text
          style={[styles.eventDescription, { color: placeholderColor }]}
          numberOfLines={3}
        >
          {shortDesc.replace(/https?:\/\/[^\s]+/g, '')}
        </Text>
        <Text style={[styles.eventDetails, { color: placeholderColor }]}>
          {item.date} @ {item.location}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      lightColor={Colors.light.background}
      darkColor={Colors.dark.background}
    >
      <TextInput
        placeholder="Search events..."
        placeholderTextColor={placeholderColor}
        value={searchText}
        onChangeText={setSearchText}
        style={[
          styles.searchBar,
          { borderColor, color: textColor, borderWidth: 1 },
        ]}
      />

      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <FlatList
        data={filtered}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        keyExtractor={(i) => i.id}
        renderItem={renderHorizontal}
        decelerationRate="fast"
        snapToInterval={H_CARD_WIDTH + H_CARD_MARGIN}
        snapToAlignment="start"
      />

      <Text style={styles.sectionTitle}>All Events</Text>
      <FlatList
        data={filtered}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyExtractor={(i) => i.id}
        renderItem={renderVertical}
        showsVerticalScrollIndicator={false}
        // ensure it fills and scrolls properly
        ListFooterComponent={<View style={{ height: 50 }} />}
      />
    </ScrollView>
  );
}

// ─────────────────────────────────── Styles ──────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  } as ViewStyle,
  searchBar: {
    fontFamily: 'Poppins',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "transparent",
  } as ViewStyle,
  sectionTitle: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
  },
  horizontalList: {
    paddingBottom: 12,
  },
  horizontalCard: {
    alignItems: "center",
  } as ViewStyle,
  list: {
    flex: 1,
  } as ViewStyle,
  listContent: {
    paddingBottom: 16,
  } as ViewStyle,
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    backgroundColor: 'transparent',
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  } as ViewStyle,
  eventImage: {
    width: "100%",
    borderRadius: 8,
    marginBottom: 8,
  },
  eventTitle: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: "center",
  } as ViewStyle,
  eventDescription: {
    fontFamily: 'Poppins',
    fontSize: 14,
    marginBottom: 6,
    textAlign: "center",
  } as ViewStyle,
  eventDetails: {
    fontFamily: 'Poppins',
    fontSize: 13,
  },
});
