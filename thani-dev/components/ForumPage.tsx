import React from "react";
import { StyleSheet, FlatList } from "react-native";
import { View } from "./Themed";
import Post from "./Post";

type Post = {
  id: string;
  author: string;
  content: string;
  timestamp?: string;
  image: any;
};

const dummyPosts: Post[] = [
  {
    id: "1",
    author: "Alice",
    content: "Just joined this forum, excited to meet everyone!",
    timestamp: "2m ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "2",
    author: "Bob",
    content:
      "Anyone here interested in mobile app development? I'm starting a study group for React Native.",
    timestamp: "5m ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "3",
    author: "Charlie",
    content:
      "I love React Native! What are your favorite libraries? I'm currently exploring Redux and React Navigation.",
    timestamp: "15m ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "4",
    author: "David",
    content:
      "Has anyone taken the Advanced Algorithms course? Looking for study partners.",
    timestamp: "30m ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "5",
    author: "Eva",
    content:
      "Working on a machine learning project. Need help with TensorFlow implementation.",
    timestamp: "45m ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "6",
    author: "Frank",
    content:
      "Just finished my internship at Google. Happy to share my experience and tips for interviews!",
    timestamp: "1h ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "7",
    author: "Grace",
    content:
      "Starting a weekend hackathon team. Need 3 more people. DM if interested!",
    timestamp: "2h ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "8",
    author: "Henry",
    content:
      "Found this amazing YouTube channel for learning system design. Link in the comments!",
    timestamp: "3h ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "9",
    author: "Ivy",
    content:
      "Anyone else struggling with TypeScript generics? Let's discuss some practical examples.",
    timestamp: "4h ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "10",
    author: "Jack",
    content:
      "Created a GitHub repo with useful CS fundamentals cheat sheets. Check it out!",
    timestamp: "5h ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "11",
    author: "Kelly",
    content:
      "Looking for feedback on my portfolio website. Any UI/UX suggestions welcome!",
    timestamp: "6h ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "12",
    author: "Liam",
    content:
      "Just deployed my first full-stack app on AWS. The documentation is massive!",
    timestamp: "7h ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "13",
    author: "Maya",
    content:
      "Anyone using Next.js 13? The app directory feature is game-changing!",
    timestamp: "8h ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "14",
    author: "Noah",
    content:
      "Organizing a tech talk on Blockchain Development next week. Who's in?",
    timestamp: "9h ago",
    image: require("../assets/images/pfp.jpg"),
  },
  {
    id: "15",
    author: "Olivia",
    content:
      "Found a bug in the university's course registration system. Time to practice some ethical hacking!",
    timestamp: "10h ago",
    image: require("../assets/images/pfp.jpg"),
  },
];

export default function ForumPosts() {
  return (
    <View style={styles.container}>
      <FlatList
        data={dummyPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Post
            author={item.author}
            content={item.content}
            timestamp={item.timestamp}
            image={item.image}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  listContent: {
    padding: 16,
  },
});
