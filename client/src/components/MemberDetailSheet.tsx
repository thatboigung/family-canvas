import { FamilyMember } from '@/types/schema';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserIcon, HeartIcon, Pencil } from "lucide-react";

interface MemberDetailSheetProps {
  member: FamilyMember | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (member: FamilyMember) => void;
  getMemberName: (id: string) => string | undefined;
}

export function MemberDetailSheet({ member, isOpen, onClose, onEdit, getMemberName }: MemberDetailSheetProps) {
  if (!member) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="glass-panel border-l border-white/10 w-full sm:max-w-md p-0 overflow-hidden">
        {/* Cover Image Effect */}
        <div className="h-32 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 w-full absolute top-0 left-0 z-0" />

        {/* Close Button (X) */}
        <Button
          onClick={onClose}
          size="icon"
          className="absolute top-4 left-4 z-20 glass-panel border border-white/10 hover:border-primary/50 transition-all"
          title="Close"
        >
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>

        {/* Edit Button */}
        {onEdit && (
          <Button
            onClick={() => {
              onEdit(member);
              onClose();
            }}
            size="sm"
            className="absolute top-4 right-4 z-20 glass-panel border border-white/10 hover:border-primary/50 transition-all"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Details
          </Button>
        )}

        <ScrollArea className="h-full pt-20 px-6 pb-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <Avatar className="w-32 h-32 border-4 border-zinc-900 shadow-2xl">
              <AvatarImage src={member.photoUrl || undefined} className="object-cover" />
              <AvatarFallback className="text-4xl bg-zinc-800">
                {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <SheetTitle className="text-3xl font-display font-bold tracking-tight">
                {member.name}
              </SheetTitle>
              <div className="flex items-center justify-center gap-2 text-muted-foreground font-mono text-sm">
                <span>{member.birthYear || 'Unknown'}</span>
                <span>—</span>
                <span>{member.deathYear || 'Present'}</span>
              </div>
              {member.birthYear && (
                <p className="text-xs text-muted-foreground">
                  {member.deathYear 
                    ? `Lived ${parseInt(member.deathYear) - parseInt(member.birthYear)} years`
                    : `Age ${new Date().getFullYear() - parseInt(member.birthYear)} years`
                  }
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white/5 border-white/10 px-3 py-1">
                {member.gender}
              </Badge>
              {member.deathYear && (
                <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                  Deceased
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass p-5 rounded-xl space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Biography
              </h4>
              <p className="text-sm leading-relaxed text-zinc-300">
                {member.bio}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <HeartIcon className="w-4 h-4" /> Relationships
              </h4>
              
              <div className="grid gap-2">
                {member.parents && member.parents.length > 0 && (
                  <div className="bg-zinc-800/30 rounded-lg p-3 border border-white/5">
                    <span className="text-xs text-muted-foreground block mb-2">Parents</span>
                    <div className="flex flex-wrap gap-2">
                      {member.parents.map(pid => (
                        <Badge key={pid} variant="secondary" className="bg-zinc-700/50 hover:bg-zinc-700">
                          {getMemberName(pid)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {member.spouses && member.spouses.length > 0 && (
                  <div className="bg-zinc-800/30 rounded-lg p-3 border border-white/5">
                    <span className="text-xs text-muted-foreground block mb-2">Spouse</span>
                    <div className="flex flex-wrap gap-2">
                      {member.spouses.map(sid => (
                        <Badge key={sid} variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20">
                          {getMemberName(sid)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {member.children && member.children.length > 0 && (
                  <div className="bg-zinc-800/30 rounded-lg p-3 border border-white/5">
                    <span className="text-xs text-muted-foreground block mb-2">Children</span>
                    <div className="flex flex-wrap gap-2">
                      {member.children.map(cid => (
                        <Badge key={cid} variant="secondary" className="bg-blue-500/10 text-blue-300 border-blue-500/20">
                          {getMemberName(cid)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
