import MockList from '../MockList'; //mock
import PeopleList from './PeopleList';

// need to padd array of users from api
export function NearbyPeople() {
  return <PeopleList people={MockList} />;
}
