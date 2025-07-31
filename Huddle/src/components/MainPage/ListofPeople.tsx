// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Pressable,
//   StyleSheet,
//   Image,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import { useTheme } from '@react-navigation/native';
// import { ProfileModal } from '../Profile/ProfileModal';

// export type Person = {
//   id: string;
//   name: string;
//   age: number;
//   bio: string;
//   distance: string;
//   imageUrl: string;
//   verified: boolean;
//   tags: string[];
// };

// interface PeopleListProps {
//   people: Person[];
//   loading?: boolean;
//   showAsFriends?: boolean;
//   onMessage?: (person: Person) => void;
//   showSearch?: boolean;
//   showDistance?: boolean;
//   emptyMessage?: string;
// }

// export function PeopleList({
//   people,
//   loading = false,
//   showAsFriends = false,
//   onMessage,
//   showSearch = true,
//   showDistance = true,
//   emptyMessage = 'No people found',
// }: PeopleListProps) {
//   const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
//   const [search, setSearch] = useState('');
//   const { colors } = useTheme();

//   const filteredPeople = people.filter(
//     (person) =>
//       person.name.toLowerCase().includes(search.toLowerCase()) ||
//       person.bio.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {showSearch && (
//         <TextInput
//           style={[
//             styles.searchBar,
//             { backgroundColor: colors.card, color: colors.text },
//           ]}
//           placeholder="Search people..."
//           placeholderTextColor={colors.text + '99'}
//           value={search}
//           onChangeText={setSearch}
//         />
//       )}

//       {loading ? (
//         <ActivityIndicator
//           color={colors.accent}
//           size="large"
//           style={{ marginTop: 40 }}
//         />
//       ) : filteredPeople.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Text style={[styles.emptyMessage, { color: colors.text }]}>
//             {emptyMessage}
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredPeople}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <Pressable
//               style={({ pressed }) => [
//                 styles.personItem,
//                 { backgroundColor: colors.card },
//                 pressed && { backgroundColor: colors.accent + '22' },
//               ]}
//               onPress={() => setSelectedPerson(item)}
//             >
//               <Image
//                 source={{ uri: item.imageUrl }}
//                 style={[styles.avatar, { borderColor: colors.accent }]}
//               />
//               <View style={styles.info}>
//                 <Text style={[styles.personName, { color: colors.text }]}>
//                   {item.name},{' '}
//                   <Text
//                     style={[styles.personAge, { color: colors.text + 'BB' }]}
//                   >
//                     {item.age}
//                   </Text>
//                 </Text>
//                 {showDistance && (
//                   <Text
//                     style={[styles.personDistance, { color: colors.accent }]}
//                   >
//                     {item.distance} away
//                   </Text>
//                 )}
//                 <Text
//                   style={[styles.personBio, { color: colors.text + '99' }]}
//                   numberOfLines={1}
//                 >
//                   {item.bio}
//                 </Text>
//               </View>
//             </Pressable>
//           )}
//           ItemSeparatorComponent={() => <View style={styles.separator} />}
//         />
//       )}

//       <ProfileModal
//         visible={!!selectedPerson}
//         person={selectedPerson}
//         onClose={() => setSelectedPerson(null)}
//         isFriend={showAsFriends}
//         onMessage={onMessage}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   searchBar: {
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     fontSize: 16,
//     marginBottom: 14,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 60,
//   },
//   emptyMessage: {
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   personItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 14,
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     elevation: 2,
//   },
//   avatar: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//     marginRight: 14,
//     borderWidth: 2,
//   },
//   info: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   personName: {
//     fontWeight: 'bold',
//     fontSize: 17,
//   },
//   personAge: {
//     fontWeight: 'normal',
//     fontSize: 16,
//   },
//   personDistance: {
//     fontSize: 14,
//     marginTop: 2,
//   },
//   personBio: {
//     fontSize: 13,
//     marginTop: 2,
//   },
//   separator: {
//     height: 12,
//   },
// });
