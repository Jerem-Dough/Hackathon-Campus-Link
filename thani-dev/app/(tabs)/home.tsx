import React, { useState, useMemo, useEffect } from "react";
import {
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  SafeAreaView,
  Dimensions,
  ScrollView,
  ViewStyle,
} from "react-native";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
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
  const colorScheme = useColorScheme() ?? "light";
  const placeholderColor = Colors[colorScheme].tabIconDefault;
  const textColor = Colors[colorScheme].text;
  const borderColor = Colors[colorScheme].tabIconDefault;
  const backgroundColor = Colors[colorScheme].background;

  const [searchText, setSearchText] = useState("");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("http://10.5.176.13:5000/api/events/");
        const data = await resp.json();
  
        const eventImages: Record<string, any> = {
          'sigma chi - delta iota tabling event (derby days 2025)': require('../../assets/images/derby_days.png'),
          'usg spring 2025 debate and townhall': require('../../assets/images/usg_election.png'),
          'munch week all stars': require('../../assets/images/munch_week.png'),
          'earth day concert featuring gaeya': require('../../assets/images/gaeya.png'),
          'senior week 2025': require('../../assets/images/senior_week.png'),
          'intro to cad': require('../../assets/images/intro_CAD.png'),
          'laisa movie night': require('../../assets/images/laisa_movie.png'),
          'fellowships 101: professional development workshop for staff & faculty': require('../../assets/images/fellowships.png'),
          'sewing workshop: making lanyards & keychains': require('../../assets/images/sewing.png'),
        };
  
        const transformed = data.map((event: Event) => {
          const cleanTitle = event.title.trim().toLowerCase();
          const matchedImage = eventImages[cleanTitle];
  
          return {
            ...event,
            id: event.id || `event-${Math.random().toString(36).substr(2, 9)}`,
            image: matchedImage || require('../../assets/images/human.png'),
          };
        });
  
        const uniqueEvents = transformed.filter(
          (e, i, arr) => i === arr.findIndex((x) => x.id === e.id)
        );
  
        setEvents(uniqueEvents);
      } catch (err) {
        console.error('Fetch events error:', err);
      }
    })();
  }, []);

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        const q = searchText.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
        );
      }),
    [searchText, events]
  );

  const renderHorizontal = ({ item }: { item: Event }) => (
    <View
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

  const renderVertical = ({ item }: { item: Event }) => {
    const shortDesc =
      item.description.length > 100
        ? item.description.slice(0, 100) + "…"
        : item.description;

    return (
      <View style={[styles.card, { borderColor }]}>
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
          {shortDesc.replace(/https?:\/\/[^\s]+/g, "")}
        </Text>
        <Text style={[styles.eventDetails, { color: placeholderColor }]}>
          {item.date} @ {item.location}
        </Text>
      </View>
    );
  };

  // 🚀 RETURN your UI here:
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.container}>
          <TextInput
            placeholder="Search events..."
            placeholderTextColor={placeholderColor}
            style={[styles.searchBar, { color: textColor, borderColor }]}
            value={searchText}
            onChangeText={setSearchText}
          />

          <Text style={[styles.sectionTitle, { color: textColor }]}>
            🎵 Playlist Events
          </Text>

          <FlatList
            data={filtered.slice(0, 5)} // Show first 5 as playlist
            renderItem={renderHorizontal}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 10, paddingRight: 10 }}
          />

          <Text style={[styles.sectionTitle, { color: textColor, marginTop: 20 }]}>
            📅 Upcoming Events
          </Text>

          <FlatList
            data={filtered.slice(5)} // Rest of the events
            renderItem={renderVertical}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // inside ScrollView
            contentContainerStyle={{ paddingTop: 10 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  } as ViewStyle,
  searchBar: {
    fontFamily: "Poppins",
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  sectionTitle: {
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 8,
  },
  horizontalList: {
    paddingBottom: 12,
  },
  horizontalCard: {
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    backgroundColor: "transparent",
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  eventTitle: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "center",
  },
  eventDescription: {
    fontFamily: "Poppins",
    fontSize: 14,
    marginBottom: 6,
    textAlign: "center",
  },
  eventDetails: {
    fontFamily: "Poppins",
    fontSize: 13,
  },
});
