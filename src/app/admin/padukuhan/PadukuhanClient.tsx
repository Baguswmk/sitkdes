"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, RefreshCw } from "lucide-react";
import { Padukuhan } from "@prisma/client";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";

type PadukuhanWithCount = Padukuhan & { _count: { tanahKas: number } };

export function PadukuhanClient({ initialData }: { initialData: PadukuhanWithCount[] }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data, refetch, isLoading } = trpc.padukuhan.listAdmin.useQuery(undefined, {
    initialData,
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const rawData = data || [];
  const totalPages = Math.max(1, Math.ceil(rawData.length / itemsPerPage));
  const pageData = rawData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    deskripsi: "",
    urutan: 0,
    isActive: true,
  });

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const createMutation = trpc.padukuhan.create.useMutation({
    onSuccess: () => {
      toast.success("Padukuhan berhasil ditambahkan");
      setIsModalOpen(false);
      refetch();
    },
    onError: (err) => toast.error(`Gagal: ${err.message}`)
  });

  const updateMutation = trpc.padukuhan.update.useMutation({
    onSuccess: () => {
      toast.success("Padukuhan berhasil diperbarui");
      setIsModalOpen(false);
      refetch();
    },
    onError: (err) => toast.error(`Gagal: ${err.message}`)
  });

  const deleteMutation = trpc.padukuhan.delete.useMutation({
    onSuccess: () => {
      toast.success("Padukuhan berhasil dihapus");
      setDeleteId(null);
      refetch();
    },
    onError: (err) => {
      toast.error(`Gagal menghapus: ${err.message}`);
      setDeleteId(null);
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ nama: "", kode: "", deskripsi: "", urutan: (data?.length || 0) + 1, isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PadukuhanWithCount) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      kode: item.kode || "",
      deskripsi: item.deskripsi || "",
      urutan: item.urutan,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="animate-fadeUp">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="section-title-heritage" style={{ margin: 0 }}>KELOLA PADUKUHAN</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Refresh data terbaru"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: "transparent",
              border: "1.5px solid var(--gold-500)",
              borderRadius: 6,
              cursor: (isRefreshing || isLoading) ? "not-allowed" : "pointer",
              fontFamily: '"Cinzel", serif',
              fontWeight: 600,
              fontSize: 12,
              color: "var(--navy-800)",
              letterSpacing: 0.5,
              opacity: (isRefreshing || isLoading) ? 0.6 : 1,
            }}
          >
            <RefreshCw size={14} style={{ animation: (isRefreshing || isLoading) ? "spin 0.8s linear infinite" : "none" }} />
            {isRefreshing ? "MEMUAT..." : "REFRESH"}
          </button>
          <button onClick={handleOpenCreate} className="btn-heritage" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Plus size={16} /> TAMBAH DATA
          </button>
        </div>
      </div>

      <div className="card-heritage" style={{ overflow: "hidden" }}>
        <table className="tbl-heritage" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>Urutan</th>
              <th style={{ textAlign: "left" }}>Kode</th>
              <th style={{ textAlign: "left" }}>Nama Padukuhan</th>
              <th>Jml TKD</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((item, idx) => (
              <tr key={item.id}>
                <td>{(page - 1) * itemsPerPage + idx + 1}</td>
                <td style={{ textAlign: "left", fontWeight: 600 }}>{item.kode || "-"}</td>
                <td style={{ textAlign: "left" }}>{item.nama}</td>
                <td>{item._count?.tanahKas || 0}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {item.isActive ? "Aktif" : "Non-Aktif"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    <button onClick={() => handleOpenEdit(item)} style={{ color: "var(--gold-600)", background: "none", border: "none", cursor: "pointer" }} title="Edit">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => setDeleteId(item.id)} style={{ color: "#c62828", background: "none", border: "none", cursor: "pointer" }} title="Hapus">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "40px 0", fontStyle: "italic", textAlign: "center" }}>Tidak ada data padukuhan.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={rawData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          itemName="padukuhan"
        />
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999, background: "rgba(10, 15, 40, 0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeIn 0.15s ease"
        }}>
          <div style={{
            background: "var(--cream-50, #fffbf0)", border: "2px solid var(--gold-500, #c9a84c)", borderRadius: 12,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)", width: "100%", maxWidth: 500, animation: "slideUp 0.2s ease",
            display: "flex", flexDirection: "column", maxHeight: "90vh"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(160,125,47,.2)" }}>
              <div style={{ fontFamily: '"Cinzel", serif', fontWeight: 700, fontSize: 18, color: "var(--navy-900)" }}>
                {editingId ? "Edit Padukuhan" : "Tambah Padukuhan"}
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)" }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: "24px", overflowY: "auto" }}>
              <form id="padukuhan-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="label-heritage">Nama Padukuhan <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="input-heritage" />
                </div>
                <div>
                  <label className="label-heritage">Kode</label>
                  <input type="text" value={formData.kode} onChange={(e) => setFormData({...formData, kode: e.target.value})} className="input-heritage" />
                </div>
                <div>
                  <label className="label-heritage">Urutan Tampil</label>
                  <input type="number" min="0" value={formData.urutan} onChange={(e) => setFormData({...formData, urutan: parseInt(e.target.value) || 0})} className="input-heritage" />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: '"Manrope", sans-serif', fontSize: 14 }}>
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} style={{ width: 16, height: 16, accentColor: "var(--gold-600)" }} />
                  Padukuhan Aktif
                </label>
              </form>
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(160,125,47,.2)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-heritage-pill" style={{ background: "transparent", color: "var(--navy-800)" }}>
                Batal
              </button>
              <button type="submit" form="padukuhan-form" disabled={isSaving} className="btn-heritage">
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Hapus Padukuhan"
        message="Apakah Anda yakin ingin menghapus padukuhan ini? Tindakan ini tidak dapat dibatalkan. Padukuhan yang memiliki data TKD tidak dapat dihapus."
        confirmLabel={deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
        confirmVariant="danger"
        onConfirm={() => deleteId && deleteMutation.mutate({ id: deleteId })}
        onCancel={() => setDeleteId(null)}
      />
      
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
