import { Node, Edge } from '@xyflow/react';

export const transformToFlow = (data: any, x = 0, y = 0, level = 0): { nodes: Node[], edges: Edge[] } => {
  let nodes: Node[] = [];
  let edges: Edge[] = [];

  const currentNode: Node = {
    id: data.id,
    data: { label: data.label },
    position: { x, y },
    // تخصيص شكل النود (اختياري)
    style: { background: level === 0 ? '#3b82f6' : '#fff', color: level === 0 ? '#fff' : '#000' },
  };

  nodes.push(currentNode);

  if (data.children) {
    data.children.forEach((child: any, index: number) => {
      // حساب مسافات تلقائية بسيطة للعرض
      const childX = x + 250;
      const childY = y + (index - (data.children.length - 1) / 2) * 100;
      
      edges.push({
        id: `e${data.id}-${child.id}`,
        source: data.id,
        target: child.id,
        animated: true,
      });

      const result = transformToFlow(child, childX, childY, level + 1);
      nodes = nodes.concat(result.nodes);
      edges = edges.concat(result.edges);
    });
  }

  return { nodes, edges };
};