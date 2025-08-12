import React, { useState, useEffect } from 'react';
import { getUserFriends } from '../../firebase/friendsService';
import { PeopleList, Person } from '../MainPage/PeopleList';
import { useUser } from '../../store/UserContext';

interface FriendsListProps {
  onMessage?: (person: Person) => void;
}

export function FriendsList({ onMessage }: FriendsListProps) {
  const { user } = useUser();
  const [friends, setFriends] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFriends = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const friendsData = await getUserFriends(user.uid);

        const mapped = friendsData.map((friend: any) => ({
          id: friend.uid || friend.id, // Ensure we have an ID field for consistency
          name: friend.displayName || friend.name || 'Unknown',
          age: friend.age || 0,
          bio: friend.bio || '',
          distance: 'Friend', // For friends, we show "Friend" instead of distance
          imageUrl:
            friend.profileImage ||
            `https://i.pravatar.cc/150?u=${friend.uid || friend.id}`,
          verified: friend.verified || false,
        }));

        setFriends(mapped);
        console.log('Fetched friends:', mapped);
      } catch (e) {
        console.error('Error fetching friends:', e);
        setFriends([]);
      }
      setLoading(false);
    };

    fetchFriends();
  }, [user?.uid]);

  return (
    <PeopleList
      people={friends}
      loading={loading}
      showAsFriends={true}
      onMessage={onMessage}
      showSearch={true}
      showDistance={false} // Don't show distance for friends
      emptyMessage="No friends yet. Add some friends to see them here!"
    />
  );
}
