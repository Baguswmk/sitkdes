"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function TkdActionButtons({ tkdId }: { tkdId: string }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleApprove = () => {
    if (confirm("Apakah Anda yakin ingin MENYETUJUI data TKD ini?")) {
      setIsProcessing(true);
      approveMutation.mutate({ id: tkdId, notes: "Disetujui oleh Admin" });
    }
  };

  const handleReject = () => {
    const reason = window.prompt("Masukkan alasan penolakan:");
    if (reason) {
      setIsProcessing(true);
      rejectMutation.mutate({ id: tkdId, reason });
    }
  };

  return (
    <>
      <button
        onClick={handleReject}
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
          opacity: isProcessing ? 0.6 : 1,
        }}
      >
        <XCircle size={16} /> Tolak
      </button>
      <button
        onClick={handleApprove}
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
          opacity: isProcessing ? 0.6 : 1,
        }}
      >
        <CheckCircle size={16} /> Setujui
      </button>
    </>
  );
}
