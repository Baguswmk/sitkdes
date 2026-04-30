"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function TkdActionButtons({ tkdId }: { tkdId: string }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Dialog state
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const approveMutation = trpc.tkd.approve.useMutation({
    onSuccess: () => {
      toast.success("Data TKD berhasil disetujui!");
      router.refresh();
      setIsProcessing(false);
    },
    onError: (err) => {
      toast.error(`Gagal menyetujui: ${err.message}`);
      setIsProcessing(false);
    },
  });

  const rejectMutation = trpc.tkd.reject.useMutation({
    onSuccess: () => {
      toast.success("Data TKD berhasil ditolak.");
      router.refresh();
      setIsProcessing(false);
    },
    onError: (err) => {
      toast.error(`Gagal menolak: ${err.message}`);
      setIsProcessing(false);
    },
  });

  const handleConfirmApprove = () => {
    setShowApprove(false);
    setIsProcessing(true);
    approveMutation.mutate({ id: tkdId, notes: "Disetujui oleh Admin" });
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError("Alasan penolakan wajib diisi.");
      return;
    }
    setShowReject(false);
    setIsProcessing(true);
    rejectMutation.mutate({ id: tkdId, reason: rejectReason.trim() });
    setRejectReason("");
    setRejectError("");
  };

  return (
    <>
      {/* Tombol Tolak */}
      <button
        onClick={() => { setRejectReason(""); setRejectError(""); setShowReject(true); }}
        disabled={isProcessing}
        style={{
          background: "#c62828",
          color: "white",
          padding: "8px 16px",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "none",
          cursor: isProcessing ? "not-allowed" : "pointer",
          fontFamily: '"Cinzel", serif',
          fontWeight: 600,
          fontSize: 13,
          opacity: isProcessing ? 0.6 : 1,
        }}
      >
        <XCircle size={16} /> Tolak
      </button>

      {/* Tombol Setujui */}
      <button
        onClick={() => setShowApprove(true)}
        disabled={isProcessing}
        style={{
          background: "#2e7d32",
          color: "white",
          padding: "8px 16px",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "none",
          cursor: isProcessing ? "not-allowed" : "pointer",
          fontFamily: '"Cinzel", serif',
          fontWeight: 600,
          fontSize: 13,
          opacity: isProcessing ? 0.6 : 1,
        }}
      >
        <CheckCircle size={16} /> Setujui
      </button>

      {/* Dialog Konfirmasi Setujui */}
      <ConfirmDialog
        open={showApprove}
        title="Setujui Data TKD"
        message="Apakah Anda yakin ingin MENYETUJUI data TKD ini? Data akan dipublikasikan dan bisa dilihat secara umum."
        confirmLabel="Ya, Setujui"
        confirmVariant="success"
        onConfirm={handleConfirmApprove}
        onCancel={() => setShowApprove(false)}
      />

      {/* Dialog Konfirmasi Tolak */}
      <ConfirmDialog
        open={showReject}
        title="Tolak Data TKD"
        message="Masukkan alasan penolakan agar operator dapat memperbaiki data:"
        confirmLabel="Ya, Tolak"
        confirmVariant="danger"
        onConfirm={handleConfirmReject}
        onCancel={() => setShowReject(false)}
      >
        <div>
          <textarea
            value={rejectReason}
            onChange={(e) => { setRejectReason(e.target.value); setRejectError(""); }}
            placeholder="Contoh: Koordinat tidak akurat, perlu diperbaiki..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: rejectError
                ? "1.5px solid #c62828"
                : "1.5px solid rgba(160,125,47,.4)",
              fontFamily: '"Manrope", sans-serif',
              fontSize: 14,
              resize: "vertical",
              outline: "none",
              background: "rgba(255,251,240,.8)",
              boxSizing: "border-box",
            }}
          />
          {rejectError && (
            <p style={{ color: "#c62828", fontSize: 12, marginTop: 4, fontFamily: '"Manrope", sans-serif' }}>
              {rejectError}
            </p>
          )}
        </div>
      </ConfirmDialog>
    </>
  );
}
