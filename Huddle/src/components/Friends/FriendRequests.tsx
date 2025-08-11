import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getPendingFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
} from '../../firebase/friendsService';
import { useUser } from '../../store/UserContext';

//THIS DOES NOT WORK RIGHT NOW!

interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  createdAt: any;
}

interface FriendRequestsProps {
  onRequestCountChange?: () => void;
}

export function FriendRequests({ onRequestCountChange }: FriendRequestsProps) {
  const { user } = useUser();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchFriendRequests();
  }, [user?.uid]);

  const fetchFriendRequests = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const requestsData = await getPendingFriendRequests(user.uid);
      setRequests(requestsData);
      console.log('Fetched friend requests:', requestsData);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setRequests([]);
    }
    setLoading(false);
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (processingRequests.has(request.id)) return;

    setProcessingRequests((prev) => new Set(prev).add(request.id));

    try {
      await acceptFriendRequest(request.id, request.fromUserId, user!.uid);

      //remove the request from the list
      setRequests((prev) => prev.filter((req) => req.id !== request.id));

      //notify parent component about count change
      onRequestCountChange?.();

      Alert.alert(
        'Friend Request Accepted',
        `You are now friends with ${request.fromUserName}!`
      );
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert(
        'Error',
        'Failed to accept friend request. Please try again.'
      );
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const handleDeclineRequest = async (request: FriendRequest) => {
    if (processingRequests.has(request.id)) return;

    Alert.alert(
      'Decline Friend Request',
      `Decline friend request from ${request.fromUserName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequests((prev) => new Set(prev).add(request.id));

            try {
              await declineFriendRequest(request.id);

              //remove from the list
              setRequests((prev) =>
                prev.filter((req) => req.id !== request.id)
              );

              //notify parent component about count change
              onRequestCountChange?.();

              Alert.alert(
                'Request Declined',
                `Friend request from ${request.fromUserName} has been declined.`
              );
            } catch (error) {
              console.error('Error declining friend request:', error);
              Alert.alert(
                'Error',
                'Failed to decline friend request. Please try again.'
              );
            } finally {
              setProcessingRequests((prev) => {
                const newSet = new Set(prev);
                newSet.delete(request.id);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      return '';
    }
  };

  const renderRequestItem = ({ item }: { item: FriendRequest }) => {
    const isProcessing = processingRequests.has(item.id);

    return (
      <View style={styles.requestItem}>
        <View style={styles.requestInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: `https://i.pravatar.cc/150?u=${item.fromUserId}`,
              }}
              style={styles.avatar}
            />
          </View>

          <View style={styles.requestDetails}>
            <Text style={styles.userName}>{item.fromUserName}</Text>
            <Text style={styles.requestTime}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable
            style={[
              styles.actionButton,
              styles.acceptButton,
              isProcessing && styles.disabledButton,
            ]}
            onPress={() => handleAcceptRequest(item)}
            disabled={isProcessing}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              styles.declineButton,
              isProcessing && styles.disabledButton,
            ]}
            onPress={() => handleDeclineRequest(item)}
            disabled={isProcessing}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading friend requests...</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="people-outline" size={64} color="#4a5568" />
        <Text style={styles.emptyTitle}>No Friend Requests</Text>
        <Text style={styles.emptySubtitle}>
          When someone sends you a friend request, it will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: '#232a36',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    // backgroundColor: '#4a5568',
  },
  requestDetails: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  requestTime: {
    color: '#9ca3af',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
