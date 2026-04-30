"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Padukuhan } from "@prisma/client";

export function PadukuhanClient({ initialData }: { initialData: Padukuhan[] }) {
  // Simple view for padukuhan (Phase 1 layout)
  return (
    <div className="animate-fadeUp">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div className="section-title-heritage" style={{ margin: 0 }}>KELOLA PADUKUHAN</div>
        <button className="btn-heritage" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={16} /> TAMBAH DATA
        </button>
      </div>

      <div className="card-heritage" style={{ overflow: "hidden" }}>
        <table className="tbl-heritage" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ width: 60 }}>Urutan</th>
              <th style={{ textAlign: "left" }}>Kode</th>
              <th style={{ textAlign: "left" }}>Nama Padukuhan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialData.map((item) => (
              <tr key={item.id}>
                <td>{item.urutan}</td>
                <td style={{ textAlign: "left", fontWeight: 600 }}>{item.kode}</td>
                <td style={{ textAlign: "left" }}>{item.nama}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {item.isActive ? "Aktif" : "Non-Aktif"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                    <button style={{ color: "var(--gold-600)", background: "none", border: "none", cursor: "pointer" }} title="Edit">
                      <Edit size={18} />
                    </button>
                    <button style={{ color: "#c62828", background: "none", border: "none", cursor: "pointer" }} title="Hapus">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
