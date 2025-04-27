import { StyleSheet, Image, FlatList } from "react-native";
import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

interface Forum {
  id: string;
  name: string;
  description: string;
  image: any;
  lastActive: string;
}

const dummyForums: Forum[] = [
  {
    id: "1",
    name: "Computer Science",
    description: "Discuss programming, algorithms, and CS concepts",
    image: require("../../assets/images/peeps.png"),
    lastActive: "2 mins ago",
  },
  {
    id: "2",
    name: "Student Life",
    description: "Campus events, activities, and student experiences",
    image: require("../../assets/images/peeps.png"),
    lastActive: "5 mins ago",
  },
  {
    id: "3",
    name: "Study Groups",
    description: "Find study partners and form study groups",
    image: require("../../assets/images/peeps.png"),
    lastActive: "15 mins ago",
  },
];

export default function ForumScreen() {
  const colorScheme = useColorScheme();

  const renderForumItem = ({ item }: { item: Forum }) => (
    <View style={styles.forumItem}>
      <Image source={item.image} style={styles.forumImage} />
      <View style={styles.forumContent}>
        <Text style={styles.forumName}>{item.name}</Text>
        <Text
          style={[
            styles.forumDescription,
            { color: Colors[colorScheme].tabIconDefault },
          ]}
        >
          {item.description}
        </Text>
        <Text style={styles.lastActive}>{item.lastActive}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Forum</Text>
      <FlatList
        data={dummyForums}
        keyExtractor={(item) => item.id}
        renderItem={renderForumItem}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  list: {
    width: "100%",
  },
  listContent: {
    paddingBottom: 20,
  },
  forumItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  forumImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  forumContent: {
    flex: 1,
    justifyContent: "center",
  },
  forumName: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
  },
  forumDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 12,
    color: "#666",
  },
});
