import React, { useState } from "react";
import { StyleSheet, Image, Pressable } from "react-native";
import { Text, View } from "./Themed";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

type PostProps = {
  author: string;
  content: string;
  timestamp?: string;
  image: any;
};

export default function Post({ author, content, timestamp, image }: PostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image source={image} style={styles.profileImage} />
        <Text style={styles.authorText}>{author}</Text>
      </View>
      <Text style={styles.contentText}>{content}</Text>
      {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}

      <View style={styles.actionsContainer}>
        <Pressable
          style={styles.actionButton}
          onPress={() => setIsLiked(!isLiked)}
        >
          <AntDesign
            name={isLiked ? "heart" : "hearto"}
            size={20}
            color={isLiked ? "red" : "#000"}
          />
          <Text style={styles.actionText}>Like</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <FontAwesome5 name="comment" size={20} color="#000" />
          <Text style={styles.actionText}>Comment</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => setIsPinned(!isPinned)}
        >
          <AntDesign
            name={isPinned ? "pushpin" : "pushpino"}
            size={20}
            color="#000"
          />
          <Text style={styles.actionText}>Pin</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  authorText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  contentText: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: "#000",
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    color: "#000",
    marginLeft: 8,
    fontSize: 14,
  },
});
