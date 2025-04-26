import { StyleSheet, FlatList, TextInput, Image } from "react-native";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useState, useMemo } from "react";

// Define the Event interface with description
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: any;
}

// Dummy events data with description and local image via require
const dummyEvents: Event[] = [
  {
    id: "1",
    title: "Hackathon at University of Denver",
    description:
      "Join students across campus to solve real-world problems in a 24-hour challenge.",
    date: "2025-05-10",
    location: "University of Denver",
    image: require("../../assets/images/human.png"),
  },
  {
    id: "2",
    title: "Guest Lecture: AI Ethics",
    description:
      "A deep dive into ethical considerations in artificial intelligence systems.",
    date: "2025-05-12",
    location: "MSU Denver",
    image: require("../../assets/images/human.png"),
  },
  {
    id: "3",
    title: "Spring Coding Workshop",
    description:
      "Hands-on tutorials on modern development tools and best practices.",
    date: "2025-05-15",
    location: "DU Coding Lab",
    image: require("../../assets/images/human.png"),
  },
];

export default function EventsScreen() {
  const colorScheme = useColorScheme();
  const [searchText, setSearchText] = useState("");

  const filteredEvents = useMemo(
    () =>
      dummyEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(searchText.toLowerCase()) ||
          e.location.toLowerCase().includes(searchText.toLowerCase()) ||
          e.description.toLowerCase().includes(searchText.toLowerCase())
      ),
    [searchText]
  );

  const renderItem = ({ item }: { item: Event }) => (
    <View
      style={[styles.card, { borderColor: Colors[colorScheme].tabIconDefault }]}
    >
      <Image source={item.image} style={styles.eventImage} />
      <Text style={[styles.eventTitle, { color: Colors[colorScheme].text }]}>
        {item.title}
      </Text>
      <Text
        style={[
          styles.eventDescription,
          { color: Colors[colorScheme].tabIconDefault },
        ]}
      >
        {item.description}
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
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  list: {
    width: "100%",
  },
  listContent: {
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
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "center",
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: "center",
  },
  eventDetails: {
    fontSize: 14,
  },
});
