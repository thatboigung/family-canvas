import { z } from "zod";

// Family Member Type Definition
export interface FamilyMember {
  id: string;
  name: string; // Full name (computed from firstName + surname)
  firstName: string;
  surname: string;
  birthYear: string;
  deathYear?: string | null;
  birthDate?: string; // Keep for backward compatibility
  deathDate?: string | null; // Keep for backward compatibility
  gender: string; // 'male', 'female', 'other'
  bio: string;
  photoUrl?: string | null;
  
  // Relations stored as arrays of IDs
  parents?: string[];
  spouses?: string[];
  children?: string[];
}

// Zod schema for validation
export const insertFamilyMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  firstName: z.string(),
  surname: z.string(),
  birthYear: z.string(),
  deathYear: z.string().optional().nullable(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional().nullable(),
  gender: z.string(),
  bio: z.string(),
  photoUrl: z.string().optional().nullable(),
  parents: z.array(z.string()).optional(),
  spouses: z.array(z.string()).optional(),
  children: z.array(z.string()).optional(),
});

export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
