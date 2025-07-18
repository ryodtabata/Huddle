import { useState, useEffect } from 'react';
import { getPendingFriendRequests } from '../firebase/friendsService';
import { useUser } from '../store/UserContext';

export function useFriendRequestCount(refreshTrigger?: number) {
  const { user } = useUser();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      if (!user?.uid) {
        setCount(0);
        return;
      }

      try {
        const requests = await getPendingFriendRequests(user.uid);
        setCount(requests.length);
      } catch (error) {
        console.error('Error fetching friend request count:', error);
        setCount(0);
      }
    };

    fetchCount();

    //should probably set up a real time listener eventually for now check every 30 secs ig
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, [user?.uid, refreshTrigger]);

  return count;
}
