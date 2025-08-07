// src/utils/MatchinLogic.js
import { collectionGroup, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1.
 * @param {number} lon1 - Longitude of point 1.
 * @param {number} lat2 - Latitude of point 2.
 * @param {number} lon2 - Longitude of point 2.
 * @returns {number} Distance in kilometers.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Fetches potential matches from Firestore using an efficient Collection Group query.
 * It finds other user profiles that share at least one "vibe" with the current user,
 * and applies additional filters.
 *
 * @param {Object} currentUser - The current authenticated user object.
 * @param {Array<string>} userVibes - An array of the current user's selected vibes.
 * @param {Object} filters - An object containing filtering criteria (e.g., minAge, maxAge, gender, schedule, petFriendly).
 * @returns {Promise<Array>} A promise that resolves to an array of matching user profiles.
 */
export const fetchMatches = async (currentUser, userVibes, filters) => {
  if (!currentUser || !currentUser.uid || !userVibes || userVibes.length === 0) {
    return [];
  }

  try {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    
    // Start with a Collection Group query for all 'profiles' subcollections
    // Filter by vibes first
    let profilesQuery = query(
      collectionGroup(db, 'profiles'),
      where('vibes', 'array-contains-any', userVibes)
    );

    const profilesSnapshot = await getDocs(profilesQuery);

    const allMatches = [];
    profilesSnapshot.forEach((profileDoc) => {
      const profileData = profileDoc.data();
      // Exclude the current user's profile and any deactivated profiles from the matches list
      if (profileData.userId !== currentUser.uid && profileData.isDeactivated !== true) {
        // Apply other filters here after fetching the initial set of profiles
        // because Firestore queries cannot combine 'array-contains-any' with '!='
        let isMatch = true;
        if (profileData.age < filters.minAge || profileData.age > filters.maxAge) {
          isMatch = false;
        }
        if (filters.gender !== 'All' && profileData.gender !== filters.gender) {
          isMatch = false;
        }
        if (filters.schedule !== 'All' && profileData.schedule !== filters.schedule) {
          isMatch = false;
        }
        if (filters.petFriendly === true && profileData.petFriendly !== true) {
          isMatch = false;
        }
        
        if (isMatch) {
          // Generate a data URI for the image to avoid external network calls
          const firstLetter = profileData.name ? profileData.name.charAt(0).toUpperCase() : 'V';
          const imageUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='100%25' height='100%25' fill='%23A970FF'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='80' fill='%23FFFFFF'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;  

          allMatches.push({
            id: profileData.userId,
            name: profileData.name,
            imageUrl: imageUrl,
            location: profileData.location,
            ...profileData,
          });
        }
      }
    });

    return allMatches;
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};