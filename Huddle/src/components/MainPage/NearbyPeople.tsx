import React, { useState, useEffect } from 'react';
import { getNearbyUsers } from '../../firebase/geoService';
import { PeopleList, Person } from './PeopleList';
import { useUser } from '../../store/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NearbyPeopleProps {
  onMessage?: (person: Person) => void;
}

//need to add some secuirty to this, dont wnat thier exact location

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
          65, // trying to get withen 50m radius, THIS NEEDS TO BE TESTED AND CHANGED AS NEEDED
          userProfile.uid
        );

        const mapped = users.map((u: any) => ({
          id: u.uid,
          name: u.displayName || 'Unknown',
          age: u.age || 0,
          bio: u.bio || '',
          distance: 'nearby',
          imageUrl: u.profileImage || null,
          verified: u.verified || false,
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
    intervalId = setInterval(fetchNearbyPeople, 300000); // Fetch every 5 minutes, again need to update this accoiurdingly

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
