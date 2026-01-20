import { useCallback, useState, useEffect } from 'react';
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
import { Plus, Search, ZoomIn, ZoomOut, Layout, RotateCcw, MousePointer2, Hand } from 'lucide-react';
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
  const [selectedEdge, setSelectedEdge] = useState<{source: FamilyMember, target: FamilyMember, relationship: string, allChildren?: FamilyMember[]} | null>(null);

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
    familySurname
  } = useFamilyTree(handleAddMemberForPerson);
  
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

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    const sourceMember = getMember(edge.source);
    const targetMember = getMember(edge.target);
    
    if (sourceMember && targetMember) {
      // Determine relationship type from edge id or data
      let relationship = 'Connected';
      let allChildren: FamilyMember[] | undefined;
      
      if (edge.id.includes('spouse')) {
        relationship = 'Married';
      } else if (edge.id.includes('sibling')) {
        relationship = 'Siblings';
      } else if (sourceMember.children?.includes(targetMember.id)) {
        // Parent-child relationship: source is parent
        relationship = sourceMember.gender === 'male' ? 'Father - Children' : 'Mother - Children';
        // Get all children of this parent
        allChildren = sourceMember.children
          .map(childId => getMember(childId))
          .filter((child): child is FamilyMember => child !== undefined)
          .sort((a, b) => {
            if (!a.birthYear || !b.birthYear) return 0;
            return parseInt(a.birthYear) - parseInt(b.birthYear);
          });
      } else if (targetMember.children?.includes(sourceMember.id)) {
        // Parent-child relationship: target is parent
        relationship = targetMember.gender === 'male' ? 'Father - Children' : 'Mother - Children';
        // Get all children of this parent
        allChildren = targetMember.children
          .map(childId => getMember(childId))
          .filter((child): child is FamilyMember => child !== undefined)
          .sort((a, b) => {
            if (!a.birthYear || !b.birthYear) return 0;
            return parseInt(a.birthYear) - parseInt(b.birthYear);
          });
        // Swap source and target so parent is always source
        [sourceMember, targetMember] = [targetMember, sourceMember];
      }
      
      setSelectedEdge({ source: sourceMember, target: targetMember, relationship, allChildren });
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

  return (
    <div className="w-full h-screen bg-[#09090b] relative overflow-hidden font-sans">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-10 p-6 pointer-events-none flex flex-col items-center sm:flex-row sm:justify-between sm:items-start">
        <div className="pointer-events-auto w-full sm:w-auto text-center sm:text-left">
          <h1 className="text-lg sm:text-2xl font-bold text-white mb-2 font-display tracking-tight">
            Gavena <span className="text-purple-500">Heritage</span>
          </h1>
        </div>
        {/* Search button under app name for mobile */}
        <div className="w-full flex flex-col items-center sm:hidden mt-2">
          <div className="relative group w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
            </div>
            <Input 
              className="pl-10 w-full glass border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-0 transition-all rounded-full" 
              placeholder="Search lineage..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        {/* Desktop search and add member button */}
        <div className="hidden sm:flex gap-4 pointer-events-auto">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
            </div>
            <Input 
              className="pl-10 w-64 glass border-white/10 text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-0 transition-all rounded-full" 
              placeholder="Search lineage..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-full bg-white text-black hover:bg-white/90 font-semibold shadow-lg shadow-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Member
          </Button>
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
                className={`h-10 w-10 rounded-lg transition-all ${
                  isSelectionMode
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
        {/* Reset Button - Top Right Corner with warning dialog */}
        <div className="absolute top-6 right-6 z-20">
          <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                title="Reset Tree"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Family Tree?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reload the page and any unsaved changes will be lost. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" onClick={() => window.location.reload()}>
                    Yes, Reset
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      {/* Onboarding Hint */}
      {members.length === 1 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto max-w-md">
          <div className="glass border border-primary/20 rounded-2xl p-6 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-2">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white">Start Building Your Family Tree</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Begin from the present and work backwards in time:
              </p>
              <ul className="text-left text-sm text-white/70 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">1.</span>
                  <span>Add your <strong className="text-white">siblings</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">2.</span>
                  <span>Add your <strong className="text-white">parents</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">3.</span>
                  <span>Add your <strong className="text-white">grandparents</strong> (parents of your parents)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">4.</span>
                  <span>Add <strong className="text-white">aunts & uncles</strong> (siblings of your parents)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">5.</span>
                  <span>Add <strong className="text-white">cousins</strong> (children of aunts & uncles)</span>
                </li>
              </ul>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold mt-4 sm:block hidden"
              >
                <Plus className="w-4 h-4 mr-2" /> Add First Family Member
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
        fitView
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
        editingMember={editingMember}        familySurname={familySurname}      />
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
