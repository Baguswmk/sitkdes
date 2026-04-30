"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { StatusData, JenisTanah } from "@prisma/client";
import { toast } from "sonner";

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

export function TkdListClient({ padukuhanOptions }: { padukuhanOptions: { id: string; nama: string }[] }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusData | "">("");
  const [jenisTanah, setJenisTanah] = useState<JenisTanah | "">("");
  const [padukuhanId, setPadukuhanId] = useState("");

  const { data, isLoading, refetch } = trpc.tkd.listAdmin.useQuery({
    page,
    perPage: 10,
    search: search || undefined,
    status: (status as StatusData) || undefined,
    jenisTanah: (jenisTanah as JenisTanah) || undefined,
    padukuhanId: padukuhanId || undefined,
  });

  return (
    <div className="animate-fadeUp">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="section-title-heritage" style={{ margin: 0 }}>DATA TANAH KAS DESA</div>
        <Link href="/admin/tkd/create" className="btn-heritage" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> TAMBAH DATA
        </Link>
      </div>

      {/* Filters */}
      <div className="card-heritage" style={{ padding: 20, marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <div className="label-heritage">Pencarian</div>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Nama / Kode TKD..."
              className="input-heritage"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }} />
          </div>
        </div>

        <div style={{ flex: "1 1 150px" }}>
          <div className="label-heritage">Status</div>
          <select className="select-heritage" value={status} onChange={(e) => setStatus(e.target.value as StatusData)}>
            <option value="">Semua Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Menunggu Review</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        <div style={{ flex: "1 1 150px" }}>
          <div className="label-heritage">Jenis Tanah</div>
          <select className="select-heritage" value={jenisTanah} onChange={(e) => setJenisTanah(e.target.value as JenisTanah)}>
            <option value="">Semua Jenis</option>
            <option value="TANAH_KAS">Tanah Kas</option>
            <option value="PELUNGGUH">Pelungguh</option>
            <option value="PENGAREM_AREM">Pengarem-arem</option>
          </select>
        </div>

        <div style={{ flex: "1 1 150px" }}>
          <div className="label-heritage">Padukuhan</div>
          <select className="select-heritage" value={padukuhanId} onChange={(e) => setPadukuhanId(e.target.value)}>
            <option value="">Semua Padukuhan</option>
            {padukuhanOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
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
                <th style={{ textAlign: "left" }}>Nama TKD</th>
                <th style={{ textAlign: "left" }}>Lokasi</th>
                <th>Jenis & Luas</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 0", fontStyle: "italic" }}>Memuat data...</td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 0", fontStyle: "italic" }}>Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                data?.items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{(page - 1) * 10 + idx + 1}</td>
                    <td style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, color: "var(--navy-900)" }}>{item.nama}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{item.kode || "-"}</div>
                    </td>
                    <td style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 500 }}>{item.padukuhan.nama}</div>
                    </td>
                    <td>
                      <div>{JENIS_LABEL[item.jenisTanah]}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{item.luasHa.toFixed(4)} Ha</div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[item.status]}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                        <Link href={`/admin/tkd/${item.id}`} style={{ color: "var(--navy-600)" }} title="Lihat Detail">
                          <Eye size={18} />
                        </Link>
                        {item.status !== "APPROVED" && (
                          <Link href={`/admin/tkd/${item.id}/edit`} style={{ color: "var(--gold-600)" }} title="Edit">
                            <Edit size={18} />
                          </Link>
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
        {data && data.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 16, borderTop: "1px solid rgba(160,125,47,.1)" }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={{ padding: "6px 12px", background: "var(--cream-50)", border: "1px solid var(--gold-600)", borderRadius: 4, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}
            >
              Sebelumnya
            </button>
            <div style={{ padding: "6px 12px", fontFamily: '"Cinzel", serif', fontWeight: 600 }}>
              {page} / {data.totalPages}
            </div>
            <button
              disabled={page === data.totalPages}
              onClick={() => setPage(page + 1)}
              style={{ padding: "6px 12px", background: "var(--cream-50)", border: "1px solid var(--gold-600)", borderRadius: 4, cursor: page === data.totalPages ? "not-allowed" : "pointer", opacity: page === data.totalPages ? 0.5 : 1 }}
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
