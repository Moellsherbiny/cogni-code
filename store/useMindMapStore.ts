import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, OnNodesChange, OnEdgesChange } from '@xyflow/react';
import { MindMap } from '@/types/mindmaps';

interface MindMapState {
  maps: MindMap[];
  currentMap: MindMap | null;
  setMaps: (maps: MindMap[]) => void;
  setCurrentMap: (map: MindMap | null) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  saveMap: (id: string, updates: Partial<MindMap>) => void;
  deleteMap: (id: string) => void;
}

export const useMindMapStore = create<MindMapState>()(
  persist(
    (set, get) => ({
      maps: [],
      currentMap: null,
      setMaps: (maps) => set({ maps }),
      setCurrentMap: (map) => set({ currentMap: map }),
      onNodesChange: (changes) => {
        const current = get().currentMap;
        if (current) {
          set({
            currentMap: { ...current, nodes: applyNodeChanges(changes, current.nodes) },
          });
        }
      },
      onEdgesChange: (changes) => {
        const current = get().currentMap;
        if (current) {
          set({
            currentMap: { ...current, edges: applyEdgeChanges(changes, current.edges) },
          });
        }
      },
      saveMap: (id, updates) => {
        const { maps } = get();
        const updatedMaps = maps.map(m => m.id === id ? { ...m, ...updates } : m);
        set({ maps: updatedMaps });
      },
      deleteMap: (id) => set({ maps: get().maps.filter(m => m.id !== id) }),
    }),
    { name: 'mindmap-storage' }
  )
);