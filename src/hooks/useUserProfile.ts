import { useUser } from '@clerk/clerk-react';

export const useUserProfile = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  return {
    user,
    isSignedIn,
    isLoaded,
    userEmail: user?.emailAddresses[0]?.emailAddress,
    userFullName: user?.fullName,
    userFirstName: user?.firstName,
    userLastName: user?.lastName,
    userImageUrl: user?.imageUrl,
    userId: user?.id,
  };
};

export default useUserProfile;
