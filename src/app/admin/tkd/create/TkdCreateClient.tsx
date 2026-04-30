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
import { MapEditor } from "@/components/map";
import { JenisTanah, KategoriPenggunaan } from "@prisma/client";

const tkdCreateSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi").max(200),
  deskripsi: z.string().max(1000).optional(),
  jenisTanah: z.nativeEnum(JenisTanah, { required_error: "Jenis tanah wajib dipilih" }),
  kategoriPenggunaan: z.nativeEnum(KategoriPenggunaan, { required_error: "Kategori wajib dipilih" }),
  penggunaan: z.string().min(1, "Penggunaan wajib diisi").max(100),
  pemanfaatan: z.string().max(100).optional(),
  padukuhanId: z.string().min(1, "Padukuhan wajib dipilih"),
  alamat: z.string().max(300).optional(),
  statusKepemilikan: z.string().max(100).optional(),
  alasHak: z.string().max(200).optional(),
  nomorSertifikat: z.string().max(100).optional(),
  geometryGeoJson: z.string().min(1, "Polygon wajib digambar di peta"),
});

type FormValues = z.infer<typeof tkdCreateSchema>;

export function TkdCreateClient({ padukuhanOptions }: { padukuhanOptions: { id: string; nama: string }[] }) {
  const router = useRouter();
  const createMutation = trpc.tkd.create.useMutation();

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(tkdCreateSchema),
    defaultValues: { statusKepemilikan: "Tanah Kalurahan" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Data TKD berhasil disimpan!");
      router.push("/admin/tkd");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyimpan data.");
    }
  };

  return (
    <div className="animate-fadeUp max-w-4xl mx-auto">
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Link href="/admin/tkd" style={{ color: "var(--navy-600)" }} title="Kembali">
          <ArrowLeft size={24} />
        </Link>
        <div className="section-title-heritage" style={{ margin: 0 }}>TAMBAH DATA TKD</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card-heritage" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Identitas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="max-[600px]:grid-cols-1">
          <div>
            <label className="label-heritage">NAMA TKD / PERSIK <span className="text-red-500">*</span></label>
            <input type="text" {...register("nama")} className="input-heritage" placeholder="Contoh: Tanah Kas Babadan 1" />
            {errors.nama && <span style={{ color: "red", fontSize: 12 }}>{errors.nama.message}</span>}
          </div>
          <div>
            <label className="label-heritage">PADUKUHAN <span className="text-red-500">*</span></label>
            <select {...register("padukuhanId")} className="select-heritage">
              <option value="">-- Pilih Padukuhan --</option>
              {padukuhanOptions.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
            </select>
            {errors.padukuhanId && <span style={{ color: "red", fontSize: 12 }}>{errors.padukuhanId.message}</span>}
          </div>
        </div>

        <div>
          <label className="label-heritage">DESKRIPSI LOKASI</label>
          <textarea {...register("deskripsi")} className="input-heritage" rows={3} placeholder="Deskripsi tambahan (opsional)..." />
        </div>

        {/* Klasifikasi */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="max-[600px]:grid-cols-1">
          <div>
            <label className="label-heritage">JENIS TANAH <span className="text-red-500">*</span></label>
            <select {...register("jenisTanah")} className="select-heritage">
              <option value="">-- Pilih Jenis --</option>
              <option value="TANAH_KAS">Tanah Kas</option>
              <option value="PELUNGGUH">Pelungguh</option>
              <option value="PENGAREM_AREM">Pengarem-arem</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
            {errors.jenisTanah && <span style={{ color: "red", fontSize: 12 }}>{errors.jenisTanah.message}</span>}
          </div>
          <div>
            <label className="label-heritage">KATEGORI PENGGUNAAN <span className="text-red-500">*</span></label>
            <select {...register("kategoriPenggunaan")} className="select-heritage">
              <option value="">-- Pilih Kategori --</option>
              <option value="PERTANIAN">Pertanian</option>
              <option value="NON_PERTANIAN">Non-Pertanian</option>
            </select>
            {errors.kategoriPenggunaan && <span style={{ color: "red", fontSize: 12 }}>{errors.kategoriPenggunaan.message}</span>}
          </div>
          <div>
            <label className="label-heritage">PENGGUNAAN <span className="text-red-500">*</span></label>
            <input type="text" {...register("penggunaan")} className="input-heritage" placeholder="Contoh: Sawah, Lapangan, dll" />
            {errors.penggunaan && <span style={{ color: "red", fontSize: 12 }}>{errors.penggunaan.message}</span>}
          </div>
          <div>
            <label className="label-heritage">PEMANFAATAN</label>
            <input type="text" {...register("pemanfaatan")} className="input-heritage" placeholder="Contoh: Disewa Bapak X" />
          </div>
        </div>

        {/* Legal & Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="max-[600px]:grid-cols-1">
          <div>
            <label className="label-heritage">STATUS KEPEMILIKAN</label>
            <input type="text" {...register("statusKepemilikan")} className="input-heritage" />
          </div>
          <div>
            <label className="label-heritage">ALAS HAK / BUKTI</label>
            <input type="text" {...register("alasHak")} className="input-heritage" placeholder="Contoh: Letter C / Sertifikat" />
          </div>
        </div>

        {/* Peta Digital */}
        <div>
          <label className="label-heritage" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>GAMBAR POLIGON DI PETA <span className="text-red-500">*</span></span>
          </label>
          <div style={{ padding: "4px", background: "rgba(214,178,90,.1)", border: "1px dashed var(--gold-600)", borderRadius: 8, marginBottom: 8 }}>
            <MapEditor onGeometryChange={(geo) => setValue("geometryGeoJson", geo || "", { shouldValidate: true })} />
          </div>
          {errors.geometryGeoJson && <span style={{ color: "red", fontSize: 12 }}>{errors.geometryGeoJson.message}</span>}
        </div>

        {/* Submit */}
        <div style={{ borderTop: "1px solid rgba(160,125,47,.2)", paddingTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={createMutation.isPending} className="btn-heritage" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            {createMutation.isPending ? "Menyimpan..." : <><Save size={16} /> SIMPAN SEBAGAI DRAFT</>}
          </button>
        </div>
      </form>
    </div>
  );
}
