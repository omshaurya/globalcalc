"use client";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";

interface ExportPanelProps {
  title: string;
  data: Record<string, string | number>;
  projections?: { year: number; value: number }[];
}

export default function ExportPanel({ title, data, projections }: ExportPanelProps) {
  const { toast } = useToast();

  const handleCSV = () => {
    const rows = [["Field", "Value"], ...Object.entries(data).map(([k, v]) => [k, String(v)])];
    if (projections?.length) {
      rows.push(["", ""], ["Year", "Value"], ...projections.map(p => [String(p.year), String(p.value)]));
    }
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV downloaded!", "success");
  };

  const handleCopy = async () => {
    const text = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
    await navigator.clipboard.writeText(text);
    toast("Results copied to clipboard!", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePDF = async () => {
    toast("Generating PDF...", "info");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(title, 20, 25);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()} by FinCalcPro`, 20, 33);

      doc.setLineWidth(0.3);
      doc.setDrawColor(200);
      doc.line(20, 37, 190, 37);

      let y = 45;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Results Summary", 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      for (const [key, val] of Object.entries(data)) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setTextColor(80);
        doc.text(key, 20, y);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(String(val), 120, y, { align: "right" });
        doc.setFont("helvetica", "normal");
        y += 7;
      }

      if (projections?.length) {
        y += 8;
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("Year-by-Year Projections", 20, y);
        y += 8;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        for (const p of projections.slice(0, 40)) {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.setTextColor(80);
          doc.text(String(p.year), 20, y);
          doc.setTextColor(0);
          doc.text(String(p.value), 80, y);
          y += 6;
        }
      }

      y += 15;
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Disclaimer: This report is for informational purposes only and does not constitute financial advice.", 20, y, { maxWidth: 170 });

      doc.save(`${title.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      toast("PDF downloaded!", "success");
    } catch {
      toast("PDF generation failed. Please try printing instead.", "error");
    }
  };

  return (
    <Card className="mt-6">
      <h3 className="font-semibold text-[var(--foreground)] mb-4">📥 Download & Export</h3>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handlePDF} size="sm" variant="primary">
          📄 PDF Report
        </Button>
        <Button onClick={handleCSV} size="sm" variant="outline">
          📊 CSV
        </Button>
        <Button onClick={handleCopy} size="sm" variant="outline">
          📋 Copy Results
        </Button>
        <Button onClick={handlePrint} size="sm" variant="outline">
          🖨️ Print
        </Button>
      </div>
    </Card>
  );
}
