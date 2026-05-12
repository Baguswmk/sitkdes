"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, RefreshCw, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { StatusData, JenisTanah, UserRole } from "@prisma/client";

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-200 text-gray-700",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const JENIS_LABEL: Record<string, string> = {
  TANAH_KAS: "Tanah Kas",
  PELUNGGUH: "Pelungguh",
  PENGAREM_AREM: "Pengarem-arem",
  LAINNYA: "Lainnya",
};

export function TkdListClient({
  padukuhanOptions,
  userRole,
}: {
  padukuhanOptions: { id: string; nama: string }[];
  userRole: UserRole;
}) {
  const [page, setPage] = useState(1);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusData | "">("");
  const [jenisTanah, setJenisTanah] = useState<JenisTanah | "">("");
  const [padukuhanId, setPadukuhanId] = useState("");

  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, refetch } = trpc.tkd.listAdmin.useQuery({
    page,
    perPage: 10,
    search: search || undefined,
    status: (status as StatusData) || undefined,
    jenisTanah: (jenisTanah as JenisTanah) || undefined,
    padukuhanId: padukuhanId || undefined,
  });

  const deleteMutation = trpc.tkd.delete.useMutation({
    onSuccess: () => {
      toast.success("Data TKD berhasil dihapus");
      refetch();
      setShowDelete(false);
    },
    onError: (err) => {
      toast.error(`Gagal menghapus: ${err.message}`);
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <div className="animate-fadeUp">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div className="section-title-heritage" style={{ margin: 0 }}>
          DATA TANAH KAS DESA
        </div>
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
              cursor: isRefreshing || isLoading ? "not-allowed" : "pointer",
              fontFamily: '"Cinzel", serif',
              fontWeight: 600,
              fontSize: 12,
              color: "var(--navy-800)",
              letterSpacing: 0.5,
              opacity: isRefreshing || isLoading ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation:
                  isRefreshing || isLoading
                    ? "spin 0.8s linear infinite"
                    : "none",
              }}
            />
            {isRefreshing ? "MEMUAT..." : "REFRESH"}
          </button>
          <Link
            href="/admin/tkd/create"
            className="btn-heritage"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={16} /> TAMBAH DATA
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Filters */}
      <div
        className="card-heritage"
        style={{
          padding: 20,
          marginBottom: 24,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <div className="label-heritage">Pencarian</div>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Nama TKD..."
              className="input-heritage"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: 36 }}
            />
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--ink-soft)",
              }}
            />
          </div>
        </div>

        <div style={{ flex: "1 1 150px" }}>
          <div className="label-heritage">Status</div>
          <select
            className="select-heritage"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusData);
              setPage(1);
            }}
          >
            <option value="">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Menunggu Review</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        <div style={{ flex: "1 1 150px" }}>
          <div className="label-heritage">Jenis Tanah</div>
          <select
            className="select-heritage"
            value={jenisTanah}
            onChange={(e) => {
              setJenisTanah(e.target.value as JenisTanah);
              setPage(1);
            }}
          >
            <option value="">Semua Jenis</option>
            <option value="TANAH_KAS">Tanah Kas</option>
            <option value="PELUNGGUH">Pelungguh</option>
            <option value="PENGAREM_AREM">Pengarem-arem</option>
          </select>
        </div>

        <div style={{ flex: "1 1 150px" }}>
          <div className="label-heritage">Padukuhan</div>
          <select
            className="select-heritage"
            value={padukuhanId}
            onChange={(e) => {
              setPadukuhanId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Padukuhan</option>
            {padukuhanOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-heritage" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl-heritage" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th style={{ textAlign: "left" }}>Jenis Tanah Kalurahan</th>
                <th style={{ textAlign: "left" }}>Lokasi</th>
                <th>Luas</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "40px 0", fontStyle: "italic" }}
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: "40px 0", fontStyle: "italic" }}
                  >
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                data?.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{(page - 1) * 10 + idx + 1}</td>
                    <td style={{ textAlign: "left" }}>
                      <div>{JENIS_LABEL[item.jenisTanah]}</div>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 500 }}>
                        {item.padukuhan.nama}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                        {item.luasHa.toFixed(4)} Ha
                      </div>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[item.status]}`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <Link
                          href={`/admin/tkd/${item.id}`}
                          style={{ color: "var(--navy-600)" }}
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </Link>
                        {(userRole === UserRole.ADMIN_DESA ||
                          userRole === UserRole.SUPER_ADMIN) && (
                          <Link
                            href={`/admin/tkd/${item.id}/edit`}
                            style={{ color: "var(--gold-600)" }}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                        )}
                        {(userRole === UserRole.ADMIN_DESA ||
                          userRole === UserRole.SUPER_ADMIN) && (
                          <button
                            onClick={() => {
                              setDeleteId(item.id);
                              setShowDelete(true);
                            }}
                            style={{
                              color: "#c62828",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                            }}
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            totalItems={data.total}
            itemsPerPage={10}
            onPageChange={setPage}
            itemName="data TKD"
          />
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Hapus Data TKD"
        message="Apakah Anda yakin ingin menghapus data TKD ini? Data yang dihapus tidak akan ditampilkan lagi (soft delete)."
        confirmLabel="Ya, Hapus"
        confirmVariant="danger"
        onConfirm={() => deleteMutation.mutate({ id: deleteId })}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
