import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
  SelectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyNode } from '@/components/FamilyNode';
import { useFamilyTree } from '@/hooks/use-family-tree';
import { MemberDetailSheet } from '@/components/MemberDetailSheet';
import { AddMemberDialog } from '@/components/AddMemberDialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Plus, Search, ZoomIn, ZoomOut, Layout, RotateCcw, MousePointer2, Hand, Settings, User, Info, Heart, Menu, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useLocation } from 'wouter';
import { FamilyMember } from '@/types/schema';

const nodeTypes = {
  family: FamilyNode,
};

function FamilyTreeFlow() {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [preselectedPersonId, setPreselectedPersonId] = useState<string | undefined>(undefined);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<{ source: FamilyMember, target: FamilyMember, relationship: string, allChildren?: FamilyMember[] } | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  // Level and EXP state
  const LEVEL_EXP = [0, 100, 250, 500, 1000, 2000]; // Example exp thresholds for levels 1-5+
  const getInitialLevel = () => Number(localStorage.getItem('fc-level') || '1');
  const getInitialExp = () => Number(localStorage.getItem('fc-exp') || '0');
  const [level, setLevel] = useState(getInitialLevel);
  const [exp, setExp] = useState(getInitialExp);
  // Track completed family units to avoid double-counting
  const [completedFamilies, setCompletedFamilies] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fc-completedFamilies') || '[]');
    } catch { return []; }
  });
  // Popup for level up
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [justReachedLevel, setJustReachedLevel] = useState<number | null>(null);
  const prevLevelRef = useRef(level);

  const handleAddMemberForPerson = useCallback((personId: string) => {
    setPreselectedPersonId(personId);
    setIsAddDialogOpen(true);
  }, []);

  const handleCloseAddDialog = useCallback(() => {
    setIsAddDialogOpen(false);
    setPreselectedPersonId(undefined);
    setEditingMember(null);
  }, []);

  const handleEditMember = useCallback((member: FamilyMember) => {
    setEditingMember(member);
    setIsAddDialogOpen(true);
  }, []);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addMember,
    updateMember,
    members,
    getMember,
    refreshLayout,
    setSelectedMemberId,
    familySurname,
    setMembers
  } = useFamilyTree(handleAddMemberForPerson);
  // Reset handler: clear localStorage and reset members, level, exp
  const handleReset = () => {
    localStorage.removeItem('family-canvas-data');
    localStorage.removeItem('fc-level');
    localStorage.removeItem('fc-exp');
    localStorage.removeItem('fc-completedFamilies');
    setMembers([]);
    setLevel(1);
    setExp(0);
    setCompletedFamilies([]);
    setShowResetDialog(false);
  };
  // Save level/exp/completedFamilies to localStorage
  useEffect(() => {
    localStorage.setItem('fc-level', String(level));
    localStorage.setItem('fc-exp', String(exp));
    localStorage.setItem('fc-completedFamilies', JSON.stringify(completedFamilies));
  }, [level, exp, completedFamilies]);

  // Detect new full family units and award exp
  useEffect(() => {
    // Find all unique family units (mom, dad, child)
    // A family unit is a child with both parents present (one male, one female)
    const newCompleted: string[] = [];
    members.forEach(child => {
      if (!child.parents || child.parents.length < 2) return;
      const [p1, p2] = child.parents;
      const parent1 = members.find(m => m.id === p1);
      const parent2 = members.find(m => m.id === p2);
      if (!parent1 || !parent2) return;
      // One must be male, one female
      const genders = [parent1.gender, parent2.gender];
      if (genders.includes('male') && genders.includes('female')) {
        // Use a unique key for this family unit
        const famKey = [parent1.id, parent2.id, child.id].sort().join('-');
        if (!completedFamilies.includes(famKey) && !newCompleted.includes(famKey)) {
          newCompleted.push(famKey);
        }
      }
    });
    if (newCompleted.length > 0) {
      // Award exp for each new family unit
      const expPerFamily = 100;
      const totalExp = exp + newCompleted.length * expPerFamily;
      // Level up logic
      let newLevel = level;
      let newExp = totalExp;
      let leveledUp = false;
      while (newLevel < LEVEL_EXP.length && newExp >= LEVEL_EXP[newLevel]) {
        newLevel++;
        leveledUp = true;
      }
      setExp(newExp);
      setLevel(newLevel);
      setCompletedFamilies([...completedFamilies, ...newCompleted]);
      if (leveledUp) {
        setJustReachedLevel(newLevel);
        setShowLevelUp(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  // Detect level up from other exp changes (e.g. on reload)
  useEffect(() => {
    if (level > prevLevelRef.current) {
      setJustReachedLevel(level);
      setShowLevelUp(true);
    }
    prevLevelRef.current = level;
  }, [level]);
  {/* Level Up Popup */ }
  {
    showLevelUp && justReachedLevel && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full flex flex-col items-center animate-fade-in">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-xl font-bold text-primary mb-2">Congratulations!</h2>
          <p className="text-center text-gray-700 mb-4">You've reached <span className="font-bold text-purple-600">Level {justReachedLevel}</span>!</p>
          <Button className="w-full mt-2" onClick={() => setShowLevelUp(false)}>Awesome!</Button>
        </div>
      </div>
    )
  }

  const reactFlowInstance = useReactFlow();
  const { fitView, zoomIn, zoomOut, setCenter } = reactFlowInstance || {};

  // Auto-open dialog when app starts with no members
  useEffect(() => {
    if (members.length === 0 && !isAddDialogOpen) {
      setIsAddDialogOpen(true);
    }
  }, [members.length, isAddDialogOpen]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const member = getMember(node.id);
    if (member) {
      setSelectedMember(member);
      setSelectedMemberId(node.id);
    }
  }, [getMember, setSelectedMemberId]);

  // Helper to determine specific relationship
  function getSpecificRelationship(source: FamilyMember, target: FamilyMember): string {
    if (source.id === target.id) return 'Self';
    // Direct parent/child
    if (source.children?.includes(target.id)) return source.gender === 'male' ? 'Father' : source.gender === 'female' ? 'Mother' : 'Parent';
    if (target.children?.includes(source.id)) return target.gender === 'male' ? 'Father' : target.gender === 'female' ? 'Mother' : 'Parent';
    if (source.parents && target.parents && source.parents.some(pid => target.parents?.includes(pid))) {
      // Siblings
      return 'Sibling';
    }
    // Grandparent/grandchild
    const sourceParents = source.parents || [];
    const targetParents = target.parents || [];
    const sourceGrandparents = sourceParents.flatMap(pid => getMember(pid)?.parents || []);
    const targetGrandparents = targetParents.flatMap(pid => getMember(pid)?.parents || []);
    if (sourceGrandparents.some(gpid => target.parents?.includes(gpid))) {
      // Source is uncle/aunt of target
      return source.gender === 'male' ? 'Uncle' : source.gender === 'female' ? 'Aunt' : 'Uncle/Aunt';
    }
    if (targetGrandparents.some(gpid => source.parents?.includes(gpid))) {
      // Target is uncle/aunt of source
      return target.gender === 'male' ? 'Uncle' : target.gender === 'female' ? 'Aunt' : 'Uncle/Aunt';
    }
    if (sourceParents.some(pid => targetGrandparents.includes(pid))) {
      // Source is cousin of target
      return 'Cousin';
    }
    if (targetParents.some(pid => sourceGrandparents.includes(pid))) {
      // Target is cousin of source
      return 'Cousin';
    }
    // Grandparent
    if (source.children?.some(cid => getMember(cid)?.children?.includes(target.id))) {
      return source.gender === 'male' ? 'Grandfather' : source.gender === 'female' ? 'Grandmother' : 'Grandparent';
    }
    if (target.children?.some(cid => getMember(cid)?.children?.includes(source.id))) {
      return target.gender === 'male' ? 'Grandfather' : target.gender === 'female' ? 'Grandmother' : 'Grandparent';
    }
    // Great-grandparent
    if (source.children?.some(cid => getMember(cid)?.children?.some(ccid => getMember(ccid)?.children?.includes(target.id)))) {
      return source.gender === 'male' ? 'Great Grandfather' : source.gender === 'female' ? 'Great Grandmother' : 'Great Grandparent';
    }
    if (target.children?.some(cid => getMember(cid)?.children?.some(ccid => getMember(ccid)?.children?.includes(source.id)))) {
      return target.gender === 'male' ? 'Great Grandfather' : target.gender === 'female' ? 'Great Grandmother' : 'Great Grandparent';
    }
    // Nephew/Niece
    if (source.parents && target.children && source.parents.some(pid => target.children?.includes(pid))) {
      return source.gender === 'male' ? 'Nephew' : source.gender === 'female' ? 'Niece' : 'Nephew/Niece';
    }
    if (target.parents && source.children && target.parents.some(pid => source.children?.includes(pid))) {
      return target.gender === 'male' ? 'Nephew' : target.gender === 'female' ? 'Niece' : 'Nephew/Niece';
    }
    // Spouse
    if (source.spouses?.includes(target.id)) return source.gender === 'male' ? 'Husband' : source.gender === 'female' ? 'Wife' : 'Spouse';
    if (target.spouses?.includes(source.id)) return target.gender === 'male' ? 'Husband' : target.gender === 'female' ? 'Wife' : 'Spouse';
    return 'Related';
  }

  // Helper to show relationship/details modal for two nodes
  const showRelationshipDetails = (sourceId: string, targetId: string, edgeId?: string) => {
    let sourceMember = getMember(sourceId);
    let targetMember = getMember(targetId);
    if (sourceMember && targetMember) {
      let relationship = 'Related';
      let allChildren: FamilyMember[] | undefined;
      const edgeIdStr = edgeId || '';
      if (edgeIdStr.includes('spouse')) {
        relationship = 'Married';
      } else if (edgeIdStr.includes('sibling')) {
        relationship = 'Siblings';
      } else if (sourceMember.children?.includes(targetMember.id)) {
        relationship = sourceMember.gender === 'male' ? 'Father - Children' : 'Mother - Children';
        allChildren = sourceMember.children
          .map(childId => getMember(childId))
          .filter((child): child is FamilyMember => child !== undefined)
          .sort((a, b) => {
            if (!a.birthYear || !b.birthYear) return 0;
            return parseInt(a.birthYear) - parseInt(b.birthYear);
          });
      } else if (targetMember.children?.includes(sourceMember.id)) {
        relationship = targetMember.gender === 'male' ? 'Father - Children' : 'Mother - Children';
        allChildren = targetMember.children
          .map(childId => getMember(childId))
          .filter((child): child is FamilyMember => child !== undefined)
          .sort((a, b) => {
            if (!a.birthYear || !b.birthYear) return 0;
            return parseInt(a.birthYear) - parseInt(b.birthYear);
          });
        // Swap source and target so parent is always source
        [sourceMember, targetMember] = [targetMember, sourceMember];
      } else {
        // Use specific relationship logic for all other cases
        relationship = getSpecificRelationship(sourceMember, targetMember);
      }
      setSelectedEdge({ source: sourceMember, target: targetMember, relationship, allChildren });
    }
  };

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    showRelationshipDetails(edge.source, edge.target, edge.id);
  }, [getMember, members]);

  // Show relationship/details when a new connection is made
  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      showRelationshipDetails(connection.source, connection.target);
    }
  }, [getMember, members]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query || !setCenter) return;

    const foundNode = nodes.find(n =>
      n.data.name && String(n.data.name).toLowerCase().includes(query.toLowerCase())
    );

    if (foundNode) {
      setCenter(foundNode.position.x + 140, foundNode.position.y + 60, { zoom: 1.2, duration: 800 });
      // Optional: Select the node visually
      // This would require managing selection state in the hook
    }
  };

  const [, setLocation] = useLocation();

  return (
    <div className="w-full h-screen bg-[#09090b] relative overflow-hidden font-sans">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 pointer-events-none flex flex-row items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white font-display tracking-tight cursor-pointer" onClick={() => setLocation('/')}>
            Gavena <span className="text-purple-500">Heritage</span>
          </h1>

          {/* Desktop Level and EXP display */}
          <div className="hidden lg:flex flex-col items-start ml-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Level</span>
              <span className="text-xs font-bold text-primary">{level}</span>
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden mx-1">
                <div className="h-full bg-purple-500 transition-all shadow-[0_0_8px_rgba(168,85,247,0.5)]" style={{ width: `${Math.min(100, ((exp - LEVEL_EXP[level - 1]) / (LEVEL_EXP[level] - LEVEL_EXP[level - 1] || 100)) * 100)}%` }} />
              </div>
              <span className="text-[10px] text-white/30 font-mono italic">{exp}xp</span>
            </div>
          </div>
        </div>

        {/* Global actions area */}
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
          {/* Desktop Only Search & Controls */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                className="pl-10 w-48 lg:w-64 glass border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-0 transition-all rounded-full h-9"
                placeholder="Search lineage..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              className="rounded-full bg-white text-black hover:bg-white/90 font-semibold shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95 h-9"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Member
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setTutorialStep(0); setShowTutorial(true); }}
              className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
              title="Help & Tutorial"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white min-w-[200px] backdrop-blur-xl">
                <DropdownMenuLabel className="flex items-start flex-col py-3 px-4">
                  <span className="text-[10px] uppercase text-white/40 mb-1">Session Progress</span>
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs font-bold text-primary">Lv.{level}</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, ((exp - LEVEL_EXP[level - 1]) / (LEVEL_EXP[level] - LEVEL_EXP[level - 1] || 100)) * 100)}%` }} />
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={() => setLocation('/settings')} className="hover:bg-white/10 cursor-pointer flex items-center gap-3 py-2.5">
                  <User className="w-4 h-4 text-white/40" />
                  <span>Profile & Security</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/settings')} className="hover:bg-white/10 cursor-pointer flex items-center gap-3 py-2.5">
                  <Info className="w-4 h-4 text-white/40" />
                  <span>About Havena</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/settings')} className="hover:bg-white/10 cursor-pointer flex items-center gap-3 py-2.5">
                  <Heart className="w-4 h-4 text-white/40" />
                  <span>Support Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={() => setShowResetDialog(true)} className="text-red-400 hover:bg-red-500/10 focus:text-red-400 cursor-pointer flex items-center gap-3 py-2.5">
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Archive</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Actions Menu (Dropdown for everything) */}
          <div className="flex sm:hidden items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="glass h-10 w-10 text-white rounded-full border-white/10 shadow-xl">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[85vw] max-w-[320px] bg-zinc-950/95 border-white/10 text-white backdrop-blur-2xl p-2 rounded-2xl mt-2">
                <div className="px-3 py-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-white/40 font-bold tracking-[0.1em]">Current Mastery</span>
                      <span className="text-sm font-bold text-white">Sage Level <span className="text-primary">{level}</span></span>
                    </div>
                    <span className="text-[10px] font-mono text-white/30 italic">{exp} / {LEVEL_EXP[level] || 'MAX'} XP</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" style={{ width: `${Math.min(100, ((exp - LEVEL_EXP[level - 1]) / (LEVEL_EXP[level] - LEVEL_EXP[level - 1] || 100)) * 100)}%` }} />
                  </div>
                </div>

                <div className="px-2 pb-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                      className="pl-10 w-full glass border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-0 transition-all rounded-xl h-12"
                      placeholder="Search ancestors..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button
                    onClick={() => { setIsAddDialogOpen(true); }}
                    className="flex flex-col items-center justify-center gap-2 h-20 bg-white text-black hover:bg-white/90 rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">Add New</span>
                  </Button>
                  <Button
                    onClick={() => { setTutorialStep(0); setShowTutorial(true); }}
                    className="flex flex-col items-center justify-center gap-2 h-20 bg-[#a855f7] text-white hover:bg-[#9333ea] rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tutorial</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 mb-2">
                  <Button
                    onClick={() => setLocation('/settings')}
                    variant="ghost"
                    className="flex items-center justify-center gap-3 h-14 glass border-white/5 rounded-xl text-white/70 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
                  </Button>
                </div>

                <DropdownMenuSeparator className="bg-white/5 mx-2" />

                <DropdownMenuItem onClick={() => setShowResetDialog(true)} className="flex items-center gap-3 py-4 px-4 text-red-400 focus:bg-red-400/10 focus:text-red-400 rounded-xl">
                  <RotateCcw className="w-4 h-4" />
                  <span className="font-semibold text-sm">Reset Tree Data</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reset Confirmation Dialog keeps using existing AlertDialog - we keep it at top level if needed, or inside dropdown */}
          <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <AlertDialogContent className="bg-zinc-950/95 border-white/10 backdrop-blur-2xl rounded-3xl max-w-[90vw] sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white text-xl">Reset Family Archive?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/60">
                  This action cannot be undone. All ancestral records, relationships, and history will be permanently erased.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex gap-2">
                <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-xl flex-1 h-12">Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" onClick={handleReset} className="bg-red-500 hover:bg-red-600 border-none rounded-xl flex-1 h-12 font-bold shadow-lg shadow-red-500/10">
                    Wipe Archive
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Floating Controls Overlay - Bottom Left as Tools Menu */}
      <div className="absolute bottom-8 left-8 z-10 flex gap-2 pointer-events-auto">
        <div className="glass p-1.5 rounded-xl flex flex-col gap-1 shadow-2xl border border-white/5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setToolsMenuOpen((open) => !open)}
            className="h-10 w-10 rounded-lg transition-all text-white/70 hover:text-white hover:bg-white/10"
            title="Show Tools Menu"
          >
            <Layout className="h-5 w-5" />
          </Button>
          {toolsMenuOpen && (
            <div className="flex flex-col gap-1 mt-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className={`h-10 w-10 rounded-lg transition-all ${isSelectionMode
                  ? 'bg-primary/20 text-primary hover:bg-primary/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                title={isSelectionMode ? 'Switch to Pan Mode' : 'Switch to Selection Mode'}
              >
                {isSelectionMode ? <MousePointer2 className="h-5 w-5" /> : <Hand className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => zoomIn?.()} className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => zoomOut?.()} className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => fitView?.({ duration: 800 })} className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                <Layout className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Hint */}
      {members.length === 1 && (
        <div className="absolute inset-0 z-50 pointer-events-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md h-full sm:h-auto overflow-y-auto">
          <div className="glass border-0 sm:border border-primary/20 rounded-none sm:rounded-2xl p-8 sm:p-6 shadow-2xl min-h-full sm:min-h-0 flex flex-col justify-center items-center bg-[#09090b]/90 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none">
            <div className="text-center space-y-6 sm:space-y-4 max-w-sm mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-primary/10 border border-primary/20 mb-2">
                <Plus className="w-10 h-10 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-2xl sm:text-xl font-bold text-white tracking-tight leading-tight">Start Building Your Family Tree</h3>
              <p className="text-white/60 text-base sm:text-sm leading-relaxed">
                Begin from the present and work backwards in time:
              </p>
              <ul className="text-left text-base sm:text-sm text-white/70 space-y-3 sm:space-y-2 py-4 sm:py-0">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1 sm:mt-0.5">1.</span>
                  <span>Add your <strong className="text-white">siblings</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1 sm:mt-0.5">2.</span>
                  <span>Add your <strong className="text-white">parents</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1 sm:mt-0.5">3.</span>
                  <span>Add your <strong className="text-white">grandparents</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1 sm:mt-0.5">4.</span>
                  <span>Add <strong className="text-white">aunts & uncles</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1 sm:mt-0.5">5.</span>
                  <span>Add <strong className="text-white">cousins</strong></span>
                </li>
              </ul>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 sm:h-10 text-lg sm:text-sm shadow-xl shadow-primary/20 group"
              >
                <Plus className="w-5 h-5 sm:w-4 sm:h-4 mr-2 group-hover:scale-110 transition-transform" /> Add First Family Member
              </Button>
            </div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ maxZoom: 0.5, padding: 0.1 }}
        className="bg-[#09090b]"
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        panOnDrag={!isSelectionMode}
        selectionOnDrag={isSelectionMode}
        selectionMode={isSelectionMode ? 'partial' : undefined}
        multiSelectionKeyCode={isSelectionMode ? null : 'Control'}
      >
        <Background color="#ffffff" gap={30} size={1} style={{ opacity: 0.05 }} />
        {/* Custom Controls component is built manually above for styling */}
      </ReactFlow>

      {/* Details Sheet */}
      <MemberDetailSheet
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => {
          setSelectedMember(null);
          setSelectedMemberId(undefined);
        }}
        onEdit={handleEditMember}
        getMemberName={(id) => getMember(id)?.name}
      />

      {/* Relationship Dialog */}
      {selectedEdge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedEdge(null)}>
          <div className="glass border border-white/10 rounded-2xl p-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-4">Relationship Details</h3>

            {/* Show all children for parent-child relationships */}
            {selectedEdge.allChildren && selectedEdge.allChildren.length > 0 ? (
              <div className="space-y-4">
                {/* Parent Info */}
                <div className="glass border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-white/60 mb-2">Parent</p>
                  <p className="text-white font-semibold text-lg">{selectedEdge.source.name}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {selectedEdge.source.birthYear ?
                      (selectedEdge.source.deathYear ?
                        `${selectedEdge.source.birthYear} - ${selectedEdge.source.deathYear}` :
                        `Born ${selectedEdge.source.birthYear} (Age: ${new Date().getFullYear() - parseInt(selectedEdge.source.birthYear)})`) :
                      'Birth year unknown'}
                  </p>
                  <p className="text-sm text-primary mt-2">{selectedEdge.relationship}</p>
                </div>

                {/* All Children */}
                <div className="space-y-2">
                  <p className="text-sm text-white/60 font-semibold">All Children ({selectedEdge.allChildren.length})</p>
                  {selectedEdge.allChildren.map((child, index) => {
                    const ageDiff = selectedEdge.source.birthYear && child.birthYear ?
                      parseInt(child.birthYear) - parseInt(selectedEdge.source.birthYear) : null;
                    const childAge = child.birthYear ?
                      (child.deathYear ?
                        parseInt(child.deathYear) - parseInt(child.birthYear) :
                        new Date().getFullYear() - parseInt(child.birthYear)) : null;

                    return (
                      <div key={child.id} className="glass border border-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium">{index + 1}. {child.name}</p>
                            <p className="text-xs text-white/40 mt-0.5">
                              {child.birthYear ?
                                (child.deathYear ?
                                  `${child.birthYear} - ${child.deathYear} (lived ${parseInt(child.deathYear) - parseInt(child.birthYear)} years)` :
                                  `Born ${child.birthYear} (Age: ${childAge})`) :
                                'Birth year unknown'}
                            </p>
                          </div>
                          {ageDiff && (
                            <div className="text-right ml-4">
                              <p className="text-primary font-semibold">{ageDiff} years</p>
                              <p className="text-xs text-white/40">age diff</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Age differences between siblings */}
                {selectedEdge.allChildren.length > 1 && (
                  <div className="glass border border-amber-500/20 rounded-lg p-4">
                    <p className="text-sm text-amber-400 font-semibold mb-2">Age Gaps Between Siblings</p>
                    <div className="space-y-1">
                      {selectedEdge.allChildren.map((child, index) => {
                        if (index === selectedEdge.allChildren!.length - 1) return null;
                        const nextChild = selectedEdge.allChildren![index + 1];
                        const gap = child.birthYear && nextChild.birthYear ?
                          parseInt(nextChild.birthYear) - parseInt(child.birthYear) : null;

                        return gap ? (
                          <p key={`gap-${index}`} className="text-xs text-white/60">
                            {child.name.split(' ')[0]} → {nextChild.name.split(' ')[0]}: <span className="text-white font-medium">{gap} years</span>
                          </p>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Regular relationship view for non-parent-child */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-sm text-white/60 mb-1">Member 1</p>
                    <p className="text-white font-semibold">{selectedEdge.source.name}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {selectedEdge.source.birthYear ?
                        (selectedEdge.source.deathYear ?
                          `${selectedEdge.source.birthYear} - ${selectedEdge.source.deathYear}` :
                          `Born ${selectedEdge.source.birthYear} (Age: ${new Date().getFullYear() - parseInt(selectedEdge.source.birthYear)})`) :
                        'Birth year unknown'}
                    </p>
                  </div>
                  <div className="px-4">
                    <div className="w-12 h-0.5 bg-primary"></div>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-sm text-white/60 mb-1">Member 2</p>
                    <p className="text-white font-semibold">{selectedEdge.target.name}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {selectedEdge.target.birthYear ?
                        (selectedEdge.target.deathYear ?
                          `${selectedEdge.target.birthYear} - ${selectedEdge.target.deathYear}` :
                          `Born ${selectedEdge.target.birthYear} (Age: ${new Date().getFullYear() - parseInt(selectedEdge.target.birthYear)})`) :
                        'Birth year unknown'}
                    </p>
                  </div>
                </div>

                <div className="glass border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-white/60 mb-1">Relationship</p>
                  <p className="text-lg font-semibold text-primary">{selectedEdge.relationship}</p>
                </div>

                {selectedEdge.source.birthYear && selectedEdge.target.birthYear && (
                  <div className="glass border border-white/10 rounded-lg p-4 text-center">
                    <p className="text-sm text-white/60 mb-1">Age Difference</p>
                    <p className="text-lg font-semibold text-white">
                      {Math.abs(parseInt(selectedEdge.source.birthYear) - parseInt(selectedEdge.target.birthYear))} years
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {parseInt(selectedEdge.source.birthYear) < parseInt(selectedEdge.target.birthYear) ?
                        `${selectedEdge.source.name.split(' ')[0]} is older` :
                        `${selectedEdge.target.name.split(' ')[0]} is older`}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={() => setSelectedEdge(null)}
              className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Add Member Dialog */}
      <AddMemberDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        onAdd={addMember}
        onEdit={updateMember}
        existingMembers={members}
        preselectedPersonId={preselectedPersonId}
        editingMember={editingMember} familySurname={familySurname} />
      {/* Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="bg-zinc-950/95 border-white/10 backdrop-blur-2xl rounded-[2rem] max-w-[90vw] sm:max-w-md p-8 overflow-hidden border-none shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

          <DialogHeader className="items-center text-center">
            <div className="p-4 rounded-full bg-white/5 mb-2 ring-1 ring-white/10 shadow-inner group transition-all hover:scale-110">
              {tutorialStep === 0 && <Layout className="w-10 h-10 text-purple-500" />}
              {tutorialStep === 1 && <Hand className="w-10 h-10 text-blue-500" />}
              {tutorialStep === 2 && <Plus className="w-10 h-10 text-green-500" />}
              {tutorialStep === 3 && <Heart className="w-10 h-10 text-red-500" />}
            </div>
            <DialogTitle className="text-2xl font-bold text-white font-display mb-2">
              {tutorialStep === 0 && "Welcome to Gavena Heritage"}
              {tutorialStep === 1 && "Navigating the Archive"}
              {tutorialStep === 2 && "Expanding Your Tree"}
              {tutorialStep === 3 && "Ancestral Mastery"}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-base leading-relaxed">
              {tutorialStep === 0 && "Your journey into the past begins here. This is your living family archive where you can document generations of lineage and heritage."}
              {tutorialStep === 1 && "Use your mouse or touch to pan across the tree. Use the zoom controls or your scroll wheel to adjust the view of your lineage."}
              {tutorialStep === 2 && "Click 'Add Member' to start building. Click on any ancestor to view their biography, add relatives, or edit their details."}
              {tutorialStep === 3 && "Every detail you add earns you Experience (EXP). Watch your Sage Level grow as you uncover more of your family's history."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-1.5 mt-8 mb-4">
            {[0, 1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all duration-300 ${s === tutorialStep ? "w-8 bg-purple-500" : "w-2 bg-white/10"}`}
              />
            ))}
          </div>

          <DialogFooter className="sm:justify-between flex-row items-center gap-4 mt-4">
            <Button
              variant="ghost"
              onClick={() => setTutorialStep(prev => Math.max(0, prev - 1))}
              disabled={tutorialStep === 0}
              className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl h-12 px-6 disabled:opacity-0"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Back
            </Button>

            {tutorialStep < 3 ? (
              <Button
                onClick={() => setTutorialStep(prev => prev + 1)}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-purple-500/20"
              >
                Next <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowTutorial(false)}
                className="bg-white text-black hover:bg-white/90 rounded-xl h-12 px-8 font-bold shadow-lg shadow-white/10 transition-all hover:scale-105"
              >
                Get Started
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FamilyTreePage() {
  return (
    <ReactFlowProvider>
      <FamilyTreeFlow />
    </ReactFlowProvider>
  );
}
