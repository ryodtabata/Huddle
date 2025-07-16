// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Pressable,
//   StyleSheet,
//   Modal,
//   Image,
//   TextInput,
// } from 'react-native';
// import { ProfileCard } from '../Profile/ProfileCard';
// import MockList from '../MockList'; //mock data

// type Person = {
//   id: string;
//   name: string;
//   age: number;
//   bio: string;
//   distance: string;
//   imageUrl: string;
//   verified: boolean;
//   tags: string[];
// };

// type PeopleListProps = {
//   people: Person[];
// };

// export default function PeopleList({ people }: PeopleListProps) {
//   const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
//   const [search, setSearch] = useState('');

//   const filteredPeople = MockList.filter((person) =>
//     person.name.toLowerCase().includes(search.toLowerCase())
//   );
//   return (
//     <View style={styles.container}>
//       <TextInput
//         style={styles.searchBar}
//         placeholder="Search nearby people..."
//         placeholderTextColor="#aaa"
//         value={search}
//         onChangeText={setSearch}
//       />
//       <FlatList
//         data={filteredPeople}
//         ListEmptyComponent={
//           <View style={{ padding: 32, alignItems: 'center' }}>
//             <Text style={{ color: '#aaa', fontSize: 18 }}>
//               No results found.
//             </Text>
//           </View>
//         }
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <Pressable
//             style={({ pressed }) => [
//               styles.personItem,
//               pressed && { backgroundColor: '#263043' },
//             ]}
//             onPress={() => setSelectedPerson(item)}
//           >
//             <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
//             <View style={styles.info}>
//               <Text style={styles.personName}>
//                 {item.name}, <Text style={styles.personAge}>{item.age}</Text>
//               </Text>
//               <Text style={styles.personDistance}>{item.distance} away</Text>
//               <Text style={styles.personBio} numberOfLines={1}>
//                 {item.bio}
//               </Text>
//             </View>
//           </Pressable>
//         )}
//         ItemSeparatorComponent={() => <View style={styles.separator} />}
//       />

//       <Modal
//         visible={!!selectedPerson}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setSelectedPerson(null)}
//       >
//         <View style={styles.modalBackground}>
//           <View style={styles.modalContent}>
//             {selectedPerson && (
//               <ProfileCard
//                 name={selectedPerson.name}
//                 age={selectedPerson.age}
//                 bio={selectedPerson.bio}
//                 distance={selectedPerson.distance}
//                 imageUrl={selectedPerson.imageUrl}
//                 verified={selectedPerson.verified}
//                 tags={selectedPerson.tags}
//               />
//             )}
//             <Pressable
//               style={styles.closeButton}
//               onPress={() => setSelectedPerson(null)}
//             >
//               <Text style={styles.closeButtonText}>Close</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   info: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   container: {
//     flex: 1,
//     minWidth: '100%',
//     backgroundColor: '#181c24',
//     padding: 16,
//   },
//   searchBar: {
//     minHeight: 50,
//     width: '100%',
//     backgroundColor: '#232a36',
//     borderRadius: 24,
//     paddingHorizontal: 16,
//     fontSize: 16,
//     color: '#fff',
//     marginBottom: 14,
//     paddingVertical: 0,
//     textAlignVertical: 'center',
//   },
//   personItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#232a36',
//     borderRadius: 14,
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     elevation: 2,
//     flex: 1,
//   },
//   avatar: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//     marginRight: 14,
//     borderWidth: 2,
//     borderColor: '#4fc3f7',
//   },

//   personName: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 17,
//   },
//   personAge: {
//     color: '#b0b0b0',
//     fontWeight: 'normal',
//     fontSize: 16,
//   },
//   personDistance: {
//     color: '#4fc3f7',
//     fontSize: 14,
//     marginTop: 2,
//   },
//   personBio: {
//     color: '#b0b0b0',
//     fontSize: 13,
//     marginTop: 2,
//   },
//   separator: {
//     height: 12,
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(24,28,36,0.92)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: '94%',
//     backgroundColor: 'transparent',
//     borderRadius: 20,
//     alignItems: 'center',
//   },
//   closeButton: {
//     marginTop: 18,
//     backgroundColor: '#4fc3f7',
//     paddingVertical: 10,
//     paddingHorizontal: 32,
//     borderRadius: 20,
//   },
//   closeButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });
