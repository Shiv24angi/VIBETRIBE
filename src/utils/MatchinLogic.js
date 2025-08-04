import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Fetches all profiles from the nested 'profiles' subcollection of every user.
 * This function simulates a matching service by gathering all user profiles,
 * but it is important to note that this method is inefficient and may
 * incur high read costs on a large-scale application.
 *
 * @param {Object} currentUser - The current authenticated user object.
 * @returns {Promise<Array>} A promise that resolves to an array of all other user profiles.
 */
export const fetchMatches = async (currentUser) => {
  if (!currentUser || !currentUser.uid) {
    return [];
  }

  try {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const usersRef = collection(db, `artifacts/${appId}/users`);
    const usersSnapshot = await getDocs(usersRef);

    const allProfiles = [];
    for (const userDoc of usersSnapshot.docs) {
      if (userDoc.id !== currentUser.uid) { // Exclude the current user from the list
        // Correctly build the path to the nested profile document
        const profileDocRef = doc(db, `artifacts/${appId}/users/${userDoc.id}/profiles`, 'myProfile');
        const profileDoc = await getDoc(profileDocRef);
        
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          allProfiles.push({
            id: userDoc.id,
            name: data.name,
            imageUrl: `https://placehold.co/150x150/A970FF/FFFFFF?text=${data.name.charAt(0)}`,
            ...data,
          });
        }
      }
    }
    return allProfiles;
  } catch (error) {
    console.error("Error fetching all profiles:", error);
    return [];
  }
};
