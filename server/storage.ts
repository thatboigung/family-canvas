import { FamilyMember, InsertFamilyMember } from "@shared/schema";

// This storage is mainly a placeholder for the backend since the app is "Frontend-only".
// However, we can serve the mock data from here if the frontend wanted to fetch it.
// For this prototype, the frontend will likely use its own local mock data as requested.

export interface IStorage {
  getFamilyMembers(): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
}

export class MemStorage implements IStorage {
  private members: Map<string, FamilyMember>;

  constructor() {
    this.members = new Map();
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    return Array.from(this.members.values());
  }

  async createFamilyMember(insertMember: InsertFamilyMember): Promise<FamilyMember> {
    const id = insertMember.id || Math.random().toString(36).substr(2, 9);
    const member: FamilyMember = { 
      ...insertMember, 
      id,
      birthDate: insertMember.birthDate || "", // Ensure required fields
      gender: insertMember.gender || "other",
      bio: insertMember.bio || "",
      parents: insertMember.parents || [],
      spouses: insertMember.spouses || [],
      children: insertMember.children || [],
      photoUrl: insertMember.photoUrl || null,
      deathDate: insertMember.deathDate || null
    };
    this.members.set(id, member);
    return member;
  }
}

export const storage = new MemStorage();
