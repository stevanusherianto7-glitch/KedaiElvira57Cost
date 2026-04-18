import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { Ingredient, Recipe, Transaction, Employee, ShiftType } from "../types";
import { formatCurrency } from "../lib/utils";
import { JOBDESK_MARKDOWN } from "../constants";
import { SHIFT_CONFIGS } from "../schedulerConstants";

const saveBlob = (doc: jsPDF, filename: string) => {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const handleExportJobdeskPDF = (selectedTasks: string[], reportTitle: string) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - 14, 12, { align: 'right' });

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('SPO KITCHEN-MINI BAR-Lt. 1-Lt.2-Lt.3', pageWidth / 2, 26, { align: 'center' });
  
  // Data preparation
  const lines = JOBDESK_MARKDOWN.split('\n');
  const tableData: any[] = [];
  let currentSection = "";
  let currentSubSection = "";

  lines.forEach(line => {
    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
      currentSubSection = "";
    } else if (line.startsWith('### ')) {
      currentSubSection = line.replace('### ', '').trim();
    } else if (line.includes('* [ ]')) {
      const taskName = line.replace('* [ ]', '').trim();
      if (selectedTasks.length === 0 || selectedTasks.includes(taskName)) {
        tableData.push([
          currentSection,
          currentSubSection,
          taskName,
          "[ ]"
        ]);
      }
    }
  });

  autoTable(doc, {
    startY: 35,
    head: [['Kategori', 'Sub-Kategori', 'Tugas', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 20, halign: 'center' }
    },
    didDrawPage: (data) => {
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.setFont('helvetica', 'italic');
      doc.text('Pawon Salam Resto', data.settings.margin.left, pageHeight - 10);
      doc.setFont('helvetica', 'normal');
      const pageNumber = `Halaman ${doc.internal.pages.length - 1}`;
      doc.text(pageNumber, pageWidth - data.settings.margin.right - doc.getTextWidth(pageNumber), pageHeight - 10);
    }
  });

  saveBlob(doc, `${reportTitle}-${new Date().toLocaleDateString()}.pdf`);
};

export const handleExportInventoryPDF = (ingredients: Ingredient[], recipes: Recipe[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - 14, 12, { align: 'right' });

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN KONTROL STOK & PENGGUNAAN BAHAN', pageWidth / 2, 26, { align: 'center' });
  
  const tableData = ingredients.map(ing => {
    // Find menus that use this ingredient
    const usedInMenus = recipes
      .filter(r => r.items.some(item => item.ingredientId === ing.id))
      .map(r => r.name)
      .join(', ');

    return [
      ing.name,
      ing.category || 'Makanan',
      usedInMenus || '-',
      `${ing.stockQuantity / ing.conversionValue} ${ing.purchaseUnit}`,
      ing.lowStockThreshold ? `${ing.lowStockThreshold / ing.conversionValue} ${ing.purchaseUnit}` : '-',
      ing.stockQuantity <= (ing.lowStockThreshold || 0) ? 'Stok Rendah' : 'Aman'
    ];
  });

  autoTable(doc, {
    startY: 35,
    head: [['Nama Bahan', 'Kategori', 'Digunakan Pada Menu', 'Stok Saat Ini', 'Min. Stok', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2, textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30 },
      2: { cellWidth: 45 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 }
    },
    didDrawPage: (data) => {
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.setFont('helvetica', 'italic');
      doc.text('Pawon Salam Resto', data.settings.margin.left, pageHeight - 10);
      doc.setFont('helvetica', 'normal');
      const pageNumber = `Halaman ${doc.internal.pages.length - 1}`;
      doc.text(pageNumber, pageWidth - data.settings.margin.right - doc.getTextWidth(pageNumber), pageHeight - 10);
    }
  });

  saveBlob(doc, `Laporan_Kontrol_Stok_dan_Penggunaan_Bahan_${new Date().toLocaleDateString()}.pdf`);
};

export const handleExportRecipePDF = (recipe: Recipe, ingredients: Ingredient[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - 14, 12, { align: 'right' });

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Bill of Materials (BOM) & Kalkulasi HPP (COGS)', pageWidth / 2, 26, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Resep : ${recipe.name}`, pageWidth / 2, 34, { align: 'center' });
  
  // Calculations
  const bahanBakuItems = recipe.items.filter(item => {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    return ing?.category !== "Kemasan Take Away";
  });
  const kemasanItems = recipe.items.filter(item => {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    return ing?.category === "Kemasan Take Away";
  });

  const bahanBakuCost = bahanBakuItems.reduce((acc, item) => {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    return acc + (ing ? (ing.purchasePrice / ing.conversionValue) * item.quantityNeeded : 0);
  }, 0);

  const kemasanCost = kemasanItems.reduce((acc, item) => {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    return acc + (ing ? (ing.purchasePrice / ing.conversionValue) * item.quantityNeeded : 0);
  }, 0);

  const wasteBuffer = (bahanBakuCost + kemasanCost) * (recipe.shrinkagePercent / 100);
  const totalHPP = bahanBakuCost + kemasanCost + wasteBuffer;
  const totalOPEX = recipe.laborCost + recipe.overheadCost;
  const totalCost = totalHPP + totalOPEX;

  const tableData = recipe.items.map((item, index) => {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    const cost = ing ? (ing.purchasePrice / ing.conversionValue) * item.quantityNeeded : 0;
    return [
      index + 1,
      ing?.name || 'Unknown',
      `${item.quantityNeeded} ${ing?.useUnit || ''}`,
      'Rp',
      cost.toLocaleString('id-ID')
    ];
  });

  autoTable(doc, {
    startY: 45,
    head: [[
      { content: 'No.' },
      { content: 'Bahan Baku' }, 
      { content: 'Jumlah' }, 
      { content: 'Biaya', colSpan: 2, styles: { halign: 'center' } }
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 30 },
      3: { cellWidth: 10, halign: 'left' },
      4: { cellWidth: 30, halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 3) {
          data.cell.styles.lineWidth = { top: 0.1, bottom: 0.1, left: 0.1, right: 0 } as any;
        }
        if (data.column.index === 4) {
          data.cell.styles.lineWidth = { top: 0.1, bottom: 0.1, left: 0, right: 0.1 } as any;
        }
      }
    }
  });

  // Cost Structure Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN STRUKTUR BIAYA', 14, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = finalY + 7;
  const addRow = (label: string, value: number) => {
    doc.text(label, 14, y);
    doc.text('Rp', 160, y);
    doc.text(value.toLocaleString('id-ID'), pageWidth - 14, y, { align: 'right' });
    y += 6;
  };

  addRow('Biaya Bahan Baku:', bahanBakuCost);
  addRow('Biaya Kemasan:', kemasanCost);
  addRow('Waste/Shrinkage:', wasteBuffer);
  doc.line(14, y, pageWidth - 14, y);
  y += 4;
  addRow('TOTAL HPP (Bahan + Kemasan + Waste):', totalHPP);
  addRow('Biaya Tenaga Kerja (Per Porsi):', recipe.laborCost);
  addRow('Biaya Overhead (Per Porsi):', recipe.overheadCost);
  
  if (recipe.overheadBreakdown) {
    let breakdownY = y;
    
    doc.setFillColor(100, 116, 139);
    doc.rect(12, breakdownY - 4, pageWidth - 24, 18, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`*Detail Alokasi Bulanan (Target ${recipe.overheadBreakdown.targetPortions} porsi):`, 14, breakdownY);
    breakdownY += 4;
    
    const addBreakdownCol = (label: string, value: number, startX: number, currentY: number) => {
      doc.text(label, startX, currentY);
      doc.text('Rp', startX + 22, currentY);
      doc.text(value.toLocaleString('id-ID'), startX + 45, currentY, { align: 'right' });
    };

    addBreakdownCol('- Gaji:', recipe.overheadBreakdown.labor, 18, breakdownY);
    addBreakdownCol('- Listrik:', recipe.overheadBreakdown.electricity, 74, breakdownY);
    addBreakdownCol('- Gas:', recipe.overheadBreakdown.gas, 134, breakdownY);
    breakdownY += 4;
    
    addBreakdownCol('- Air:', recipe.overheadBreakdown.water, 18, breakdownY);
    addBreakdownCol('- Promosi:', recipe.overheadBreakdown.marketing, 74, breakdownY);
    addBreakdownCol('- Internet:', recipe.overheadBreakdown.internet, 134, breakdownY);
    breakdownY += 4;
    
    addBreakdownCol('- Sampah:', recipe.overheadBreakdown.trashFee || 0, 18, breakdownY);
    doc.text(`- Waste: ${recipe.overheadBreakdown.wastePercent}%`, 74, breakdownY);
    y = breakdownY + 6;
  } else {
    y += 4;
  }
  
  doc.setTextColor(0, 0, 0);
  doc.line(14, y, pageWidth - 14, y);
  y += 4;
  addRow('TOTAL BIAYA PRODUKSI (HPP + Tenaga Kerja + Overhead):', totalCost);
  
  doc.setFont('helvetica', 'bold');
  y += 6;
  const actualSellingPrice = recipe.roundedSellingPrice || recipe.sellingPrice;
  addRow('HARGA JUAL:', actualSellingPrice);
  addRow('LABA KOTOR (Harga Jual - HPP):', actualSellingPrice - totalHPP);
  addRow('LABA BERSIH (Harga Jual - Total Biaya Produksi):', actualSellingPrice - totalCost);
  
  const profitMargin = actualSellingPrice > 0 ? ((actualSellingPrice - totalCost) / actualSellingPrice) * 100 : 0;
  doc.text('MARGIN KEUNTUNGAN (%):', 14, y);
  doc.text(`${Math.round(profitMargin)}%`, pageWidth - 14, y, { align: 'right' });

  // Add footers to all pages
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
    
    // Footer Branding - Pawon Salam Resto (Italic, 11pt)
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text('Pawon Salam Resto', 14, pageHeight - 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const pageNumber = `Halaman ${i}`;
    doc.text(pageNumber, pageWidth - 14 - doc.getTextWidth(pageNumber), pageHeight - 10);
  }

  saveBlob(doc, `Resep_${recipe.name}_${new Date().toLocaleDateString()}.pdf`);
};

export const handleExportClosingPDF = async (reportRef: React.RefObject<HTMLDivElement>) => {
  if (!reportRef.current) return;
  
  const canvas = await html2canvas(reportRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });
  
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [57, (canvas.height * 57) / canvas.width]
  });
  
  pdf.addImage(imgData, "PNG", 0, 0, 57, (canvas.height * 57) / canvas.width);
  saveBlob(pdf, `closing-report-${new Date().toLocaleDateString()}.pdf`);
};

export const handleExportShiftPDF = (employees: Employee[], shifts: Record<string, Record<string, ShiftType>>, monthDates: { dateStr: string; dayName: string; dayNum: string }[], currentDate: Date) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  const periodString = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text("Jadwal Shift Karyawan Pawon Salam Resto", 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Periode: ${periodString}`, 14, 22);

  const tableHead = [
    [
      { content: 'Nama', styles: { halign: 'left', fontStyle: 'bold', valign: 'middle' } },
      { content: 'Role', styles: { halign: 'left', fontStyle: 'bold', valign: 'middle' } },
      ...monthDates.map(d => {
        const isWeekend = d.dayName === 'MIN' || d.dayName === 'SAB';
        const fillColor: [number, number, number] = isWeekend ? [254, 202, 202] : [241, 245, 249];
        const textColor: [number, number, number] = isWeekend ? [127, 29, 29] : [51, 65, 85];
        return {
          content: `${d.dayName}\n${d.dayNum}`,
          styles: { 
            halign: 'center', valign: 'middle', fontSize: 6, fontStyle: 'bold',
            fillColor,
            textColor,
          } 
        };
      })
    ]
  ];
  
  const tableBody = employees.map(emp => {
    return [
      { content: emp.name.toUpperCase(), styles: { fontStyle: 'bold' } },
      { content: emp.role.toUpperCase(), styles: { fontSize: 7 } },
      ...monthDates.map(date => {
        const shift = shifts[emp.id]?.[date.dateStr] || ShiftType.LIBUR;
        const config = SHIFT_CONFIGS[shift];
        let fillColor: [number, number, number] = [255, 255, 255];
        if (shift === ShiftType.PAGI) fillColor = [59, 130, 246];
        if (shift === ShiftType.MIDDLE) fillColor = [34, 197, 94];
        if (shift === ShiftType.LIBUR) fillColor = [239, 68, 68];
        return {
          content: config.code,
          styles: { halign: 'center', fillColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6 }
        };
      })
    ];
  });

  autoTable(doc, {
    head: tableHead as any, body: tableBody as any, startY: 35, theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.2, valign: 'middle', lineColor: [226, 232, 240], lineWidth: 0.1 },
    headStyles: { fillColor: [255, 255, 255], textColor: [30, 41, 59], lineColor: [203, 213, 225], lineWidth: 0.2, minCellHeight: 10 },
    columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 15 } },
    didDrawPage: (data) => {
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      
      // Footer Branding - Pawon Salam Resto (Italic, 11pt)
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.text('Pawon Salam Resto', data.settings.margin.left, pageHeight - 10);
      
      // Page Number
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const pageNumber = `Halaman ${doc.internal.pages.length - 1}`;
      doc.text(pageNumber, pageWidth - data.settings.margin.right - doc.getTextWidth(pageNumber), pageHeight - 10);
    }
  });
  
  saveBlob(doc, `Jadwal_Shift_${periodString.replace(/\s/g, '_')}.pdf`);
};

export const handleExportPatternPDF = (employees: Employee[], weeklyPattern: Record<string, ShiftType[]>) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text("Pola Jadwal Mingguan Standar", 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Pawon Salam Resto", 14, 22);

  const daysOfWeek = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
  const tableHead = [[
    'Nama', 'Role', 'MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'
  ]];

  const tableBody = employees.map(emp => {
    const pattern = weeklyPattern[emp.id] || Array(7).fill(ShiftType.LIBUR);
    return [
      emp.name.toUpperCase(), 
      emp.role.toUpperCase(), 
      ...pattern.map(p => SHIFT_CONFIGS[p].code)
    ];
  });

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    didDrawPage: (data) => {
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      
      // Footer Branding - Pawon Salam Resto (Italic, 11pt)
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.text('Pawon Salam Resto', data.settings.margin.left, pageHeight - 10);
      
      // Page Number
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const pageNumber = `Halaman ${doc.internal.pages.length - 1}`;
      doc.text(pageNumber, pageWidth - data.settings.margin.right - doc.getTextWidth(pageNumber), pageHeight - 10);
    }
  });

  saveBlob(doc, `Pola_Jadwal_Mingguan.pdf`);
};
