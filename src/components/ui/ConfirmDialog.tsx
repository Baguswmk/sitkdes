"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "primary" | "success";
  onConfirm: () => void;
  onCancel: () => void;
  /** Optional: extra content below message (e.g. a textarea for rejection reason) */
  children?: React.ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const CONFIRM_BG: Record<string, string> = {
    danger: "#c62828",
    primary: "var(--navy-800)",
    success: "#2e7d32",
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 15, 40, 0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        ref={dialogRef}
        style={{
          background: "var(--cream-50, #fffbf0)",
          border: "2px solid var(--gold-500, #c9a84c)",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: 440,
          padding: "28px 28px 24px",
          animation: "slideUp 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div
            style={{
              fontFamily: '"Cinzel", serif',
              fontWeight: 700,
              fontSize: 17,
              color: "var(--navy-900)",
              letterSpacing: 0.5,
              lineHeight: 1.3,
              flex: 1,
              paddingRight: 12,
            }}
          >
            {title}
          </div>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-soft)",
              padding: 4,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(160,125,47,.25)", marginBottom: 16 }} />

        {/* Message */}
        <p
          style={{
            fontFamily: '"Manrope", sans-serif',
            fontSize: 14,
            color: "var(--ink-soft)",
            lineHeight: 1.6,
            marginBottom: children ? 16 : 24,
          }}
        >
          {message}
        </p>

        {/* Optional extra content (e.g. textarea) */}
        {children && <div style={{ marginBottom: 24 }}>{children}</div>}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px",
              background: "transparent",
              border: "1.5px solid var(--gold-500)",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: '"Cinzel", serif',
              fontWeight: 600,
              fontSize: 13,
              color: "var(--navy-800)",
              letterSpacing: 0.5,
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 18px",
              background: CONFIRM_BG[confirmVariant],
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: '"Cinzel", serif',
              fontWeight: 600,
              fontSize: 13,
              color: "white",
              letterSpacing: 0.5,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
