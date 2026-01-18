import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { FamilyMember } from '@/types/schema';

// Configuration constants for the layout
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const RANK_SEPARATION = 120;
const NODE_SEPARATION = 100;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB', existingNodes?: Node[], newNodeRelatedInfo?: { id: string; type: string; gender?: string } | string) => {
  // Support both old string format and new object format
  const newNodeRelatedTo = typeof newNodeRelatedInfo === 'string' ? newNodeRelatedInfo : newNodeRelatedInfo?.id;
  const relationshipType = typeof newNodeRelatedInfo === 'object' ? newNodeRelatedInfo.type : undefined;
  const newMemberGender = typeof newNodeRelatedInfo === 'object' ? newNodeRelatedInfo.gender : undefined;
  
  // If we have existing nodes, preserve their positions
  const existingPositions = new Map<string, { x: number; y: number }>();
  if (existingNodes) {
    existingNodes.forEach(node => {
      existingPositions.set(node.id, node.position);
    });
  }

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: NODE_SEPARATION,
    ranksep: RANK_SEPARATION,
    marginx: 50,
    marginy: 50
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    // If this node already existed, keep its position
    if (existingPositions.has(node.id)) {
      return {
        ...node,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: existingPositions.get(node.id)!,
      };
    }
    
    // For new nodes, position them near the related person if specified
    if (newNodeRelatedTo && existingPositions.has(newNodeRelatedTo)) {
      const relatedPosition = existingPositions.get(newNodeRelatedTo)!;
      
      let offsetX = 0;
      let offsetY = 0;
      
      // Position based on relationship type
      if (relationshipType === 'parent') {
        // Father goes on top of the child (directly above)
        offsetX = 0;
        offsetY = -(RANK_SEPARATION + NODE_HEIGHT);
      } else if (relationshipType === 'spouse') {
        // Mother/spouse goes to the right and slightly top
        offsetX = NODE_WIDTH + NODE_SEPARATION;
        offsetY = -30; // Slightly up
      } else if (relationshipType === 'child') {
        // Check if parent already has other children to position to the side
        const relatedNode = nodes.find(n => n.id === newNodeRelatedTo);
        const parentData = relatedNode?.data as any;
        const existingChildrenCount = parentData?.children?.filter((childId: string) => 
          existingPositions.has(childId)
        ).length || 0;
        
        // If there are existing children, position to the side
        if (existingChildrenCount > 0) {
          offsetX = existingChildrenCount * (NODE_WIDTH + NODE_SEPARATION);
          offsetY = RANK_SEPARATION + NODE_HEIGHT;
        } else {
          // First child goes directly below parent
          offsetX = 0;
          offsetY = RANK_SEPARATION + NODE_HEIGHT;
        }
      } else {
        // Default: calculate offset based on dagre's intended layout
        const nodeWithPosition = dagreGraph.node(node.id);
        const relatedDagreNode = dagreGraph.node(newNodeRelatedTo);
        if (nodeWithPosition && relatedDagreNode) {
          offsetX = (nodeWithPosition.x - relatedDagreNode.x);
          offsetY = (nodeWithPosition.y - relatedDagreNode.y);
        }
      }
      
      return {
        ...node,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: {
          x: relatedPosition.x + offsetX,
          y: relatedPosition.y + offsetY,
        },
      };
    }
    
    // For new nodes without related context, calculate position based on dagre layout
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export function buildGraphFromData(members: FamilyMember[], onAddMember?: (personId: string) => void, selectedMemberId?: string) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Find path from selected member to 'me'
  const pathToUser = new Set<string>();
  if (selectedMemberId) {
    const findPathToMe = (currentId: string, visited = new Set<string>()): boolean => {
      if (currentId === 'me') {
        pathToUser.add(currentId);
        return true;
      }
      if (visited.has(currentId)) return false;
      visited.add(currentId);
      
      const person = members.find(m => m.id === currentId);
      if (!person) return false;
      
      // Check children for path to 'me'
      for (const childId of person.children || []) {
        if (findPathToMe(childId, visited)) {
          pathToUser.add(currentId);
          pathToUser.add(childId);
          return true;
        }
      }
      return false;
    };
    
    findPathToMe(selectedMemberId);
  }

  // Group members into "Couples" to handle side-by-side positioning
  // We'll still keep individual nodes but use dagre to force ranking
  
  // First pass: Create all nodes
  members.forEach((member) => {
    nodes.push({
      id: member.id,
      type: 'family',
      data: { ...member, onAddMember },
      position: { x: 0, y: 0 },
    });
  });

  // Group children by their parent(s) to connect siblings
  const siblingGroups = new Map<string, string[]>();
  members.forEach((member) => {
    if (member.children && member.children.length > 0) {
      // Create a key based on parent ID(s) - for now just use this parent
      // In a more complex system, you'd group by both parents
      const groupKey = member.id;
      
      member.children.forEach((childId) => {
        if (!siblingGroups.has(groupKey)) {
          siblingGroups.set(groupKey, []);
        }
        const existingGroup = siblingGroups.get(groupKey)!;
        if (!existingGroup.includes(childId)) {
          existingGroup.push(childId);
        }
      });
    }
  });

  // Track which children have been processed to avoid duplicate edges
  const processedChildren = new Set<string>();

  // Second pass: Create edges
  members.forEach((member) => {
    // Parent to Children Edges - but handle siblings specially
    if (member.children && member.children.length > 0) {
      const siblings = siblingGroups.get(member.id) || [];
      
      if (siblings.length > 1) {
        // Multiple children (siblings) - connect them to each other vertically
        for (let i = 0; i < siblings.length - 1; i++) {
          const currentChild = siblings[i];
          const nextChild = siblings[i + 1];
          
          // Check if either sibling is married
          const currentMember = members.find(m => m.id === currentChild);
          const nextMember = members.find(m => m.id === nextChild);
          const hasSpouse = (currentMember?.spouses && currentMember.spouses.length > 0) || 
                           (nextMember?.spouses && nextMember.spouses.length > 0);
          
          // Determine sibling relationship type
          const bothMale = currentMember?.gender === 'male' && nextMember?.gender === 'male';
          const bothFemale = currentMember?.gender === 'female' && nextMember?.gender === 'female';
          
          let siblingColor = '#64748b'; // Default gray
          if (bothMale) siblingColor = '#60a5fa'; // Light blue for brothers
          else if (bothFemale) siblingColor = '#f9a8d4'; // Light pink for sisters
          else siblingColor = '#a78bfa'; // Purple for mixed siblings
          
          // Connect siblings with step edges (creates vertical/horizontal routing)
          edges.push({
            id: `e-sibling-${currentChild}-${nextChild}`,
            source: currentChild,
            target: nextChild,
            type: 'step',
            style: { 
              stroke: siblingColor, 
              strokeWidth: hasSpouse ? 1 : 1.5,
              opacity: 0.25,
              strokeDasharray: hasSpouse ? '5,5' : '3,3'
            },
          });
        }
        
        // Connect parent to the middle sibling (or first if even number)
        const middleIndex = Math.floor(siblings.length / 2);
        const middleChild = siblings[middleIndex];
        const isInPath = selectedMemberId && pathToUser.has(member.id) && pathToUser.has(middleChild);
        
        // Style based on parent gender
        const isFather = member.gender === 'male';
        const parentColor = isFather ? '#3b82f6' : '#ec4899'; // Blue for father, pink for mother
        const parentWidth = isFather ? 2.5 : 2;
        
        edges.push({
          id: `e-${member.id}-${middleChild}`,
          source: member.id,
          target: middleChild,
          type: 'smoothstep',
          animated: isInPath,
          style: { 
            stroke: isInPath ? '#7c3aed' : parentColor, 
            strokeWidth: isInPath ? 3 : parentWidth,
            opacity: isInPath ? 1 : 0.3
          },
          label: isInPath ? '' : (isFather ? 'Father' : 'Mother'),
          labelStyle: { fill: parentColor, fontSize: 10 },
          labelBgStyle: { fill: 'transparent' }
        });
        
        siblings.forEach(child => processedChildren.add(child));
      } else {
        // Single child - connect directly
        member.children.forEach((childId) => {
          if (!processedChildren.has(childId)) {
            const isInPath = selectedMemberId && pathToUser.has(member.id) && pathToUser.has(childId);
            
            // Style based on parent gender
            const isFather = member.gender === 'male';
            const parentColor = isFather ? '#3b82f6' : '#ec4899'; // Blue for father, pink for mother
            const parentWidth = isFather ? 2.5 : 2;
            
            edges.push({
              id: `e-${member.id}-${childId}`,
              source: member.id,
              target: childId,
              type: 'smoothstep',
              animated: isInPath,
              style: { 
                stroke: isInPath ? '#7c3aed' : parentColor, 
                strokeWidth: isInPath ? 3 : parentWidth,
                opacity: isInPath ? 1 : 0.3
              },
            });
            processedChildren.add(childId);
          }
        });
      }
    }
    
    // Spouse Edges - Forces them into the same rank in Dagre
    if (member.spouses && member.spouses.length > 0) {
        member.spouses.forEach(spouseId => {
            if (member.id < spouseId) {
                const spouse = members.find(m => m.id === spouseId);
                
                // Style based on who is husband/wife
                const isHusbandToWife = member.gender === 'male' && spouse?.gender === 'female';
                const spouseColor = isHusbandToWife ? '#f472b6' : '#a855f7'; // Pink for husband-wife, purple for other
                
                edges.push({
                    id: `e-spouse-${member.id}-${spouseId}`,
                    source: member.id,
                    target: spouseId,
                    type: 'smoothstep',
                    style: { 
                      stroke: spouseColor, 
                      strokeWidth: 3,
                      opacity: selectedMemberId ? 0.25 : 0.5
                    },
                    animated: false,
                    label: 'Married',
                    labelStyle: { fill: spouseColor, fontSize: 10, fontWeight: 600 },
                    labelBgStyle: { fill: '#18181b', fillOpacity: 0.8 }
                })
            }
        })
    }
  });

  return { nodes, edges };
}
