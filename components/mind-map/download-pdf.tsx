"use client";

import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react'; 

interface DownloadPDFProps {
  targetId: string;
  fileName: string;
  label: string;
}

export function DownloadPDF({ targetId, fileName, label }: DownloadPDFProps) {
  const handleDownload = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    try {
      // Capture the element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        // Ensure background colors are captured (useful for dark mode)
        backgroundColor: window.getComputedStyle(element).backgroundColor,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Button variant="outline" onClick={handleDownload} className="flex gap-2">
      <Download className="h-4 w-4" />
      {label}
    </Button>
  );
}