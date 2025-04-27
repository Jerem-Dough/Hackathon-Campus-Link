import { StyleSheet, ScrollView,FlatList,Image, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

interface Posts {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: any;
}

const dummyPosts: Posts[] = [
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
export default function HomeScreen() {
  const colorScheme = useColorScheme() || "light"; // Fallback to "light" if null or undefined

  return (
    <View style={styles.container} 
      lightColor={Colors.light.background} 
      darkColor={Colors.dark.background}
    >
      {/* Title Section */}
      <Text style={styles.title}>Welcome to Thani</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.subtitle}>Explore events, forums, maps, and more!</Text>

      {/* Horizontal Events Carousel */}
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      <FlatList
        data={dummyPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Image source={item.image} style={styles.eventImage} />
            <Text style={styles.eventTitle}>{item.title}</Text>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />

      {/* Vertical Posts Feed */}
      <Text style={styles.sectionTitle}>Recent Posts</Text>
      {dummyPosts.map((item) => (
        <View key={item.id} style={styles.postCard}>
          <Image source={item.image} style={styles.postImage} />
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postDescription}>{item.description}</Text>
          <Text style={styles.postDetails}>{item.date} @ {item.location}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 50,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  eventCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 120,
  },
  eventTitle: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center',
  },
  postCard: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
    borderWidth: StyleSheet.hairlineWidth, 
    backgroundColor: "transparent",
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  postTitle: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postDescription: {
    fontFamily: 'Poppins',
    fontSize: 14,
    marginBottom: 5,
  },
  postDetails: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#555',
  },
});
