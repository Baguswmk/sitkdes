"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  KeyRound,
  User as UserIcon,
} from "lucide-react";
import { UserRole, UserStatus } from "@prisma/client";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";

// Types
type UserWithCounts = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  _count: {
    tkdCreated: number;
  };
};

export function UsersClient({
  initialData,
  currentUserId,
}: {
  initialData: UserWithCounts[];
  currentUserId: string;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, refetch, isLoading } = trpc.users.list.useQuery(undefined, {
    initialData,
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const rawData = data || [];
  const totalPages = Math.max(1, Math.ceil(rawData.length / itemsPerPage));
  const pageData = rawData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Selected User State
  const [selectedUser, setSelectedUser] = useState<UserWithCounts | null>(null);

  // Forms State
  type UserFormData = {
    name: string;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    password: string; // Only for create
  };

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    username: "",
    email: "",
    role: UserRole.OPERATOR,
    status: UserStatus.ACTIVE,
    password: "",
  });
  const [resetPasswordInput, setResetPasswordInput] = useState("");

  // Mutations
  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("User berhasil dibuat");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("Data user berhasil diperbarui");
      setIsEditOpen(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetMutation = trpc.users.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password berhasil di-reset");
      setIsResetOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("User berhasil dihapus");
      setDeleteId(null);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
      setDeleteId(null);
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      role: UserRole.OPERATOR,
      status: UserStatus.ACTIVE,
      password: "",
    });
    setIsCreateOpen(true);
  };

  const openEditModal = (user: UserWithCounts) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      role: UserRole.OPERATOR,
      status: UserStatus.ACTIVE,
      password: "",
    });
    setIsEditOpen(true);
  };

  const openResetModal = (user: UserWithCounts) => {
    setSelectedUser(user);
    setResetPasswordInput("");
    setIsResetOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateMutation.mutate({
      id: selectedUser.id,
      data: {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      },
    });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    resetMutation.mutate({
      id: selectedUser.id,
      newPassword: resetPasswordInput,
    });
  };

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    resetMutation.isPending;

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
          KELOLA PENGGUNA
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
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
          <button
            onClick={openCreateModal}
            className="btn-heritage"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={16} /> TAMBAH PENGGUNA
          </button>
        </div>
      </div>

      <div className="card-heritage" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl-heritage" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th style={{ textAlign: "left" }}>Nama & Username</th>
                <th style={{ textAlign: "left" }}>Kontak</th>
                <th>Peran</th>
                <th>Status</th>
                <th>Login Terakhir</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ textAlign: "center" }}>
                    {(page - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 600, color: "var(--navy-900)" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                      @{item.username}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      fontSize: 13,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {item.email}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        background:
                          item.role === "SUPER_ADMIN"
                            ? "#ffebee"
                            : item.role === "ADMIN_DESA"
                              ? "#e8eaf6"
                              : "#eceff1",
                        color:
                          item.role === "SUPER_ADMIN"
                            ? "#c62828"
                            : item.role === "ADMIN_DESA"
                              ? "#1e3070"
                              : "#546e7a",
                      }}
                    >
                      {item.role.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : item.status === "LOCKED"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {item.lastLoginAt
                      ? new Date(item.lastLoginAt).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 12,
                      }}
                    >
                      <button
                        onClick={() => openResetModal(item)}
                        style={{
                          color: "var(--gold-600)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                        title="Reset Password"
                      >
                        <KeyRound size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        style={{
                          color: "var(--navy-600)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      {item.id !== currentUserId && (
                        <button
                          onClick={() => setDeleteId(item.id)}
                          style={{
                            color: "#c62828",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "40px 0",
                      fontStyle: "italic",
                      textAlign: "center",
                      color: "var(--ink-soft)",
                    }}
                  >
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={rawData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          itemName="pengguna"
        />
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <ModalWrapper
          title="Tambah Pengguna"
          onClose={() => setIsCreateOpen(false)}
        >
          <form
            id="create-user-form"
            onSubmit={handleCreateSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div>
              <label className="label-heritage">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-heritage"
                placeholder="Cth: Budi Santoso"
              />
            </div>
            <div
              className="max-[600px]:grid-cols-1"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label className="label-heritage">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase().replace(/\s/g, ""),
                    })
                  }
                  className="input-heritage"
                  placeholder="Cth: budi"
                />
              </div>
              <div>
                <label className="label-heritage">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-heritage"
                  placeholder="budi@contoh.com"
                />
              </div>
            </div>
            <div
              className="max-[600px]:grid-cols-1"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label className="label-heritage">
                  Peran (Role) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="input-heritage"
                  style={{ appearance: "auto" }}
                >
                  <option value={UserRole.OPERATOR}>Operator</option>
                  <option value={UserRole.ADMIN_DESA}>Admin Desa</option>
                  <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                </select>
              </div>
              <div>
                <label className="label-heritage">
                  Status Akun <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as UserStatus,
                    })
                  }
                  className="input-heritage"
                  style={{ appearance: "auto" }}
                >
                  <option value={UserStatus.ACTIVE}>Aktif</option>
                  <option value={UserStatus.DISABLED}>Nonaktif</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label-heritage">
                Password Awal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input-heritage"
                placeholder="Minimal 8 karakter"
              />
              <p
                style={{
                  fontSize: 11,
                  color: "var(--ink-soft)",
                  marginTop: 4,
                  fontStyle: "italic",
                }}
              >
                Pengguna akan diminta mengganti password ini saat login pertama
                kali.
              </p>
            </div>
          </form>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-heritage-pill"
              style={{ background: "transparent", color: "var(--navy-800)" }}
            >
              Batal
            </button>
            <button
              type="submit"
              form="create-user-form"
              disabled={isSaving}
              className="btn-heritage"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedUser && (
        <ModalWrapper
          title="Edit Pengguna"
          onClose={() => setIsEditOpen(false)}
        >
          <form
            id="edit-user-form"
            onSubmit={handleEditSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div>
              <label className="label-heritage">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-heritage"
              />
            </div>
            <div
              className="max-[600px]:grid-cols-1"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label className="label-heritage">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase().replace(/\s/g, ""),
                    })
                  }
                  className="input-heritage"
                />
              </div>
              <div>
                <label className="label-heritage">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-heritage"
                />
              </div>
            </div>

            {selectedUser.id !== currentUserId ? (
              <div
                className="max-[600px]:grid-cols-1"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <label className="label-heritage">
                    Peran (Role) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="input-heritage"
                    style={{ appearance: "auto" }}
                  >
                    <option value={UserRole.OPERATOR}>Operator</option>
                    <option value={UserRole.ADMIN_DESA}>Admin Desa</option>
                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label-heritage">
                    Status Akun <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as UserStatus,
                      })
                    }
                    className="input-heritage"
                    style={{ appearance: "auto" }}
                  >
                    <option value={UserStatus.ACTIVE}>Aktif</option>
                    <option value={UserStatus.DISABLED}>Nonaktif</option>
                    <option value={UserStatus.LOCKED}>Terkunci</option>
                  </select>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(214,178,90,.1)",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--navy-800)",
                }}
              >
                Anda tidak dapat mengubah Peran atau Status untuk akun Anda
                sendiri.
              </div>
            )}
          </form>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="btn-heritage-pill"
              style={{ background: "transparent", color: "var(--navy-800)" }}
            >
              Batal
            </button>
            <button
              type="submit"
              form="edit-user-form"
              disabled={isSaving}
              className="btn-heritage"
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetOpen && selectedUser && (
        <ModalWrapper
          title="Reset Password"
          onClose={() => setIsResetOpen(false)}
        >
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontSize: 14,
                color: "var(--ink-soft)",
                marginBottom: 8,
              }}
            >
              Anda akan mereset password untuk pengguna:
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(0,0,0,0.03)",
                padding: 12,
                borderRadius: 8,
              }}
            >
              <UserIcon size={16} color="var(--navy-600)" />
              <span style={{ fontWeight: 600, color: "var(--navy-900)" }}>
                {selectedUser.name}
              </span>
              <span style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                ({selectedUser.username})
              </span>
            </div>
          </div>
          <form id="reset-password-form" onSubmit={handleResetSubmit}>
            <label className="label-heritage">
              Password Baru <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={resetPasswordInput}
              onChange={(e) => setResetPasswordInput(e.target.value)}
              className="input-heritage"
              placeholder="Masukkan password baru"
            />
          </form>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => setIsResetOpen(false)}
              className="btn-heritage-pill"
              style={{ background: "transparent", color: "var(--navy-800)" }}
            >
              Batal
            </button>
            <button
              type="submit"
              form="reset-password-form"
              disabled={isSaving || !resetPasswordInput}
              className="btn-heritage"
            >
              {isSaving ? "Mereset..." : "Reset Password"}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        open={!!deleteId}
        title="Hapus Pengguna"
        message="Apakah Anda yakin ingin menghapus akun pengguna ini? Tindakan ini tidak dapat dibatalkan. Jika pengguna ini pernah membuat data TKD, Anda tidak dapat menghapusnya."
        confirmLabel={deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
        confirmVariant="danger"
        onConfirm={() => deleteId && deleteMutation.mutate({ id: deleteId })}
        onCancel={() => setDeleteId(null)}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Simple internal modal wrapper component to avoid repetition
function ModalWrapper({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
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
        style={{
          background: "var(--cream-50, #fffbf0)",
          border: "2px solid var(--gold-500, #c9a84c)",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: 500,
          animation: "slideUp 0.2s ease",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid rgba(160,125,47,.2)",
          }}
        >
          <div
            style={{
              fontFamily: '"Cinzel", serif',
              fontWeight: 700,
              fontSize: 18,
              color: "var(--navy-900)",
            }}
          >
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-soft)",
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "24px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
