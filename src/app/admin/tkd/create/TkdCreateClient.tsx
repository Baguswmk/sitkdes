"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { JenisTanah, KategoriPenggunaan } from "@prisma/client";

const MapEditor = dynamic(() => import("@/components/map/MapEditor"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--cream-100)",
        borderRadius: 6,
        fontStyle: "italic",
        color: "var(--ink-soft)",
      }}
    >
      Memuat Editor Peta...
    </div>
  ),
});

const PENGGUNAAN_OPTS = [
  "Pertanian",
  "Perumahan",
  "Keamanan",
  "RTH",
  "Lainnya",
];
const PEMANFAATAN_OPTS = [
  "Sawah",
  "Tegalan",
  "Kebun",
  "Rumah Warga",
  "Taman Desa",
  "Pos Kamling",
  "Balai Warga",
  "Rumah Pensiunan",
  "Lainnya",
];

const tkdSchema = z.object({
  nama: z.string().optional(),
  deskripsi: z.string().max(1000).optional(),
  jenisTanah: z.nativeEnum(JenisTanah, {
    message: "Jenis tanah wajib dipilih",
  }),
  kategoriPenggunaan: z.nativeEnum(KategoriPenggunaan, {
    message: "Kategori wajib dipilih",
  }),
  penggunaan: z.string().min(1, "Penggunaan wajib diisi").max(100),
  pemanfaatan: z.string().max(100).optional(),
  padukuhanId: z.string().min(1, "Padukuhan wajib dipilih"),
  alamat: z.string().max(300).optional(),
  statusKepemilikan: z.string().max(100).optional(),
  alasHak: z.string().max(200).optional(),
  nomorSertifikat: z.string().max(100).optional(),
  geometryGeoJson: z.string().min(1, "Polygon wajib digambar di peta"),
});

type FormValues = z.infer<typeof tkdSchema>;

export type TkdInitialData = Partial<FormValues> & {
  geometryGeoJson?: string;
};

type Props = {
  padukuhanOptions: { id: string; nama: string }[];
  /** Edit mode: ID of the TKD being edited */
  tkdId?: string;
  /** Edit mode: pre-populated field values */
  initialData?: TkdInitialData;
};

export function TkdCreateClient({
  padukuhanOptions,
  tkdId,
  initialData,
}: Props) {
  const router = useRouter();
  const isEditMode = !!tkdId;

  const createMutation = trpc.tkd.create.useMutation();
  const updateMutation = trpc.tkd.update.useMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(tkdSchema),
    defaultValues: {
      statusKepemilikan: "Tanah Kalurahan",
      ...initialData,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const selectedPadukuhan =
        padukuhanOptions.find((p) => p.id === data.padukuhanId)?.nama ||
        "Padukuhan";
      let jenisLabel: string = data.jenisTanah;
      if (data.jenisTanah === "TANAH_KAS") jenisLabel = "Tanah Kas";
      else if (data.jenisTanah === "PELUNGGUH") jenisLabel = "Pelungguh";
      else if (data.jenisTanah === "PENGAREM_AREM")
        jenisLabel = "Pengarem-arem";
      else if (data.jenisTanah === "LAINNYA") jenisLabel = "Tanah Lainnya";

      const generatedNama = data.nama || `${jenisLabel} - ${selectedPadukuhan}`;
      const payload = { ...data, nama: generatedNama };

      if (isEditMode) {
        await updateMutation.mutateAsync({ id: tkdId!, ...payload });
        toast.success("Data TKD berhasil diperbarui!");
        router.push(`/admin/tkd/${tkdId}`);
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success("Data TKD berhasil disimpan!");
        router.push("/admin/tkd");
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyimpan data.");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="animate-fadeUp max-w-4xl mx-auto">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Link
          href={isEditMode ? `/admin/tkd/${tkdId}` : "/admin/tkd"}
          style={{ color: "var(--navy-600)" }}
          title="Kembali"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="section-title-heritage" style={{ margin: 0 }}>
          {isEditMode ? "EDIT DATA TKD" : "TAMBAH DATA TKD"}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card-heritage"
        style={{
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Identitas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <div>
            <label className="label-heritage">
              PADUKUHAN <span className="text-red-500">*</span>
            </label>
            <select {...register("padukuhanId")} className="select-heritage">
              <option value="">-- Pilih Padukuhan --</option>
              {padukuhanOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
            {errors.padukuhanId && (
              <span style={{ color: "red", fontSize: 12 }}>
                {errors.padukuhanId.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="label-heritage">DESKRIPSI LOKASI</label>
          <textarea
            {...register("deskripsi")}
            className="input-heritage"
            rows={3}
            placeholder="Deskripsi tambahan (opsional)..."
          />
        </div>

        {/* Klasifikasi */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          className="max-[600px]:grid-cols-1"
        >
          <div>
            <label className="label-heritage">
              JENIS TANAH <span className="text-red-500">*</span>
            </label>
            <select {...register("jenisTanah")} className="select-heritage">
              <option value="">-- Pilih Jenis --</option>
              <option value="TANAH_KAS">Tanah Kas</option>
              <option value="PELUNGGUH">Pelungguh</option>
              <option value="PENGAREM_AREM">Pengarem-arem</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
            {errors.jenisTanah && (
              <span style={{ color: "red", fontSize: 12 }}>
                {errors.jenisTanah.message}
              </span>
            )}
          </div>
          <div>
            <label className="label-heritage">
              KATEGORI PENGGUNAAN <span className="text-red-500">*</span>
            </label>
            <select
              {...register("kategoriPenggunaan")}
              className="select-heritage"
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="PERTANIAN">Pertanian</option>
              <option value="NON_PERTANIAN">Non-Pertanian</option>
            </select>
            {errors.kategoriPenggunaan && (
              <span style={{ color: "red", fontSize: 12 }}>
                {errors.kategoriPenggunaan.message}
              </span>
            )}
          </div>
          <div>
            <label className="label-heritage">
              PENGGUNAAN <span className="text-red-500">*</span>
            </label>
            <select {...register("penggunaan")} className="select-heritage">
              <option value="">-- Pilih Penggunaan --</option>
              {PENGGUNAAN_OPTS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.penggunaan && (
              <span style={{ color: "red", fontSize: 12 }}>
                {errors.penggunaan.message}
              </span>
            )}
          </div>
          <div>
            <label className="label-heritage">PEMANFAATAN</label>
            <select {...register("pemanfaatan")} className="select-heritage">
              <option value="">-- Pilih Pemanfaatan --</option>
              {PEMANFAATAN_OPTS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legal & Status */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          className="max-[600px]:grid-cols-1"
        >
          <div>
            <label className="label-heritage">STATUS KEPEMILIKAN</label>
            <input
              type="text"
              {...register("statusKepemilikan")}
              className="input-heritage"
            />
          </div>
          <div>
            <label className="label-heritage">ALAS HAK / BUKTI</label>
            <input
              type="text"
              {...register("alasHak")}
              className="input-heritage"
              placeholder="Contoh: Letter C / Sertifikat"
            />
          </div>
        </div>

        {/* Peta Digital */}
        <div>
          <label
            className="label-heritage"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span>
              GAMBAR POLIGON DI PETA <span className="text-red-500">*</span>
            </span>
            {isEditMode && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  fontStyle: "italic",
                  fontFamily: '"Manrope", sans-serif',
                }}
              >
                Gambar ulang poligon jika ingin mengubah area
              </span>
            )}
          </label>
          <div
            style={{
              padding: "4px",
              background: "rgba(214,178,90,.1)",
              border: "1px dashed var(--gold-600)",
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <MapEditor
              onGeometryChange={(geo) =>
                setValue("geometryGeoJson", geo || "", { shouldValidate: true })
              }
              initialGeoJson={
                initialData?.geometryGeoJson
                  ? JSON.parse(initialData.geometryGeoJson)
                  : null
              }
            />
          </div>
          {errors.geometryGeoJson && (
            <span style={{ color: "red", fontSize: 12 }}>
              {errors.geometryGeoJson.message}
            </span>
          )}
        </div>

        {/* Submit */}
        <div
          style={{
            borderTop: "1px solid rgba(160,125,47,.2)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="submit"
            disabled={isPending}
            className="btn-heritage"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
            }}
          >
            {isPending ? (
              "Menyimpan..."
            ) : (
              <>
                <Save size={16} />{" "}
                {isEditMode ? "SIMPAN PERUBAHAN" : "SIMPAN SEBAGAI DRAFT"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
