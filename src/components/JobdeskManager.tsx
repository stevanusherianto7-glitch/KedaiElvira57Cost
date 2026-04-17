import * as React from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Trash2, 
  Edit2,
  ChevronRight,
  ChevronLeft,
  FileDown,
  Save,
  Package,
  UtensilsCrossed,
  Users,
  CheckCircle2,
  Printer,
  Zap,
  Wallet,
  History,
  Calculator,
  Receipt
} from "lucide-react";
import { Employee } from "../types";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { JOBDESK_MARKDOWN } from "../constants";

interface JobdeskManagerProps {
  employees: Employee[];
  karyawanTab: 'data' | 'jobdesk' | 'slip';
  setKaryawanTab: (val: 'data' | 'jobdesk' | 'slip') => void;
  isAddingEmployee: boolean;
  setIsAddingEmployee: (val: boolean) => void;
  newEmployee: Partial<Employee>;
  setNewEmployee: (val: Partial<Employee>) => void;
  handleSaveEmployee: () => void;
  deleteEmployee: (id: string) => void;
  selectedTasks: string[];
  toggleTask: (task: string) => void;
  reportTitle: string;
  setReportTitle: (val: string) => void;
  handleExportJobdeskPDF: () => void;
  generateFilteredMarkdown: () => string;
  selectedEmployeeForSlip: Employee | null;
  setSelectedEmployeeForSlip: (val: Employee | null) => void;
}

export const JobdeskManager: React.FC<JobdeskManagerProps> = ({
  employees,
  karyawanTab,
  setKaryawanTab,
  isAddingEmployee,
  setIsAddingEmployee,
  newEmployee,
  setNewEmployee,
  handleSaveEmployee,
  deleteEmployee,
  selectedTasks,
  toggleTask,
  reportTitle,
  setReportTitle,
  handleExportJobdeskPDF,
  generateFilteredMarkdown,
  selectedEmployeeForSlip,
  setSelectedEmployeeForSlip
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Manajemen SDM</h2>
          <p className="text-slate-500 font-medium text-sm">Kelola data karyawan, pembagian tugas (SPO), dan slip gaji.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation & Employee List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <button 
              onClick={() => setKaryawanTab('data')}
              className={cn(
                "w-full px-6 py-3 rounded-xl text-sm font-bold transition-all text-left flex items-center gap-3",
                karyawanTab === 'data' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <Users className="w-4 h-4" />
              Data Karyawan
            </button>
            <button 
              onClick={() => setKaryawanTab('jobdesk')}
              className={cn(
                "w-full px-6 py-3 rounded-xl text-sm font-bold transition-all text-left flex items-center gap-3",
                karyawanTab === 'jobdesk' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <Zap className="w-4 h-4" />
              Jobdesk (SPO)
            </button>
            <button 
              onClick={() => setKaryawanTab('slip')}
              className={cn(
                "w-full px-6 py-3 rounded-xl text-sm font-bold transition-all text-left flex items-center gap-3",
                karyawanTab === 'slip' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <Receipt className="w-4 h-4" />
              Slip Gaji
            </button>
            
            <Dialog open={isAddingEmployee} onOpenChange={setIsAddingEmployee}>
              <DialogTrigger render={
                <button className="w-full mt-2 flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 font-bold hover:bg-emerald-700 transition-all active:scale-95 text-sm">
                  <Plus className="w-4 h-4" />
                  Tambah Karyawan
                </button>
              } />
              <DialogContent className="max-w-md mx-auto rounded-3xl">
                <DialogHeader className="px-4 pt-4">
                  <DialogTitle className="text-xl font-bold text-slate-900">Data Karyawan Baru</DialogTitle>
                  <DialogDescription className="text-slate-500 text-xs">Lengkapi informasi dasar karyawan.</DialogDescription>
                </DialogHeader>
                <div className="p-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                    <Input 
                      placeholder="Contoh: Budi Santoso" 
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      className="h-12 rounded-xl border-slate-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posisi / Jabatan</label>
                    <Input 
                      placeholder="Contoh: Head Chef / Kasir" 
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                      className="h-12 rounded-xl border-slate-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gaji Pokok (Rp)</label>
                    <Input 
                      type="number"
                      value={newEmployee.salary || ""}
                      onChange={(e) => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
                      className="h-12 rounded-xl border-slate-100 font-bold text-lg"
                    />
                  </div>
                </div>
                <DialogFooter className="p-4 border-t border-slate-50 gap-3">
                  <Button onClick={handleSaveEmployee} className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 font-bold">
                    Simpan Data
                  </Button>
                  <button onClick={() => setIsAddingEmployee(false)} className="h-11 px-6 rounded-xl font-bold bg-slate-100 text-slate-600">
                    Batal
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {employees.map(emp => (
              <Card 
                key={emp.id} 
                className={cn(
                  "border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all group rounded-xl cursor-pointer",
                  selectedEmployeeForSlip?.id === emp.id && karyawanTab === 'slip' ? "ring-2 ring-emerald-500" : ""
                )}
                onClick={() => {
                  if (karyawanTab === 'slip') {
                    setSelectedEmployeeForSlip(emp);
                  }
                }}
              >
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <Users className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); /* edit functionality */ }} className="p-1.5 text-slate-300 hover:text-emerald-600 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteEmployee(emp.id); }} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-slate-900 truncate leading-tight">{emp.name}</h3>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{emp.role}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-900">{formatCurrency(emp.salary)}</p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployeeForSlip(emp);
                        setKaryawanTab('slip');
                      }}
                      className="p-1 text-slate-300 hover:text-emerald-600 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Content Area (Right) */}
        <div className="lg:col-span-9">
          {karyawanTab === 'data' && (
            <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-50 space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-slate-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Manajemen Data Karyawan</h3>
                <p className="text-slate-400 font-medium text-sm mt-1">Gunakan panel di sebelah kiri untuk menambah, mengubah, atau menghapus data karyawan.</p>
              </div>
            </div>
          )}

          {karyawanTab === 'jobdesk' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-4 space-y-6">
                <Card className="border-none shadow-sm bg-white rounded-2xl p-6 space-y-6">
                  <h3 className="font-bold text-slate-900 tracking-tight">Kustomisasi Laporan</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Judul Laporan</label>
                      <Input 
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="h-12 rounded-xl border-slate-100 font-bold"
                      />
                    </div>
                    <Button 
                      onClick={handleExportJobdeskPDF}
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 rounded-xl font-bold"
                    >
                      <FileDown className="w-5 h-5 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </Card>

                <Card className="border-none shadow-sm bg-white rounded-2xl p-6 space-y-4">
                  <h3 className="font-bold text-slate-900 tracking-tight">Filter Tugas</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {JOBDESK_MARKDOWN.split('\n')
                      .filter(line => line.includes('* [ ]'))
                      .map((line, idx) => {
                        const taskName = line.replace('* [ ]', '').trim();
                        return (
                          <label key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                            <input 
                              type="checkbox" 
                              checked={selectedTasks.includes(taskName)}
                              onChange={() => toggleTask(taskName)}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-medium text-slate-600">{taskName}</span>
                          </label>
                        );
                      })}
                  </div>
                </Card>
              </div>

              <div className="xl:col-span-8">
                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                  <div className="p-8 prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base no-scrollbar">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {generateFilteredMarkdown()}
                    </Markdown>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {karyawanTab === 'slip' && (
            <div className="space-y-8">
              {selectedEmployeeForSlip ? (
                <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden max-w-2xl mx-auto">
                  <div className="p-12 space-y-8">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">SLIP GAJI KARYAWAN</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Periode: {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-50">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Karyawan</p>
                          <p className="font-bold text-slate-900">{selectedEmployeeForSlip.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jabatan</p>
                          <p className="font-bold text-slate-900">{selectedEmployeeForSlip.role}</p>
                        </div>
                      </div>
                      <div className="space-y-4 text-right">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Karyawan</p>
                          <p className="font-bold text-slate-900">#{selectedEmployeeForSlip.id.toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold">AKTIF</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Gaji Pokok</span>
                        <span className="font-bold text-slate-900">{formatCurrency(selectedEmployeeForSlip.salary)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Tunjangan Makan</span>
                        <span className="font-bold text-slate-900">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Bonus / Insentif</span>
                        <span className="font-bold text-slate-900">{formatCurrency(0)}</span>
                      </div>
                      <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-900">TAKE HOME PAY</span>
                        <span className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedEmployeeForSlip.salary)}</span>
                      </div>
                    </div>

                    <div className="pt-8 flex gap-4">
                      <Button className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 font-bold">
                        <Printer className="w-5 h-5 mr-2" />
                        Cetak Slip
                      </Button>
                      <Button className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold">
                        <FileDown className="w-5 h-5 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-50 space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Pilih Karyawan di samping Untuk Melihat Slip</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
