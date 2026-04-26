"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { expenseKeys } from "@/hooks/useExpenses";
import { budgetKeys } from "@/hooks/useBudget";
import { analyticsKeys } from "@/hooks/useAnalytics";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

const CSV_TEMPLATE = `date,amount,category,subcategory,merchant,note,payment_mode,tags
2026-04-01,350,food,,Swiggy,Lunch,upi,lunch
2026-04-02,1200,transport,,Uber,Monthly pass,upi,commute
2026-04-03,500,shopping,,Amazon,,card,`;

export default function ImportCSVModal({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post<ImportResult>("/expenses/import/csv", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      if (data.imported > 0) {
        qc.invalidateQueries({ queryKey: expenseKeys.all });
        qc.invalidateQueries({ queryKey: budgetKeys.all });
        qc.invalidateQueries({ queryKey: analyticsKeys.all });
        toast.success(`${data.imported} expenses imported!`);
      }
    } catch {
      toast.error("Import failed. Please check your file format.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await api.get("/expenses/export/csv", { responseType: "blob" });
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "spendwise_expenses.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed");
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spendwise_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
            className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
          >
            <div className="glass-card rounded-t-2xl sm:rounded-2xl p-6 border border-white/10 bg-surface-dark">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">Import / Export</h2>
                <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Export + template */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-white/10 hover:border-secondary/40 text-gray-300 hover:text-secondary text-sm py-2 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" /> Export CSV
                </button>
                <button
                  onClick={downloadTemplate}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-white/10 hover:border-primary/40 text-gray-300 hover:text-primary text-sm py-2 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" /> Template
                </button>
              </div>

              {/* Drop zone */}
              {!result && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragging
                      ? "border-primary bg-primary/5"
                      : file
                      ? "border-secondary/40 bg-secondary/5"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv"
                    className="sr-only"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  {file ? (
                    <>
                      <FileText className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <p className="text-sm text-white font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-white">Drop CSV file here</p>
                      <p className="text-xs text-gray-500 mt-0.5">or click to browse</p>
                    </>
                  )}
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-secondary/10 border border-secondary/20 rounded-xl p-3 text-center">
                      <CheckCircle2 className="w-5 h-5 text-secondary mx-auto mb-1" />
                      <p className="text-lg font-bold text-white">{result.imported}</p>
                      <p className="text-xs text-gray-500">Imported</p>
                    </div>
                    {result.skipped > 0 && (
                      <div className="flex-1 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 text-center">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">{result.skipped}</p>
                        <p className="text-xs text-gray-500">Skipped</p>
                      </div>
                    )}
                  </div>
                  {result.errors.length > 0 && (
                    <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-3 max-h-32 overflow-y-auto">
                      {result.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-400 py-0.5">{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action button */}
              {!result && (
                <motion.button
                  onClick={handleImport}
                  disabled={!file || loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Import Expenses</>
                  )}
                </motion.button>
              )}

              {result && (
                <button
                  onClick={handleClose}
                  className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
