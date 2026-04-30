"use client";

import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function TkdSubmitButton({ tkdId }: { tkdId: string }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const submitMutation = trpc.tkd.submit.useMutation({
    onSuccess: () => {
      toast.success("Data berhasil diajukan untuk review!");
      router.refresh();
      setIsProcessing(false);
    },
    onError: (err) => {
      toast.error(`Gagal mengajukan: ${err.message}`);
      setIsProcessing(false);
    },
  });

  const handleConfirm = () => {
    setShowDialog(false);
    setIsProcessing(true);
    submitMutation.mutate({ id: tkdId });
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={isProcessing}
        style={{
          background: "var(--navy-800)",
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
        <SendHorizonal size={16} /> {isProcessing ? "Mengajukan..." : "Ajukan Review"}
      </button>

      <ConfirmDialog
        open={showDialog}
        title="Ajukan untuk Review"
        message="Data akan dikirim ke Admin untuk ditinjau. Setelah diajukan, data tidak dapat diedit sampai Admin memberikan keputusan. Lanjutkan?"
        confirmLabel="Ya, Ajukan"
        confirmVariant="primary"
        onConfirm={handleConfirm}
        onCancel={() => setShowDialog(false)}
      />
    </>
  );
}
