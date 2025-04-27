import React, { useState } from "react";
import {
  StyleSheet,
  Image,
  FlatList,
  Modal,
  Pressable,
  View,
} from "react-native";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import ForumPosts from "@/components/ForumPage";

// Static blue for close button
const thaniBlue = "#38b6ff";

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
  const colorScheme = useColorScheme() || "light";
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);

  const renderForumItem = ({ item }: { item: Forum }) => (
    <Pressable onPress={() => setSelectedForum(item)}>
      <View
        style={[
          styles.forumItem,
          { borderBottomColor: Colors[colorScheme].border },
        ]}
      >
        <Image source={item.image} style={styles.forumImage} />
        <View style={styles.forumContent}>
          <Text style={[styles.forumName, { color: Colors[colorScheme].text }]}>
            {item.name}
          </Text>
          <Text
            style={[
              styles.forumDescription,
              { color: Colors[colorScheme].tabIconDefault },
            ]}
          >
            {item.description}
          </Text>
          <Text
            style={[
              styles.lastActive,
              { color: Colors[colorScheme].tabIconDefault },
            ]}
          >
            {item.lastActive}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
        Student Forum
      </Text>

      <FlatList
        data={dummyForums}
        keyExtractor={(item) => item.id}
        renderItem={renderForumItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors[colorScheme].border,
            }}
          />
        )}
      />

      <Modal
        visible={!!selectedForum}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedForum(null)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: Colors[colorScheme].background },
          ]}
        >
          {selectedForum && (
            <>
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: Colors[colorScheme].border },
                ]}
              >
                <Text
                  style={[
                    styles.modalTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {selectedForum.name}
                </Text>
                <Pressable
                  style={[styles.closeButton, { backgroundColor: thaniBlue }]}
                  onPress={() => setSelectedForum(null)}
                >
                  <Text style={[styles.closeButtonText, { color: "#000" }]}>
                    Close
                  </Text>
                </Pressable>
              </View>
              <ForumPosts />
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  list: { width: "100%" },
  listContent: { paddingBottom: 20 },
  forumItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  forumImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  forumContent: { fontFamily: "Poppins", flex: 1, justifyContent: "center" },
  forumName: {
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
  },
  forumDescription: { fontFamily: "Poppins", fontSize: 14, marginBottom: 4 },
  lastActive: { fontFamily: "Poppins", fontSize: 12 },
  modalContainer: { flex: 1 },
  modalHeader: {
    fontFamily: "Poppins",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontFamily: "Poppins", fontSize: 24, fontWeight: "bold" },
  closeButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  closeButtonText: { fontFamily: "Poppins", fontSize: 14, fontWeight: "600" },
});
