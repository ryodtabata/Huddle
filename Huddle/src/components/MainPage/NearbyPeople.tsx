import React, { useState, useEffect } from 'react';
import { getNearbyUsers } from '../../firebase/geoService';
import { PeopleList, Person } from './PeopleList';
import { useUser } from '../../store/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NearbyPeopleProps {
  onMessage?: (person: Person) => void;
}

export function NearbyPeople({ onMessage }: NearbyPeopleProps) {
  const { userProfile } = useUser();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchNearbyPeople = async () => {
      console.log('Fetching nearby users... with location:');

      if (
        !userProfile?.location?.latitude ||
        !userProfile?.location?.longitude
      ) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const users = await getNearbyUsers(
          userProfile.location.latitude,
          userProfile.location.longitude,
          50, // trying to get withen 50m radius
          userProfile.uid
        );

        const mapped = users.map((u: any) => ({
          id: u.uid,
          name: u.displayName || 'Unknown',
          age: u.age || 0,
          bio: u.bio || '',
          distance: u.distance ? `${u.distance.toFixed(1)} km` : '',
          imageUrl: u.profileImage || null,
          verified: u.verified || false,
          tags: u.tags || [],
          groupchats: u.groupchats || [],
        }));
        setPeople(mapped);
        console.log('Fetched people:', mapped);
      } catch (e) {
        console.error('Error fetching nearby people:', e);
        setPeople([]);
      }
      setLoading(false);
    };

    fetchNearbyPeople();
    intervalId = setInterval(fetchNearbyPeople, 300000); // Fetch every 5 minutes

    return () => clearInterval(intervalId);
  }, [userProfile?.location?.latitude, userProfile?.location?.longitude]);

  return (
    <SafeAreaView>
      <PeopleList
        people={people}
        loading={loading}
        showAsFriends={false}
        onMessage={onMessage}
        showSearch={true}
        showDistance={true}
        emptyMessage="No nearby people found"
      />
    </SafeAreaView>
  );
}
