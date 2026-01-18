import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FamilyMember } from '@/types/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UserPlus } from 'lucide-react';

interface FamilyNodeData extends FamilyMember {
  onAddMember?: (personId: string) => void;
}

// Custom Node Component for React Flow
export const FamilyNode = memo(({ data, selected }: NodeProps<FamilyNodeData>) => {
  const birthYear = data.birthYear || (data.birthDate ? new Date(data.birthDate).getFullYear() : '?');
  const deathYear = data.deathYear || (data.deathDate ? new Date(data.deathDate).getFullYear() : '');
  const isDeceased = !!data.deathYear || !!data.deathDate;

  return (
    <div className={cn(
      "glass p-4 rounded-2xl min-w-[280px] transition-all duration-300 group relative",
      selected ? "ring-2 ring-primary border-primary/50 shadow-[0_0_30px_rgba(124,58,237,0.3)]" : "hover:border-white/20 hover:bg-white/10"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3 !-top-1.5" />
      
      {/* Add Member Button */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            data.onAddMember?.(data.id);
          }}
          className="h-7 px-2 bg-primary hover:bg-primary/90 text-white shadow-lg text-xs rounded-full"
        >
          <UserPlus className="w-3 h-3 mr-1" />
          Add Member
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className={cn(
            "w-16 h-16 border-2 border-white/10 shadow-lg transition-transform duration-300 group-hover:scale-105",
            isDeceased && "grayscale opacity-80"
          )}>
            <AvatarImage src={data.photoUrl || undefined} alt={data.name} className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
              {data.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {isDeceased && (
            <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded-full border border-white/10">
              RIP
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="font-display font-bold text-lg leading-tight text-white group-hover:text-primary-foreground transition-colors">
            {data.name}
          </h3>
          <span className="text-xs font-mono text-white/50 mt-1 bg-white/5 px-2 py-0.5 rounded-md w-fit">
            {birthYear} — {deathYear || 'Present'}
          </span>
          <span className="text-[10px] text-white/30 uppercase tracking-wider mt-1.5 font-medium">
            {data.gender}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-3 !h-3 !-bottom-1.5" />
    </div>
  );
});
