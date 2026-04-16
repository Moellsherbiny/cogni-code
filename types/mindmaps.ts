import { Node, Edge } from '@xyflow/react';

export interface MindMap {
  id: string;
  title: string;
  summary: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
}