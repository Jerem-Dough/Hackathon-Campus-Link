import { StyleSheet, FlatList, TextInput, Image } from "react-native";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useState, useMemo, useEffect } from "react"; // Add useEffect

// Update Event interface to match API response
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string; // Changed from any to string
}

export default function EventsScreen() {
  const colorScheme = useColorScheme() || "light";
  const [searchText, setSearchText] = useState("");
  const [events, setEvents] = useState<Event[]>([]); // New state for events

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://10.5.176.13:5000/api/events/");
        const data = await response.json();

        // Transform the data and ensure unique IDs
        const transformedData = data.map((event: Event) => ({
          ...event,
          id: event.id || `event-${Math.random().toString(36).substr(2, 9)}`, // Fallback ID if none exists
          image: require("../../assets/images/human.png"),
        }));

        // Verify no duplicate IDs exist
        const uniqueEvents = transformedData.filter(
          (event, index, self) =>
            index === self.findIndex((e) => e.id === event.id)
        );

        setEvents(uniqueEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Update filteredEvents to use events state instead of dummyEvents
  const filteredEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.title.toLowerCase().includes(searchText.toLowerCase()) ||
          e.location.toLowerCase().includes(searchText.toLowerCase()) ||
          e.description.toLowerCase().includes(searchText.toLowerCase())
      ),
    [searchText, events]
  );

  const DESCRIPTION_MAX_LENGTH = 100; // You can adjust this number

  const renderItem = ({ item }: { item: Event }) => {
    const truncatedDescription =
      item.description.length > DESCRIPTION_MAX_LENGTH
        ? `${item.description.slice(0, DESCRIPTION_MAX_LENGTH)}...`
        : item.description;

    return (
      <View
        style={[
          styles.card,
          { borderColor: Colors[colorScheme].tabIconDefault },
        ]}
      >
        <Image source={item.image} style={styles.eventImage} />
        <Text style={[styles.eventTitle, { color: Colors[colorScheme].text }]}>
          {item.title}
        </Text>
        <Text
          style={[
            styles.eventDescription,
            { color: Colors[colorScheme]?.tabIconDefault || "#000" },
          ]}
        >
          {truncatedDescription.replace(/https?:\/\/[^\s]+/g, "")}
        </Text>
        <Text
          style={[
            styles.eventDetails,
            { color: Colors[colorScheme].tabIconDefault },
          ]}
        >
          {item.date} @ {item.location}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={styles.container}
      lightColor={Colors.light.background}
      darkColor={Colors.dark.background}
    >
      {/* Search bar with white border and text */}
      <TextInput
        placeholder="Search events..."
        placeholderTextColor="#fff"
        value={searchText}
        onChangeText={setSearchText}
        style={[
          styles.searchBar,
          {
            borderWidth: 1,
            borderColor: "#fff",
            color: "#fff",
            backgroundColor: "transparent",
          },
        ]}
      />

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchBar: {
    fontFamily: "Poppins",
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  list: {
    width: "100%",
  },
  listContent: {
    fontFamily: "Poppins",
    paddingBottom: 20,
  },
  card: {
    padding: 15,
    marginBottom: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  eventImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventTitle: {
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
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
    fontSize: 14,
  },
});
