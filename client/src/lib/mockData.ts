import { FamilyMember } from "@/types/schema";

const STORAGE_KEY = 'family-canvas-data';

// Load initial data from localStorage or use empty array
const loadFromStorage = (): FamilyMember[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return [];
};

// Save data to localStorage
export const saveToStorage = (members: FamilyMember[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Starting from the present: The user begins their tree with themselves
export const initialFamilyMembers: FamilyMember[] = loadFromStorage();
