import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface DownloadProps {
  summaryEl: HTMLElement;
  mindmapSvg: SVGSVGElement;
  title: string;
  isRTL: boolean;
}

export const downloadSummaryPdf = async ({
  summaryEl,
  mindmapSvg,
  title,
  isRTL,
}: DownloadProps) => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;

    // --- Page 1: Summary ---
    // toPng handles lab(), oklch(), and modern CSS better than html2canvas
    const summaryDataUrl = await toPng(summaryEl, {
      quality: 0.95,
      backgroundColor: "#ffffff",
      style: {
        // Force the element to be visible during capture 
        // if it was hidden by the tab system
        display: 'block',
      }
    });

    const sImgProps = pdf.getImageProperties(summaryDataUrl);
    const sHeight = (sImgProps.height * contentWidth) / sImgProps.width;

    pdf.setFontSize(16);
    pdf.text("Summary Report", margin, 15);
    pdf.addImage(summaryDataUrl, "PNG", margin, 25, contentWidth, sHeight);

    // --- Page 2: Mind Map ---
    pdf.addPage();
    
    // For the SVG Mindmap, we capture its container
    const mindmapWrapper = mindmapSvg.parentElement as HTMLElement;
    const mindmapDataUrl = await toPng(mindmapWrapper || mindmapSvg, {
      backgroundColor: "#ffffff",
    });

    const mImgProps = pdf.getImageProperties(mindmapDataUrl);
    const mHeight = (mImgProps.height * contentWidth) / mImgProps.width;

    pdf.text("Mind Map Visual", margin, 15);
    pdf.addImage(mindmapDataUrl, "PNG", margin, 25, contentWidth, mHeight);

    pdf.save(`${title.replace(/[^\w\s]/gi, "")}.pdf`);

  } catch (error) {
    console.error("PDF Generation failed:", error);
    // You could add a toast notification here to tell the user it failed
  }
};