import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface GrantForExport {
  title: string;
  funder: string;
  type: string | null;
  state: string | null;
  amount: string | null;
  deadline: string | null;
  matchScore: number | null;
  description: string | null;
  eligibility: string | null;
  url: string | null;
  contactEmail: string | null;
  matchReasons: string[] | null;
}

interface ExportOptions {
  includeMatchAnalysis?: boolean;
  includeContactInfo?: boolean;
  includeEligibility?: boolean;
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  ALL: "National",
};

function getStateName(code: string | null): string {
  if (!code) return "Unknown";
  return STATE_NAMES[code] || code;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Rolling";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

export function exportGrantsToPDF(
  grants: GrantForExport[],
  options: ExportOptions = {}
): void {
  const {
    includeMatchAnalysis = true,
    includeContactInfo = true,
    includeEligibility = true,
  } = options;

  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Header
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Grant Finder Pro", margin, 18);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Grant Opportunities Report", margin, 28);

  // Date and count
  doc.setFontSize(10);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    pageWidth - margin - 60,
    18
  );
  doc.text(`Total Grants: ${grants.length}`, pageWidth - margin - 60, 26);

  yPosition = 45;

  // Summary statistics
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, yPosition);
  yPosition += 8;

  const highMatchCount = grants.filter((g) => (g.matchScore || 0) >= 80).length;
  const federalCount = grants.filter((g) => g.type === "federal").length;
  const stateCount = grants.filter((g) => g.type === "state").length;
  const foundationCount = grants.filter((g) => g.type === "foundation").length;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105); // slate-600

  const summaryData = [
    [`High Match (80%+): ${highMatchCount}`, `Federal Grants: ${federalCount}`],
    [`State Grants: ${stateCount}`, `Foundation Grants: ${foundationCount}`],
  ];

  summaryData.forEach((row) => {
    doc.text(row[0], margin, yPosition);
    doc.text(row[1], margin + 60, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Grants table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Grant Opportunities", margin, yPosition);
  yPosition += 5;

  // Prepare table data
  const tableHeaders = ["Grant", "Funder", "Type", "Location", "Amount", "Deadline"];
  if (includeMatchAnalysis) {
    tableHeaders.push("Match");
  }

  const tableData = grants.map((grant) => {
    const row = [
      truncateText(grant.title, 35),
      truncateText(grant.funder, 20),
      grant.type ? grant.type.charAt(0).toUpperCase() + grant.type.slice(1) : "N/A",
      getStateName(grant.state),
      grant.amount || "Varies",
      formatDate(grant.deadline),
    ];
    if (includeMatchAnalysis) {
      row.push(`${grant.matchScore || 0}%`);
    }
    return row;
  });

  // Create table
  autoTable(doc, {
    startY: yPosition,
    head: [tableHeaders],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [16, 185, 129], // emerald-500
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85], // slate-700
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249], // slate-100
    },
    columnStyles: {
      0: { cellWidth: 45 }, // Grant title
      1: { cellWidth: 30 }, // Funder
      2: { cellWidth: 22 }, // Type
      3: { cellWidth: 25 }, // Location
      4: { cellWidth: 25 }, // Amount
      5: { cellWidth: 22 }, // Deadline
      ...(includeMatchAnalysis ? { 6: { cellWidth: 15, halign: "center" } } : {}),
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => {
      // Footer on each page
      const pageCount = (doc as any).getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
      doc.text(
        "Generated by Grant Finder Pro",
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" }
      );
    },
  });

  // Get the final Y position after the table
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || yPosition;

  // Add detailed grant information on new pages
  if (includeEligibility || includeContactInfo || includeMatchAnalysis) {
    doc.addPage();
    yPosition = margin;

    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Grant Information", margin, 14);

    yPosition = 30;

    grants.forEach((grant, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }

      // Grant header
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(margin, yPosition - 5, pageWidth - margin * 2, 10, "F");

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${truncateText(grant.title, 60)}`, margin + 2, yPosition + 2);

      if (includeMatchAnalysis && grant.matchScore) {
        const matchColor =
          grant.matchScore >= 80
            ? [16, 185, 129] // emerald
            : grant.matchScore >= 60
            ? [245, 158, 11] // amber
            : [148, 163, 184]; // slate
        doc.setTextColor(matchColor[0], matchColor[1], matchColor[2]);
        doc.text(`${grant.matchScore}% Match`, pageWidth - margin - 25, yPosition + 2);
      }

      yPosition += 12;

      // Grant details
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      doc.text(`Funder: ${grant.funder}`, margin + 2, yPosition);
      doc.text(
        `Type: ${grant.type ? grant.type.charAt(0).toUpperCase() + grant.type.slice(1) : "N/A"}`,
        margin + 80,
        yPosition
      );
      yPosition += 5;

      doc.text(`Location: ${getStateName(grant.state)}`, margin + 2, yPosition);
      doc.text(`Amount: ${grant.amount || "Varies"}`, margin + 80, yPosition);
      yPosition += 5;

      doc.text(`Deadline: ${formatDate(grant.deadline)}`, margin + 2, yPosition);
      yPosition += 5;

      if (grant.description) {
        doc.setTextColor(100, 116, 139);
        const descLines = doc.splitTextToSize(
          truncateText(grant.description, 200),
          pageWidth - margin * 2 - 4
        );
        doc.text(descLines, margin + 2, yPosition);
        yPosition += descLines.length * 4 + 2;
      }

      if (includeEligibility && grant.eligibility) {
        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "bold");
        doc.text("Eligibility:", margin + 2, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition += 4;
        const eligLines = doc.splitTextToSize(
          truncateText(grant.eligibility, 150),
          pageWidth - margin * 2 - 4
        );
        doc.text(eligLines, margin + 2, yPosition);
        yPosition += eligLines.length * 4 + 2;
      }

      if (includeMatchAnalysis && grant.matchReasons && grant.matchReasons.length > 0) {
        doc.setTextColor(16, 185, 129);
        doc.setFont("helvetica", "bold");
        doc.text("Match Reasons:", margin + 2, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition += 4;
        doc.setTextColor(71, 85, 105);
        doc.text(grant.matchReasons.slice(0, 3).join(" | "), margin + 2, yPosition);
        yPosition += 5;
      }

      if (includeContactInfo && grant.contactEmail) {
        doc.setTextColor(59, 130, 246); // blue
        doc.text(`Contact: ${grant.contactEmail}`, margin + 2, yPosition);
        yPosition += 5;
      }

      if (grant.url) {
        doc.setTextColor(59, 130, 246);
        doc.text(`URL: ${truncateText(grant.url, 70)}`, margin + 2, yPosition);
        yPosition += 5;
      }

      yPosition += 8;
    });
  }

  // Save the PDF
  const filename = `grants-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

export function exportSingleGrantToPDF(grant: GrantForExport): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  // Header
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("Grant Finder Pro", margin, 12);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(grant.title, pageWidth - margin * 2);
  doc.text(titleLines, margin, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(grant.funder, margin, 38);

  yPosition = 55;

  // Match Score Badge
  if (grant.matchScore) {
    const matchColor =
      grant.matchScore >= 80
        ? [16, 185, 129]
        : grant.matchScore >= 60
        ? [245, 158, 11]
        : [148, 163, 184];
    doc.setFillColor(matchColor[0], matchColor[1], matchColor[2]);
    doc.roundedRect(pageWidth - margin - 30, 15, 28, 12, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${grant.matchScore}%`, pageWidth - margin - 16, 23, { align: "center" });
  }

  // Key Details Box
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 35, 3, 3, "FD");

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  doc.text("Type", margin + 10, yPosition + 10);
  doc.text("Location", margin + 50, yPosition + 10);
  doc.text("Amount", margin + 95, yPosition + 10);
  doc.text("Deadline", margin + 140, yPosition + 10);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);

  doc.text(
    grant.type ? grant.type.charAt(0).toUpperCase() + grant.type.slice(1) : "N/A",
    margin + 10,
    yPosition + 20
  );
  doc.text(getStateName(grant.state), margin + 50, yPosition + 20);
  doc.text(grant.amount || "Varies", margin + 95, yPosition + 20);
  doc.text(formatDate(grant.deadline), margin + 140, yPosition + 20);

  yPosition += 45;

  // Description
  if (grant.description) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Description", margin, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(grant.description, pageWidth - margin * 2);
    doc.text(descLines, margin, yPosition);
    yPosition += descLines.length * 5 + 10;
  }

  // Eligibility
  if (grant.eligibility) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Eligibility Requirements", margin, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const eligLines = doc.splitTextToSize(grant.eligibility, pageWidth - margin * 2);
    doc.text(eligLines, margin, yPosition);
    yPosition += eligLines.length * 5 + 10;
  }

  // Match Reasons
  if (grant.matchReasons && grant.matchReasons.length > 0) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 25 + grant.matchReasons.length * 5, 3, 3, "FD");

    doc.setTextColor(6, 95, 70); // emerald-800
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Why This Grant Matches Your Profile", margin + 5, yPosition + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    grant.matchReasons.forEach((reason, index) => {
      doc.text(`• ${reason}`, margin + 5, yPosition + 16 + index * 5);
    });

    yPosition += 30 + grant.matchReasons.length * 5;
  }

  // Contact Information
  if (grant.contactEmail) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Contact Information", margin, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.text(grant.contactEmail, margin, yPosition);
    yPosition += 10;
  }

  // URL
  if (grant.url) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Official Website", margin, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.text(grant.url, margin, yPosition);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated by Grant Finder Pro on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  // Save
  const filename = `grant-${grant.title.substring(0, 30).replace(/[^a-z0-9]/gi, "-")}.pdf`;
  doc.save(filename);
}
