"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Save, Trash, TestTube, Wand2 } from "lucide-react";
import { useMindMapStore } from '@/store/useMindMapStore';
import { transformToFlow } from '@/lib/mind-map-converts';
import { v4 as uuidv4 } from 'uuid';
import Logo from '../layout/logo';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AISidebar() {
  const [prompt, setPrompt] = useState("");
  const { setCurrentMap, currentMap } = useMindMapStore();

  const testGeneration = () => {
    const mockAiResponse = {
      id: 'root',
      label: 'الحلقات التكرارية (Loops)',
      children: [
        { id: '1', label: 'For Loop', children: [{ id: '1-1', label: 'تستخدم عند معرفة عدد المرات' }] },
        { id: '2', label: 'While Loop', children: [{ id: '2-1', label: 'تعتمد على شرط محدد' }] },
      ]
    };
    const { nodes, edges } = transformToFlow(mockAiResponse);
    setCurrentMap({
      id: uuidv4(),
      title: "اختبار الحلقات التكرارية",
      summary: "الحلقات التكرارية هي أساسيات برمجية لتكرار العمليات بناءً على شروط معينة.",
      nodes,
      edges,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="w-80 border-r h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-xl">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Logo />
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">AI Generator</label>
            <div className="relative group">
              <Input 
                placeholder="مثلاً: الوراثة في البرمجة" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="pr-10 bg-background/50 border-muted-foreground/20 transition-all focus:ring-2 focus:ring-primary"
              />
              <Wand2 className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button className="flex-1 shadow-lg shadow-primary/20 gap-2" onClick={() => {}} disabled={!prompt}>
              <Sparkles className="w-4 h-4" /> Generate
            </Button>
            <Button variant="outline" size="icon" onClick={testGeneration} className="shrink-0 border-dashed">
              <TestTube className="w-4 h-4 text-orange-500" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <Card className="border-none bg-background/40 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/80 italic border-l-2 border-primary/30 pl-3">
              {currentMap?.summary || "Enter a topic to generate your AI-powered mind map summary."}
            </p>
          </CardContent>
        </Card>
      </ScrollArea>
      
      <div className="p-4 border-t bg-background/80 backdrop-blur-md flex flex-col gap-2">
        <div className="flex gap-2">
          <Button variant="default" className="flex-1 gap-2" disabled={!currentMap}>
            <Save className="w-4 h-4"/> Save
          </Button>
          <Button variant="secondary" size="icon" disabled={!currentMap} className="hover:bg-destructive hover:text-destructive-foreground transition-colors">
            <Trash className="w-4 h-4"/>
          </Button>
        </div>
      </div>
    </div>
  );
}