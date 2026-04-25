"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({
  open, onClose, title = "Delete", description, confirmLabel = "Delete", onConfirm,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" hideHeader>
      <div className="p-6">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-12 h-12 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-4"
        >
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </motion.div>
        <h3 className="text-white font-semibold text-base text-center mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-400 text-center mb-5">{description}</p>
        )}
        {!description && <div className="mb-5" />}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
