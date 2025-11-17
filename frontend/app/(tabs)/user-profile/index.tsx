import { Redirect } from 'expo-router';
import { ME_ID } from '@/scripts/data/mockProfiles';

export default function UserProfileIndex() {
  return <Redirect href={`/screens/user-profile/${ME_ID}`} />;
}
