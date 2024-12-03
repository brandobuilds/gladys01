import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  limit,
  type QueryDocumentSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Reminder } from '../types';

export async function getUserReminders(userId: string): Promise<Reminder[]> {
  try {
    // First check if user has any reminders by querying with limit(1)
    const remindersRef = collection(db, 'reminders');
    const checkQuery = query(
      remindersRef, 
      where('userId', '==', userId),
      limit(1)
    );
    
    const checkSnapshot = await getDocs(checkQuery);
    
    // If no reminders exist, return empty array immediately
    if (checkSnapshot.empty) {
      return [];
    }

    // If reminders exist, fetch all of them
    const fullQuery = query(remindersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(fullQuery);
    
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as Reminder));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      // Return empty array if user doesn't have permission yet
      return [];
    }
    console.error('Error fetching reminders:', error);
    throw error; // Throw the original error for better error handling
  }
}

export async function createReminder(userId: string, reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
  try {
    const remindersRef = collection(db, 'reminders');
    const docRef = await addDoc(remindersRef, {
      ...reminder,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return {
      id: docRef.id,
      ...reminder
    };
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error; // Throw the original error for better error handling
  }
}

export async function updateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
  try {
    const reminderRef = doc(db, 'reminders', id);
    await updateDoc(reminderRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error; // Throw the original error for better error handling
  }
}

export async function deleteReminder(id: string): Promise<void> {
  try {
    const reminderRef = doc(db, 'reminders', id);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error; // Throw the original error for better error handling
  }
}