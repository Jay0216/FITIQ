import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

export async function generateProPDFReport({
  totalIncome,
  totalTxns,
  totalAppts,
  completionRate,
  uniqueMembers,
  monthlyData,
}: any) {

  const pdf = new jsPDF("p", "mm", "a4");

  // ── HEADER ─────────────────────────────
  pdf.setFontSize(20);
  pdf.text("FitIQ Analytics Report", 14, 20);

  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

  pdf.setDrawColor(200);
  pdf.line(14, 30, 196, 30);

  // ── KPI SECTION ────────────────────────
  pdf.setFontSize(14);
  pdf.text("Key Performance Indicators", 14, 40);

  pdf.setFontSize(11);
  pdf.text(`Total Income: Rs. ${totalIncome.toLocaleString()}`, 14, 48);
  pdf.text(`Transactions: ${totalTxns}`, 14, 54);
  pdf.text(`Appointments: ${totalAppts}`, 14, 60);
  pdf.text(`Completion Rate: ${completionRate}%`, 14, 66);
  pdf.text(`Paying Members: ${uniqueMembers}`, 14, 72);

  // ── MONTHLY TABLE ──────────────────────
  autoTable(pdf, {
    startY: 80,
    head: [["Month", "Income (Rs.)", "Transactions"]],
    body: monthlyData.map((m: any) => [
      m.month,
      m.income.toLocaleString(),
      m.transactions
    ]),
  });

  // ── ADD CHART IMAGE ────────────────────
  const chartEl = document.getElementById("chart-income");

  if (chartEl) {
    const canvas = await html2canvas(chartEl, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    pdf.addPage();

    pdf.setFontSize(14);
    pdf.text("Monthly Income Analysis", 14, 20);

    pdf.addImage(imgData, "PNG", 10, 30, 190, 100);
  }

  // ── FOOTER ─────────────────────────────
  pdf.setFontSize(10);
  pdf.text("FitIQ System Report", 14, 285);

  pdf.save("FitIQ-Analytics-Report.pdf");
}