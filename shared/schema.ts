import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Even though we use mock data, we define the shape here for consistency
// and potential future backend integration.

export const familyMembers = pgTable("family_members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // Full name (computed from firstName + surname)
  firstName: text("first_name").notNull(),
  surname: text("surname").notNull(),
  birthYear: text("birth_year").notNull(),
  deathYear: text("death_year"),
  birthDate: text("birth_date"), // Keep for backward compatibility
  deathDate: text("death_date"), // Keep for backward compatibility
  gender: text("gender").notNull(), // 'male', 'female', 'other'
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  
  // Relations stored as arrays of IDs for the mock prototype
  parents: text("parents").array(),
  spouses: text("spouses").array(),
  children: text("children").array(),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers);

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
