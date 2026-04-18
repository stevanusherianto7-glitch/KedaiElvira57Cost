import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { Ingredient, Recipe, Transaction, Employee, ShiftType } from "../types";
import { formatCurrency } from "../lib/utils";
import { JOBDESK_MARKDOWN } from "../constants";
import { SHIFT_CONFIGS } from "../schedulerConstants";

const showLoadingOverlay = () => {
  const overlayId = 'pdf-loading-overlay';
  let overlay = document.getElementById(overlayId);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = overlayId;
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: '9999', fontFamily: 'sans-serif'
    });
    overlay.innerHTML = `
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; padding: 0px; margin-bottom: 20px; animation: spin-pdf 1s linear infinite;"></div>
      <style>@keyframes spin-pdf { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      <h2 style="font-size: 20px; font-weight: bold; margin: 0;">MENYUSUN LAPORAN...</h2>
      <p style="font-size: 14px; margin-top: 8px; color: #cbd5e1;">Mohon tunggu sebentar</p>
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
};

const hideLoadingOverlay = (overlay: HTMLElement | null) => {
  if (overlay && document.body.contains(overlay)) {
    document.body.removeChild(overlay);
  }
};

const applyOklchFix = (clonedDoc: Document) => {
  const clonedWindow = clonedDoc.defaultView;
  if (clonedWindow) {
    const originalGetComputedStyle = clonedWindow.getComputedStyle;
    clonedWindow.getComputedStyle = function(el, pseudoElt) {
      const style = originalGetComputedStyle.call(clonedWindow, el, pseudoElt);
      
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function(property: string) {
              const val = target.getPropertyValue(property);
              if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('color(') || val.includes('var('))) {
                if (property.includes('background')) return 'rgb(255, 255, 255)';
                if (property.includes('color') || property.includes('border') || property.includes('outline')) return 'rgb(15, 23, 42)';
                return 'none';
              }
              return val;
            };
          }
          
          const val = target[prop as keyof CSSStyleDeclaration];
          if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab') || val.includes('color(') || val.includes('var('))) {
            const propStr = prop.toString().toLowerCase();
            if (propStr.includes('bg') || propStr.includes('background')) return 'rgb(255, 255, 255)';
            if (propStr.includes('color') || propStr.includes('border') || propStr.includes('outline')) return 'rgb(15, 23, 42)';
            return 'none';
          }
          
          if (typeof val === 'function') {
            return val.bind(target);
          }
          
          return val;
        }
      });
    };
  }

  // Workaround Khusus untuk Efek Radial/Visual Kompleks
  const elements = clonedDoc.querySelectorAll('*');
  elements.forEach((el) => {
    if (el instanceof HTMLElement) {
      try {
         el.style.filter = 'none'; // Hapus filter yang berpotensi memicu fail-point
         
         if (el.classList.contains('sphere-blue')) {
           el.style.background = '#3b82f6';
           el.style.backgroundColor = '#3b82f6';
           el.style.boxShadow = 'none';
           el.style.border = 'none';
         } else if (el.classList.contains('sphere-green')) {
           el.style.background = '#10b981';
           el.style.backgroundColor = '#10b981';
           el.style.boxShadow = 'none';
           el.style.border = 'none';
         } else if (el.classList.contains('sphere-red')) {
           el.style.background = '#ef4444';
           el.style.backgroundColor = '#ef4444';
           el.style.boxShadow = 'none';
           el.style.border = 'none';
         }
         
         if (el.classList.contains('sphere-highlight') || el.classList.contains('sphere-shadow')) {
           el.style.display = 'none';
         }
      } catch (e) {}
    }
  });
};

const saveBlob = (doc: jsPDF, _filename: string) => {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};

export const handleExportJobdeskPDF = (selectedTasks: string[], reportTitle: string) => {
  const overlay = showLoadingOverlay();
  try {
    const doc = new jsPDF({ compress: true, orientation: 'p', unit: 'mm', format: 'a4' });
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
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [243, 244, 246] },
      styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
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
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text('Pawon Salam Resto', data.settings.margin.left, pageHeight - 10);
        const pageNumber = `Halaman ${doc.internal.pages.length - 1}`;
        doc.text(pageNumber, pageWidth - data.settings.margin.right - doc.getTextWidth(pageNumber), pageHeight - 10);
      }
    });

    saveBlob(doc, `${reportTitle}-${new Date().toLocaleDateString()}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert(`Terjadi kesalahan sistem saat mengekspor PDF.\n\nError Log: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  } finally {
    hideLoadingOverlay(overlay);
  }
};

export const handleExportInventoryPDF = (ingredients: Ingredient[], recipes: Recipe[]) => {
  const overlay = showLoadingOverlay();
  try {
    const doc = new jsPDF({ compress: true, orientation: 'p', unit: 'mm', format: 'a4' });
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
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [243, 244, 246] },
      styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
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
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text('Pawon Salam Resto', data.settings.margin.left, pageHeight - 10);
        const pageNumber = `Halaman ${doc.internal.pages.length - 1}`;
        doc.text(pageNumber, pageWidth - data.settings.margin.right - doc.getTextWidth(pageNumber), pageHeight - 10);
      }
    });

    saveBlob(doc, `Laporan_Kontrol_Stok_dan_Penggunaan_Bahan_${new Date().toLocaleDateString()}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert(`Terjadi kesalahan sistem saat mengekspor PDF.\n\nError Log: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  } finally {
    hideLoadingOverlay(overlay);
  }
};

export const handleExportRecipePDF = (recipe: Recipe, ingredients: Ingredient[]) => {
  const overlay = showLoadingOverlay();
  try {
    const doc = new jsPDF({ compress: true, orientation: 'p', unit: 'mm', format: 'a4' });
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
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [243, 244, 246] },
      styles: { fontSize: 9, cellPadding: 3, textColor: [30, 41, 59] },
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
      
      doc.setFillColor(243, 244, 246);
      doc.rect(12, breakdownY - 4, pageWidth - 24, 18, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
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
      
      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'italic');
      doc.text('Pawon Salam Resto', 14, pageHeight - 10);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const pageNumber = `Halaman ${i}`;
      doc.text(pageNumber, pageWidth - 14 - doc.getTextWidth(pageNumber), pageHeight - 10);
    }

    saveBlob(doc, `Resep_${recipe.name}_${new Date().toLocaleDateString()}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert(`Terjadi kesalahan sistem saat mengekspor PDF.\n\nError Log: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  } finally {
    hideLoadingOverlay(overlay);
  }
};

export const handleExportClosingPDF = async (reportRef: React.RefObject<HTMLDivElement>) => {
  if (!reportRef.current) return;
  const overlay = showLoadingOverlay();
  try {
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      onclone: applyOklchFix
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [57, (canvas.height * 57) / canvas.width],
      compress: true
    });
    
    pdf.addImage(imgData, "PNG", 0, 0, 57, (canvas.height * 57) / canvas.width);
    saveBlob(pdf, `closing-report-${new Date().toLocaleDateString()}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert(`Terjadi kesalahan sistem saat mengekspor PDF.\n\nError Log: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  } finally {
    hideLoadingOverlay(overlay);
  }
};

export const handleExportShiftPDF = async (gridRef: React.RefObject<HTMLDivElement>, currentDate: Date) => {
  if (!gridRef.current) return;
  const overlay = showLoadingOverlay();
  try {
    const canvas = await html2canvas(gridRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      onclone: applyOklchFix
    });
    
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ compress: true, orientation: 'l', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const periodString = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text("Jadwal Shift Karyawan Pawon Salam Resto", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${periodString}`, 14, 22);

    // Table Auto-Scaling
    const margin = 14;
    const maxImgWidth = pageWidth - (margin * 2);
    const maxImgHeight = pageHeight - 45;
    let imgWidth = maxImgWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    if (imgHeight > maxImgHeight) {
      imgHeight = maxImgHeight;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }
    const xPos = (pageWidth - imgWidth) / 2;
    doc.addImage(imgData, 'PNG', xPos, 30, imgWidth, imgHeight);

    // Footer
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.text('Pawon Salam Resto', 14, pageHeight - 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const pageNumber = "Halaman 1";
    doc.text(pageNumber, pageWidth - 14 - doc.getTextWidth(pageNumber), pageHeight - 10);
    
    saveBlob(doc, `Jadwal_Shift_${periodString.replace(/\s/g, '_')}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert(`Terjadi kesalahan sistem saat mengekspor PDF.\n\nError Log: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  } finally {
    hideLoadingOverlay(overlay);
  }
};

export const handleExportPatternPDF = async (patternRef: React.RefObject<HTMLDivElement>) => {
  if (!patternRef.current) return;
  const overlay = showLoadingOverlay();
  try {
    const canvas = await html2canvas(patternRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      onclone: applyOklchFix
    });
    
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ compress: true, orientation: 'l', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text("Pola Jadwal Mingguan Standar", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text("Pawon Salam Resto", 14, 22);

    const margin = 14;
    const maxImgWidth = pageWidth - (margin * 2);
    const maxImgHeight = pageHeight - 45; 
    let imgWidth = maxImgWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;
    if (imgHeight > maxImgHeight) {
      imgHeight = maxImgHeight;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }
    const xPos = (pageWidth - imgWidth) / 2;
    doc.addImage(imgData, 'PNG', xPos, 30, imgWidth, imgHeight);

    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.text('Pawon Salam Resto', 14, pageHeight - 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const pageNumber = "Halaman 1";
    doc.text(pageNumber, pageWidth - 14 - doc.getTextWidth(pageNumber), pageHeight - 10);

    saveBlob(doc, `Pola_Jadwal_Mingguan.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert(`Terjadi kesalahan sistem saat mengekspor PDF.\n\nError Log: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  } finally {
    hideLoadingOverlay(overlay);
  }
};

export const handleExportSlipPDF = (employee: Employee | null) => {
  if (!employee) return;
  const overlay = showLoadingOverlay();
  try {
    const doc = new jsPDF({ compress: true, orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const periodString = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    // Header
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - 14, 12, { align: 'right' });

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('SLIP GAJI KARYAWAN', pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`PAWON SALAM RESTO`, pageWidth / 2, 34, { align: 'center' });
    doc.text(`Periode: ${periodString}`, pageWidth / 2, 40, { align: 'center' });

    // Employee Info Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 50, pageWidth - 28, 30, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'bold');
    doc.text('PENERIMA', 20, 58);
    doc.text('ROLE / JABATAN', 20, 70);
    doc.text('ID KARYAWAN', pageWidth / 2, 58);
    doc.text('STATUS', pageWidth / 2, 70);

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(employee.name.toUpperCase(), 20, 63);
    doc.text(employee.role.toUpperCase(), 20, 75);
    doc.text(`#ELV-${employee.id.split('-')[0].toUpperCase()}`, pageWidth / 2, 63);
    doc.text('FULL TIME', pageWidth / 2, 75);

    // Salary Table
    const tableData = [
      ['Gaji Pokok Dasar', formatCurrency(employee.salary)],
      ['Tunjangan Operasional', formatCurrency(0)],
      ['Bonus Prestasi / Insentif', formatCurrency(0)]
    ];

    autoTable(doc, {
      startY: 90,
      head: [['Deskripsi Komponen', 'Jumlah (IDR)']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
      }
    });

    // Total Section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(14, finalY, pageWidth - 28, 20, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('NET TAKE HOME PAY (TOTAL PENERIMAAN)', 20, finalY + 12);
    
    doc.setFontSize(14);
    doc.text(formatCurrency(employee.salary), pageWidth - 20, finalY + 13, { align: 'right' });

    // Signature Area
    const sigY = finalY + 40;
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Disetujui Oleh,', 20, sigY);
    doc.text('Manajemen Pawon Salam Resto', 20, sigY + 25);
    doc.line(20, sigY + 20, 70, sigY + 20);

    doc.text('Diterima Oleh,', pageWidth - 70, sigY);
    doc.text(employee.name.toUpperCase(), pageWidth - 70, sigY + 25);
    doc.line(pageWidth - 70, sigY + 20, pageWidth - 20, sigY + 20);

    // Footer Branding
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.text('Pawon Salam Resto', 14, pageHeight - 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Halaman 1', pageWidth - 14 - doc.getTextWidth('Halaman 1'), pageHeight - 10);

    saveBlob(doc, `Slip_Gaji_${employee.name.replace(/\s/g, '_')}_${periodString.replace(/\s/g, '_')}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    alert(`Terjadi kesalahan sistem saat mengekspor PDF.\n\nError Log: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  } finally {
    hideLoadingOverlay(overlay);
  }
};

export interface SavePDFParams {
  headerSelector?: string;
  tableData: any[][];
  tableHeaders: string[];
  reportTitle: string;
}

export const savePDF = async ({ headerSelector = '#header', tableData, tableHeaders, reportTitle }: SavePDFParams) => {
  const overlay = showLoadingOverlay();
  try {
    const doc = new jsPDF({ compress: true, orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let startY = 15;

    const headerEl = document.querySelector(headerSelector) as HTMLElement;
    if (headerEl) {
      const canvas = await html2canvas(headerEl, {
        scale: 1,
        useCORS: true,
        onclone: applyOklchFix
      });
      
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - 20; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      startY = 10 + imgHeight + 10;
    } else {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(reportTitle, pageWidth / 2, startY, { align: 'center' });
      startY += 15;
    }

    autoTable(doc, {
      startY,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [243, 244, 246] },
      styles: { fontSize: 9, cellPadding: 3, textColor: [30, 41, 59] },
      didDrawPage: (data) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        
        const timestamp = new Date().toLocaleString('id-ID');
        const pageText = `Halaman ${doc.internal.pages.length - 1}`;
        
        doc.text(timestamp, data.settings.margin.left, pageHeight - 10);
        doc.text(pageText, pageWidth - data.settings.margin.right - doc.getTextWidth(pageText), pageHeight - 10);
      }
    });

    saveBlob(doc, 'report.pdf');
  } catch (err: any) {
    console.error("PDF Export Error:", err);
    alert(`Terjadi kesalahan sistem saat mengekspor PDF.\n\nError Log: ${err instanceof Error ? err.stack || err.message : String(err)}`);
  } finally {
    hideLoadingOverlay(overlay);
  }
};
