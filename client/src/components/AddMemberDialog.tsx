import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertFamilyMember, insertFamilyMemberSchema, FamilyMember } from "@/types/schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, UserPlus, Users, Heart, Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";

type RelationshipType = 'parent' | 'child' | 'spouse' | 'none';

const addMemberFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  birthYear: z.string().min(1, "Birth year is required"),
  deathYear: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  bio: z.string(),
  photoUrl: z.string().optional(),
  relationshipType: z.enum(['parent', 'child', 'spouse', 'none'], {
    errorMap: () => ({ message: "Please select a relationship" })
  }),
  relatedToId: z.string().optional(),
});

type AddMemberFormData = z.infer<typeof addMemberFormSchema>;

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: AddMemberFormData) => void;
  onEdit?: (id: string, data: Partial<FamilyMember>) => void;
  existingMembers: FamilyMember[];
  preselectedPersonId?: string;
  editingMember?: FamilyMember | null;
  familySurname?: string;
}

export function AddMemberDialog({ isOpen, onClose, onAdd, onEdit, existingMembers, preselectedPersonId, editingMember, familySurname }: AddMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!editingMember;
  
  const form = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberFormSchema),
    defaultValues: {
      firstName: editingMember?.firstName || (existingMembers.length === 0 ? "You" : ""),
      surname: editingMember?.surname || "",
      birthYear: editingMember?.birthYear || "",
      deathYear: editingMember?.deathYear || "",
      gender: editingMember?.gender || "male",
      bio: editingMember?.bio || "",
      photoUrl: editingMember?.photoUrl || "",
      relationshipType: existingMembers.length === 0 ? 'none' : undefined as any,
      relatedToId: preselectedPersonId || (existingMembers.length > 0 ? existingMembers[0].id : undefined),
    },
  });

  // Update form when preselectedPersonId or editingMember changes
  useEffect(() => {
    if (isOpen) {
      if (editingMember) {
        form.reset({
          firstName: editingMember.firstName,
          surname: editingMember.surname,
          birthYear: editingMember.birthYear || "",
          deathYear: editingMember.deathYear || "",
          gender: editingMember.gender,
          bio: editingMember.bio,
          photoUrl: editingMember.photoUrl || "",
          relationshipType: 'none',
          relatedToId: undefined,
        });
      } else if (preselectedPersonId) {
        form.setValue('relatedToId', preselectedPersonId);
      }
    }
  }, [preselectedPersonId, editingMember, isOpen, form, familySurname]);

  const relationshipType = form.watch('relationshipType');
  const relatedToId = form.watch('relatedToId');
  const gender = form.watch('gender');
  const birthYear = form.watch('birthYear');
  const relatedMember = existingMembers.find(m => m.id === relatedToId);

  // Check if related person already has a father
  const relatedPersonHasFather = relatedMember?.parents?.some(parentId => {
    const parent = existingMembers.find(m => m.id === parentId);
    return parent?.gender === 'male';
  }) ?? false;

  // Auto-set gender based on relationship type
  useEffect(() => {
    if (relationshipType === 'parent') {
      form.setValue('gender', 'male'); // Father
      // Auto-fill father's surname from the child
      if (relatedMember && relatedMember.surname && !isEditMode && existingMembers.length > 0) {
        form.setValue('surname', relatedMember.surname);
      }
    } else if (relationshipType === 'child') {
      // Auto-fill child's surname from the father
      if (relatedMember && relatedMember.surname && !isEditMode) {
        form.setValue('surname', relatedMember.surname);
      }
    } else if (relationshipType === 'spouse') {
      // Set opposite gender of the related person
      if (relatedMember) {
        form.setValue('gender', relatedMember.gender === 'male' ? 'female' : 'male');
      }
      // Don't auto-fill surname for spouses - they need to enter their own
      // This becomes their family surname for their lineage
    }
  }, [relationshipType, relatedMember, form, isEditMode, existingMembers.length]);

  const onSubmit = async (data: AddMemberFormData) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // === UNIVERSAL VALIDATIONS (for both add and edit) ===
    // Validate birth year is not in the future
    if (data.birthYear) {
      const birthYear = parseInt(data.birthYear);
      const currentYear = new Date().getFullYear();
      
      if (birthYear > currentYear) {
        form.setError('birthYear', {
          type: 'manual',
          message: `Birth year cannot be in the future. Current year is ${currentYear}`
        });
        setIsSubmitting(false);
        return;
      }
    }
    
    // === VALIDATION FOR ADDING NEW MEMBERS ===
    if (!isEditMode) {
      // Validate age difference for parent-child relationships
      if (data.relationshipType === 'parent' || data.relationshipType === 'child') {
        const relatedPerson = existingMembers.find(m => m.id === data.relatedToId);
        if (relatedPerson && relatedPerson.birthYear && data.birthYear) {
          const relatedBirthYear = parseInt(relatedPerson.birthYear);
          const newBirthYear = parseInt(data.birthYear);
          
          if (data.relationshipType === 'parent') {
            // Parent should be at least 10 years older than child
            const ageDifference = relatedBirthYear - newBirthYear;
            if (ageDifference < 10) {
              form.setError('birthYear', {
                type: 'manual',
                message: `Parent must be at least 10 years older than ${relatedPerson.name} (born ${relatedBirthYear})`
              });
              setIsSubmitting(false);
              return;
            }
          } else if (data.relationshipType === 'child') {
            // Child should be at least 10 years younger than parent
            const ageDifference = newBirthYear - relatedBirthYear;
            if (ageDifference < 10) {
              form.setError('birthYear', {
                type: 'manual',
                message: `Child must be at least 10 years younger than ${relatedPerson.name} (born ${relatedBirthYear})`
              });
              setIsSubmitting(false);
              return;
            }
          }
        }
      }
      
      // Validate age difference for spouse relationships (they become parents of children)
      if (data.relationshipType === 'spouse') {
        const relatedPerson = existingMembers.find(m => m.id === data.relatedToId);
        if (relatedPerson && data.birthYear) {
          const newBirthYear = parseInt(data.birthYear);
          const currentYear = new Date().getFullYear();
          const minBirthYear = currentYear - 12;
          
          // Spouse must be at least 12 years old
          if (newBirthYear > minBirthYear) {
            form.setError('birthYear', {
              type: 'manual',
              message: `Spouse must be at least 12 years old. Birth year must be ${minBirthYear} or earlier`
            });
            setIsSubmitting(false);
            return;
          }
          
          // Check if related person has children (spouse will become parent)
          if (relatedPerson.children && relatedPerson.children.length > 0) {
            for (const childId of relatedPerson.children) {
              const child = existingMembers.find(m => m.id === childId);
              if (child && child.birthYear) {
                const childBirthYear = parseInt(child.birthYear);
                const ageDifference = childBirthYear - newBirthYear;
                
                if (ageDifference < 10) {
                  form.setError('birthYear', {
                    type: 'manual',
                    message: `${data.gender === 'female' ? 'Wife/Mother' : 'Husband/Father'} must be at least 10 years older than ${child.name} (born ${childBirthYear})`
                  });
                  setIsSubmitting(false);
                  return;
                }
              }
            }
          }
        }
      }
    }
    
    // === VALIDATION FOR EDITING EXISTING MEMBERS ===
    if (isEditMode && editingMember) {
      // Validate age with children (if member has children)
      if (editingMember.children && editingMember.children.length > 0 && data.birthYear) {
        const newBirthYear = parseInt(data.birthYear);
        
        for (const childId of editingMember.children) {
          const child = existingMembers.find(m => m.id === childId);
          if (child && child.birthYear) {
            const childBirthYear = parseInt(child.birthYear);
            const ageDifference = childBirthYear - newBirthYear;
            
            if (ageDifference < 10) {
              form.setError('birthYear', {
                type: 'manual',
                message: `Parent must be at least 10 years older than child ${child.name} (born ${childBirthYear})`
              });
              setIsSubmitting(false);
              return;
            }
          }
        }
      }
      
      // Validate age with parents (if member has parents)
      if (editingMember.parents && editingMember.parents.length > 0 && data.birthYear) {
        const newBirthYear = parseInt(data.birthYear);
        
        for (const parentId of editingMember.parents) {
          const parent = existingMembers.find(m => m.id === parentId);
          if (parent && parent.birthYear) {
            const parentBirthYear = parseInt(parent.birthYear);
            const ageDifference = newBirthYear - parentBirthYear;
            
            if (ageDifference < 10) {
              form.setError('birthYear', {
                type: 'manual',
                message: `Child must be at least 10 years younger than parent ${parent.name} (born ${parentBirthYear})`
              });
              setIsSubmitting(false);
              return;
            }
          }
        }
      }
      
      // Validate age with spouse (if member has spouse)
      if (editingMember.spouseId && data.birthYear) {
        const spouse = existingMembers.find(m => m.id === editingMember.spouseId);
        if (spouse && spouse.birthYear) {
          const spouseBirthYear = parseInt(spouse.birthYear);
          const newBirthYear = parseInt(data.birthYear);
          
          // If this member or their spouse has children, validate both are old enough to be parents
          const childrenIds = [...(editingMember.children || []), ...(spouse.children || [])];
          const uniqueChildrenIds = Array.from(new Set(childrenIds));
          
          for (const childId of uniqueChildrenIds) {
            const child = existingMembers.find(m => m.id === childId);
            if (child && child.birthYear) {
              const childBirthYear = parseInt(child.birthYear);
              const ageDifference = childBirthYear - newBirthYear;
              
              if (ageDifference < 10) {
                form.setError('birthYear', {
                  type: 'manual',
                  message: `Parent must be at least 10 years older than child ${child.name} (born ${childBirthYear})`
                });
                setIsSubmitting(false);
                return;
              }
            }
          }
        }
      }
    }
    
    // Combine firstName and surname into name
    const fullName = `${data.firstName} ${data.surname}`.trim();
    const memberData = { ...data, name: fullName };
    
    if (isEditMode && editingMember && onEdit) {
      // Edit mode - only update basic fields, not relationships
      const { relationshipType, relatedToId, ...editData } = memberData;
      onEdit(editingMember.id, editData);
    } else {
      // Add mode - for the first member, ensure firstName is "You"
      const finalData = existingMembers.length === 0 
        ? { ...memberData, firstName: "You", name: `You ${data.surname}` }
        : memberData;
      onAdd(finalData);
    }
    
    setIsSubmitting(false);
    form.reset({
      firstName: "",
      surname: "",
      gender: "male",
      bio: "",
      birthYear: "",
      deathYear: "",
      photoUrl: "",
      relationshipType: undefined as any,
      relatedToId: existingMembers[0]?.id,
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="glass-panel border-l border-white/10 w-full sm:max-w-md p-0 overflow-hidden">
        <SheetHeader className="pt-6 px-6">
          <SheetTitle>{isEditMode ? "Edit Member" : "Add Member"}</SheetTitle>
          <SheetDescription>
            {isEditMode ? "Update family member details." : "Add a new member to your family tree."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full px-6 pb-6 relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isEditMode && existingMembers.length > 0 && (
                <div className="space-y-4 pb-4 border-b border-white/10">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Relationship
                  </h4>
                  
                  <FormField
                    control={form.control}
                    name="relationshipType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>This person is a...</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-zinc-900/50 border-white/10">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Show 'Father of' only if the member doesn't already have a father */}
                            {!relatedPersonHasFather && (
                              <SelectItem value="parent">Father of</SelectItem>
                            )}
                            {/* Show 'Child of' for males (fathers) */}
                            {relatedMember && relatedMember.gender === 'male' && (
                              <SelectItem value="child">Child of</SelectItem>
                            )}
                            {/* Show 'Spouse' only if there's more than one member (not the first add after login) */}
                            {existingMembers.length > 1 && (
                              <SelectItem value="spouse">
                                {relatedMember?.gender === 'male' ? 'Female spouse' : 'Male spouse'}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relatedToId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {relationshipType === 'parent' && 'Who is his child?'}
                          {relationshipType === 'child' && 'Who is their parent?'}
                          {relationshipType === 'spouse' && (relatedMember?.gender === 'male' ? 'Who is getting married?' : 'Who is getting married?')}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-zinc-900/50 border-white/10">
                              <SelectValue placeholder="Select a person..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {existingMembers.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {relatedMember && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {relationshipType === 'sibling' && `Adding a sibling of ${relatedMember.name}`}
                            {relationshipType === 'parent' && `Adding the father of ${relatedMember.name}`}
                            {relationshipType === 'child' && `Adding a child of ${relatedMember.name}`}
                            {relationshipType === 'spouse' && (relatedMember.gender === 'male' ? `Adding the female spouse of ${relatedMember.name}` : `Adding the male spouse of ${relatedMember.name}`)}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name{existingMembers.length === 0 && ' *'}</FormLabel>
                      <FormControl>
                        <Input placeholder="John" className="bg-zinc-900/50 border-white/10 focus:border-primary/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Surname (Family Name){existingMembers.length === 0 && ' *'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe" 
                          className="bg-zinc-900/50 border-white/10 focus:border-primary/50" 
                          {...field}
                          disabled={!isEditMode && relationshipType !== 'spouse' && relationshipType !== 'none' && existingMembers.length > 0}
                        />
                      </FormControl>
                      {!isEditMode && relationshipType === 'parent' && relatedMember && (
                        <p className="text-xs text-blue-400 mt-1">
                          ℹ️ Father's surname: "{relatedMember.surname}" (family name)
                        </p>
                      )}
                      {!isEditMode && relationshipType === 'child' && relatedMember && (
                        <p className="text-xs text-blue-400 mt-1">
                          ℹ️ Child inherits father's surname: "{relatedMember.surname}"
                        </p>
                      )}
                      {relationshipType === 'spouse' && (
                        <p className="text-xs text-amber-400 mt-1">
                          ℹ️ Enter {gender === 'female' ? 'her maiden name' : 'his surname'} - this becomes the family name for their lineage
                        </p>
                      )}
                      {existingMembers.length === 0 && (
                        <p className="text-xs text-amber-400 mt-1">
                          This will be the family surname for all males
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={relationshipType === 'parent' || relationshipType === 'spouse'}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-zinc-900/50 border-white/10">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {relationshipType === 'parent' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Gender set to Male (Father)
                        </p>
                      )}
                      {relationshipType === 'spouse' && relatedMember && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {relatedMember.gender === 'male' ? 'Wife (Female)' : 'Husband (Male)'}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthYear"
                  render={({ field }) => {
                    // Calculate year range based on relationship type
                    let yearOptions: number[] = [];
                    
                    if (relationshipType === 'child' && relatedMember && relatedMember.birthYear) {
                      // For children, years start from parent's birth year + 10 (minimum age difference)
                      const parentBirthYear = parseInt(relatedMember.birthYear);
                      const startYear = parentBirthYear + 10; // Parent must be at least 10 years older
                      
                      // End year is either parent's death year OR parent's birth year + 80
                      let endYear: number;
                      if (relatedMember.deathYear) {
                        endYear = parseInt(relatedMember.deathYear);
                      } else {
                        endYear = parentBirthYear + 80;
                      }
                      
                      // Generate years from start to end
                      const yearCount = endYear - startYear + 1;
                      yearOptions = Array.from({ length: yearCount }, (_, i) => startYear + i);
                    } else if (existingMembers.length === 0) {
                      // First user must be at least 12 years old
                      const currentYear = new Date().getFullYear();
                      const maxBirthYear = currentYear - 12;
                      yearOptions = Array.from({ length: 150 }, (_, i) => maxBirthYear - i);
                    } else {
                      // Default: show 150 years back from current year
                      yearOptions = Array.from({ length: 150 }, (_, i) => new Date().getFullYear() - i);
                    }
                    
                    return (
                      <FormItem className="flex flex-col">
                        <FormLabel>Birth Year</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="bg-zinc-900/50 border-white/10 justify-between hover:bg-zinc-900/70"
                              >
                                {field.value || "Select year"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandInput placeholder="Search year..." />
                              <CommandList>
                                <CommandEmpty>No year found.</CommandEmpty>
                                <CommandGroup>
                                  {yearOptions.map(year => (
                                    <CommandItem
                                      key={year}
                                      value={year.toString()}
                                      onSelect={() => {
                                        field.onChange(year.toString());
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          field.value === year.toString() ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                      {year}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {existingMembers.length > 0 && (
                  <FormField
                    control={form.control}
                    name="deathYear"
                    render={({ field }) => {
                      // Calculate death year options starting from birth year
                      let deathYearOptions: number[] = [];
                      
                      if (relationshipType === 'parent' && relatedMember && relatedMember.birthYear) {
                        // For fathers, death year must be at least from child's birth year
                        const childBirthYear = parseInt(relatedMember.birthYear);
                        const endYear = new Date().getFullYear();
                        const yearCount = endYear - childBirthYear + 1;
                        deathYearOptions = Array.from({ length: yearCount }, (_, i) => childBirthYear + i);
                      } else if (birthYear) {
                        const startYear = parseInt(birthYear);
                        const endYear = new Date().getFullYear();
                        const yearCount = endYear - startYear + 1;
                        deathYearOptions = Array.from({ length: yearCount }, (_, i) => startYear + i);
                      } else {
                        // If no birth year selected, show default 150 years
                        deathYearOptions = Array.from({ length: 150 }, (_, i) => new Date().getFullYear() - i);
                      }
                      
                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel>Death Year (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="bg-zinc-900/50 border-white/10 justify-between hover:bg-zinc-900/70"
                                >
                                  {field.value || "Still alive"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandInput placeholder="Search year..." />
                                <CommandList>
                                  <CommandEmpty>No year found.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      value=""
                                      onSelect={() => {
                                        field.onChange("");
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          !field.value ? "opacity-100" : "opacity-0"
                                        }`}
                                      />
                                      Still alive
                                    </CommandItem>
                                    {deathYearOptions.map(year => (
                                      <CommandItem
                                        key={year}
                                        value={year.toString()}
                                        onSelect={() => {
                                          field.onChange(year.toString());
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            field.value === year.toString() ? "opacity-100" : "opacity-0"
                                          }`}
                                        />
                                        {year}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell their story..." 
                        className="bg-zinc-900/50 border-white/10 min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-white/10 pb-60">
                <div className="flex flex-col gap-2 w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => form.reset()} 
                    type="button"
                    className="border-white/10 hover:bg-white/5 w-full"
                  >
                    Reset
                  </Button>
                  <Button variant="ghost" onClick={onClose} type="button" className="w-full">Cancel</Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {existingMembers.length === 0 ? 'Start Tree' : isEditMode ? 'Save Changes' : 'Add Member'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
