import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { initialFamilyMembers, saveToStorage } from '@/lib/mockData';
import { FamilyMember, InsertFamilyMember } from '@/types/schema';
import { Node, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import { buildGraphFromData, getLayoutedElements } from '@/lib/tree-layout';
import { v4 as uuidv4 } from 'uuid';

export function useFamilyTree(onAddMemberForPerson?: (personId: string) => void) {
  const [members, setMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  // Node positions persistence
  const NODE_POS_KEY = 'family-canvas-node-positions';
  const getSavedPositions = () => {
    try {
      return JSON.parse(localStorage.getItem(NODE_POS_KEY) || '{}');
    } catch { return {}; }
  };
  const [nodePositions, setNodePositions] = useState<{ [id: string]: { x: number, y: number } }>(getSavedPositions);
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>();
  const [familySurname, setFamilySurname] = useState<string>('');
  const lastAddedRelatedToRef = useRef<string | undefined>();

  // Save to localStorage whenever members change
  useEffect(() => {
    saveToStorage(members);
  }, [members]);

  // Initialize graph data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildGraphFromData(members, onAddMemberForPerson, selectedMemberId),
    [members, onAddMemberForPerson, selectedMemberId]
  );

  // Apply saved positions to nodes
  const applySavedPositions = (nodes: Node[]) => {
    const saved = getSavedPositions();
    return nodes.map(n => saved[n.id] ? { ...n, position: saved[n.id] } : n);
  };

  // Calculate initial layout, but apply saved positions if available
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const layout = getLayoutedElements(initialNodes, initialEdges);
    return {
      nodes: applySavedPositions(layout.nodes),
      edges: layout.edges
    };
  }, [initialNodes, initialEdges]);

  const [nodes, setNodes, onNodesChangeBase] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Custom onNodesChange to persist positions
  const onNodesChange = (changes: any) => {
    onNodesChangeBase(changes);
    // After changes, update positions in localStorage
    setTimeout(() => {
      setNodePositions(current => {
        const updated = { ...current };
        nodes.forEach(n => {
          updated[n.id] = n.position;
        });
        localStorage.setItem(NODE_POS_KEY, JSON.stringify(updated));
        return updated;
      });
    }, 0);
  };

  // Update nodes and edges when members change
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildGraphFromData(members, onAddMemberForPerson, selectedMemberId);

    // If we have a new member added with relationship context, use the layout engine to position them
    let finalNodes = newNodes;
    if (lastAddedRelatedToRef.current) {
      // Pass the current nodes to get their positions
      const layout = getLayoutedElements(newNodes, newEdges, 'TB', nodes, lastAddedRelatedToRef.current);
      finalNodes = layout.nodes;

      // Persist the new positions immediately so they aren't lost on refresh
      const updatedPositions = getSavedPositions();
      finalNodes.forEach(n => {
        updatedPositions[n.id] = n.position;
      });
      localStorage.setItem(NODE_POS_KEY, JSON.stringify(updatedPositions));
    } else {
      // Otherwise just merge with saved positions as before
      const saved = getSavedPositions();
      finalNodes = newNodes.map(n => saved[n.id] ? { ...n, position: saved[n.id] } : n);
    }

    setNodes(finalNodes);
    setEdges(newEdges);

    // Clear the ref after layout
    lastAddedRelatedToRef.current = undefined;
  }, [members, onAddMemberForPerson, selectedMemberId, setNodes, setEdges]);

  // Re-run layout manually if needed (does not overwrite user positions)
  const refreshLayout = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = buildGraphFromData(members, onAddMemberForPerson, selectedMemberId);
    const saved = getSavedPositions();
    const mergedNodes = newNodes.map(n => saved[n.id] ? { ...n, position: saved[n.id] } : n);
    setNodes(mergedNodes);
    setEdges(newEdges);
  }, [members, onAddMemberForPerson, selectedMemberId, nodes, setNodes, setEdges]);

  // Actions - Now handles relationship-based additions
  const addMember = (data: any) => {
    const newId = `user_${uuidv4().slice(0, 8)}`;

    // Extract relationship info
    const { relationshipType, relatedToId, ...memberData } = data;

    // For the first member, store the family surname
    if (members.length === 0 && memberData.surname) {
      setFamilySurname(memberData.surname);
    }

    // Auto-fill surname for male members if not provided
    if (familySurname && memberData.gender === 'male' && !memberData.surname) {
      memberData.surname = familySurname;
      memberData.name = `${memberData.firstName} ${familySurname}`;
    }

    // Store the relatedToId and relationship type for positioning
    if (relatedToId && relationshipType) {
      lastAddedRelatedToRef.current = { id: relatedToId, type: relationshipType, gender: memberData.gender };
    }

    setMembers((prev) => {
      // Start with the new member with default empty arrays
      let newMember: FamilyMember = {
        ...memberData,
        id: newId,
        parents: [],
        spouses: [],
        children: [],
        photoUrl: memberData.photoUrl ?? null,
        deathYear: memberData.deathYear ?? null,
        // Keep legacy fields for backward compatibility
        birthDate: memberData.birthYear ? `${memberData.birthYear}-01-01` : '',
        deathDate: memberData.deathYear ? `${memberData.deathYear}-01-01` : null,
      };

      let updated = [...prev];

      if (relationshipType && relatedToId) {
        const relatedPerson = prev.find(m => m.id === relatedToId);

        if (relatedPerson) {
          switch (relationshipType) {
            case 'parent':
              // New member is parent (father) of the related person
              // Father should have same surname as the child (family surname)
              const childSurname = relatedPerson.surname;

              newMember = {
                ...newMember,
                surname: childSurname || memberData.surname,
                name: `${memberData.firstName} ${childSurname || memberData.surname}`,
                children: [relatedToId]
              };

              // Update related person to have this parent
              updated = updated.map(m => {
                if (m.id === relatedToId) {
                  return { ...m, parents: [...(m.parents || []), newId] };
                }
                return m;
              });
              break;

            case 'child':
              // New member is child of the related person (only males/fathers can add children now)
              let childParents = [relatedToId];
              let childSurnameToUse = relatedPerson.surname; // Child gets father's surname

              // Update the member's surname
              newMember = {
                ...newMember,
                surname: childSurnameToUse,
                name: `${memberData.firstName} ${childSurnameToUse}`
              };

              // Add spouse if related person has one, as both are parents
              if (relatedPerson.spouses && relatedPerson.spouses.length > 0) {
                childParents.push(relatedPerson.spouses[0]);
                // Update spouse to include new child
                updated = updated.map(m => {
                  if (m.id === relatedPerson.spouses[0]) {
                    return { ...m, children: [...(m.children || []), newId] };
                  }
                  return m;
                });
              }

              newMember = {
                ...newMember,
                parents: childParents
              };

              // Update related person to have this child
              updated = updated.map(m => {
                if (m.id === relatedToId) {
                  return { ...m, children: [...(m.children || []), newId] };
                }
                return m;
              });
              break;

            case 'spouse':
              // New member is spouse of the related person
              newMember = {
                ...newMember,
                spouses: [relatedToId],
                children: [...relatedPerson.children]
              };

              // Update related person to have this spouse
              updated = updated.map(m => {
                if (m.id === relatedToId) {
                  return { ...m, spouses: [...(m.spouses || []), newId] };
                }
                return m;
              });

              // Update children to have both parents
              updated = updated.map(m => {
                if (relatedPerson.children.includes(m.id)) {
                  return { ...m, parents: [...(m.parents || []), newId] };
                }
                return m;
              });
              break;
          }
        }
      }

      // Add the new member after all updates
      return [...updated, newMember];
    });

    // No need for setTimeout - useEffect will handle the refresh
  };

  const updateMember = (id: string, data: Partial<FamilyMember>) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, ...data }
          : m
      )
    );
  };

  const getMember = (id: string) => members.find(m => m.id === id);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    members,
    addMember,
    updateMember,
    getMember,
    refreshLayout,
    setSelectedMemberId,
    familySurname,
    setMembers
  };
}
