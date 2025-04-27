import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Button, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Comment = {
  text: string;
  timestamp: number;
  rating: number;
};

export default function PlaceDetailsScreen() {
  const { placeName, address, rating, placeId, types } = useLocalSearchParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    if (!placeId || typeof placeId !== 'string') return;
    try {
      const storedComments = await AsyncStorage.getItem(`comments_${placeId}`);
      if (storedComments) {
        setComments(JSON.parse(storedComments));
      }
    } catch (error) {
      console.error('Failed to load comments', error);
    }
  };

  const saveComments = async (updatedComments: Comment[]) => {
    if (!placeId || typeof placeId !== 'string') return;
    try {
      await AsyncStorage.setItem(`comments_${placeId}`, JSON.stringify(updatedComments));
    } catch (error) {
      console.error('Failed to save comments', error);
    }
  };

  const addComment = async () => {
    if (newComment.trim() !== '' && newRating > 0) {
      const newEntry: Comment = {
        text: newComment,
        timestamp: Date.now(),
        rating: newRating,
      };
      const updatedComments = [...comments, newEntry];
      setComments(updatedComments);
      setNewComment('');
      setNewRating(0);
      await saveComments(updatedComments);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1 }}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust if needed
    >
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{placeName}</Text>
      <Text style={styles.address}>{address}</Text>
      {types && (
      <Text style={styles.types}>
      {types
        .split(',')
        .map(type =>
          type
            .trim()
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        )
        .join(' • ')}
      </Text>
      )}
      <Text style={styles.rating}>⭐ {rating || 'No Rating'}</Text>
      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Student Reviews</Text>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <View key={index} style={styles.commentBox}>
              <Text style={styles.commentRating}>⭐ {comment.rating}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
              <Text style={styles.commentTimestamp}>{formatTimeAgo(comment.timestamp)}</Text>
            </View>
          ))
        ) : (
          <Text>No comments yet for this place.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Leave a Review</Text>

      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
            <Text style={star <= newRating ? styles.selectedStar : styles.star}>⭐</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Add a comment..."
        value={newComment}
        onChangeText={setNewComment}
      />

      <Button title="Post Review" onPress={addComment} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: 'white' },
  title: { fontFamily: 'Poppins', fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  address: { fontFamily: 'Poppins', fontSize: 16, color: 'gray', textAlign: 'center', marginBottom: 10 },
  rating: { fontFamily: 'Poppins', fontSize: 18, color: '#FFD700', textAlign: 'center', marginBottom: 20 },
  commentsSection: { fontFamily: 'Poppins', marginVertical: 20 },
  sectionTitle: {fontFamily: 'Poppins', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  commentBox: { fontFamily: 'Poppins',marginBottom: 15 },
  commentText: { fontFamily: 'Poppins',fontSize: 16 },
  commentRating: { fontFamily: 'Poppins',fontSize: 18 },
  commentTimestamp: { fontFamily: 'Poppins',fontSize: 12, color: 'gray' },
  input: { fontFamily: 'Poppins',borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10, marginBottom: 10 },
  ratingRow: { fontFamily: 'Poppins',flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  star: { fontSize: 30, color: 'gray', marginHorizontal: 5 },
  selectedStar: { fontSize: 30, color: '#FFD700', marginHorizontal: 5 },
  types: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 10,
  },  
});
