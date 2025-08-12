import { useState, useEffect } from 'react';
import { subscribeToPendingFriendRequests } from '../firebase/friendsService';
import { useUser } from '../store/UserContext';

export function useFriendRequestCount(refreshTrigger?: number) {
  const { user } = useUser();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setCount(0);
      return;
    }

    // Set up real-time listener for friend request count
    const unsubscribe = subscribeToPendingFriendRequests(
      user.uid,
      (requests: any[]) => {
        setCount(requests.length);
        console.log('Friend request count updated:', requests.length);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid, refreshTrigger]);

  return count;
}
