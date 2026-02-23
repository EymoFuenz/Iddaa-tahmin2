/**
 * Firebase Service
 * Firestore operations for teams, matches, and predictions
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { Team, Match, MatchPrediction, RecentMatch } from '@/types';

// Firebase config from env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Teams operations
export async function addTeam(teamData: Omit<Team, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'teams'), {
      ...teamData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding team:', error);
    throw error;
  }
}

export async function getTeams(): Promise<Team[]> {
  try {
    const q = query(collection(db, 'teams'), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Use apiId if available (for custom teams), otherwise use doc.id
      const teamId = data.apiId || parseInt(doc.id) || Math.random();
      return {
        id: teamId,
        ...data,
      } as Team;
    });
  } catch (error) {
    console.error('Error getting teams:', error);
    throw error;
  }
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  try {
    const docRef = doc(db, 'teams', teamId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: parseInt(docSnap.id),
        ...docSnap.data(),
      } as Team;
    }
    return null;
  } catch (error) {
    console.error('Error getting team:', error);
    throw error;
  }
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
  try {
    const docRef = doc(db, 'teams', teamId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
}

export async function deleteTeam(teamId: string): Promise<void> {
  try {
    const docRef = doc(db, 'teams', teamId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
}

// Recent Matches operations
export async function addRecentMatchToTeam(teamId: string, match: RecentMatch): Promise<void> {
  try {
    const docRef = doc(db, 'teams', teamId);
    const teamDoc = await getDoc(docRef);
    if (teamDoc.exists()) {
      const team = teamDoc.data() as Team;
      const recentMatches = team.recentMatches || [];
      
      // Keep last 10 matches
      const updatedMatches = [match, ...recentMatches].slice(0, 10);
      
      await updateDoc(docRef, {
        recentMatches: updatedMatches,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error adding recent match:', error);
    throw error;
  }
}

export async function updateTeamMarketValue(teamId: string, marketValue: number): Promise<void> {
  try {
    const docRef = doc(db, 'teams', teamId);
    await updateDoc(docRef, {
      marketValue,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating market value:', error);
    throw error;
  }
}

// Matches operations
export async function addMatch(matchData: Omit<Match, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'matches'), {
      ...matchData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding match:', error);
    throw error;
  }
}

export async function getMatches(): Promise<Match[]> {
  try {
    const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data(),
    } as Match));
  } catch (error) {
    console.error('Error getting matches:', error);
    throw error;
  }
}

export async function getUpcomingMatches(days: number = 7): Promise<Match[]> {
  try {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    
    const q = query(
      collection(db, 'matches'),
      where('date', '>=', today.toISOString()),
      where('date', '<=', futureDate.toISOString()),
      orderBy('date', 'asc'),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data(),
    } as Match));
  } catch (error) {
    console.error('Error getting upcoming matches:', error);
    throw error;
  }
}

// Predictions operations
export async function savePrediction(prediction: Omit<MatchPrediction, 'matchId'>, userId?: string): Promise<string> {
  try {
    const predictionsRef = userId
      ? collection(db, 'users', userId, 'predictions')
      : collection(db, 'predictions');
    
    const docRef = await addDoc(predictionsRef, {
      ...prediction,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving prediction:', error);
    throw error;
  }
}

export async function getPredictions(limit_: number = 20): Promise<MatchPrediction[]> {
  try {
    const q = query(
      collection(db, 'predictions'),
      orderBy('createdAt', 'desc'),
      limit(limit_)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      matchId: parseInt(doc.id),
      ...doc.data(),
    } as MatchPrediction));
  } catch (error) {
    console.error('Error getting predictions:', error);
    throw error;
  }
}

// Standings operations
export async function getStandings(season: number = 2024): Promise<any[]> {
  try {
    const q = query(
      collection(db, 'standings'),
      where('season', '==', season),
      orderBy('position', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting standings:', error);
    throw error;
  }
}

export { db, app };
