import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PADUKUHAN_DATA = [
  { nama: "Babadan", kode: "BB", urutan: 1 },
  { nama: "Karanganom", kode: "KA", urutan: 2 },
  { nama: "Karang Tengah", kode: "KT", urutan: 3 },
  { nama: "Mojosari", kode: "MS", urutan: 4 },
  { nama: "Karangploso", kode: "KP", urutan: 5 },
  { nama: "Nglengis", kode: "NL", urutan: 6 },
  { nama: "Somokaton", kode: "SK", urutan: 7 },
  { nama: "Mutihan", kode: "MT", urutan: 8 },
  { nama: "Ngampon", kode: "NA", urutan: 9 },
  { nama: "Banyakan I", kode: "B1", urutan: 10 },
  { nama: "Banyakan II", kode: "B2", urutan: 11 },
  { nama: "Banyakan III", kode: "B3", urutan: 12 },
  { nama: "Pagergunung I", kode: "PG1", urutan: 13 },
  { nama: "Pagergunung II", kode: "PG2", urutan: 14 },
];

const SYSTEM_CONFIGS = [
  {
    key: "password.expiry_days",
    value: 30,
    description: "Jumlah hari sampai password kedaluwarsa",
    category: "security",
  },
  {
    key: "password.history_count",
    value: 5,
    description: "Jumlah password lama yang tidak boleh digunakan",
    category: "security",
  },
  {
    key: "password.min_length",
    value: 12,
    description: "Panjang minimum password",
    category: "security",
  },
  {
    key: "password.require_uppercase",
    value: true,
    description: "Password wajib huruf kapital",
    category: "security",
  },
  {
    key: "password.require_number",
    value: true,
    description: "Password wajib angka",
    category: "security",
  },
  {
    key: "password.require_symbol",
    value: true,
    description: "Password wajib simbol",
    category: "security",
  },
  {
    key: "security.max_login_attempts",
    value: 5,
    description: "Maksimal percobaan login sebelum dikunci",
    category: "security",
  },
  {
    key: "security.lockout_minutes",
    value: 15,
    description: "Durasi kunci akun (menit)",
    category: "security",
  },
  {
    key: "email.from",
    value: "noreply@sitimulyo.desa.id",
    description: "Alamat email pengirim",
    category: "email",
  },
  {
    key: "app.name",
    value: "SI-TAKAL Sitimulyo",
    description: "Nama aplikasi",
    category: "general",
  },
];

async function main() {
  console.log("🌱 Seeding database SI-TAKAL...\n");

  // ── 1. Padukuhan ──────────────────────────────────────────────────────────
  console.log("📍 Membuat padukuhan...");
  for (const p of PADUKUHAN_DATA) {
    await prisma.padukuhan.upsert({
      where: { nama: p.nama },
      update: {},
      create: p,
    });
  }
  console.log(`   ✓ ${PADUKUHAN_DATA.length} padukuhan berhasil dibuat\n`);

  // ── 2. System Config ──────────────────────────────────────────────────────
  console.log("⚙️  Membuat konfigurasi sistem...");
  for (const config of SYSTEM_CONFIGS) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: {
        key: config.key,
        value: config.value,
        description: config.description,
        category: config.category,
      },
    });
  }
  console.log(`   ✓ ${SYSTEM_CONFIGS.length} konfigurasi berhasil dibuat\n`);

  // ── 3. Super Admin ────────────────────────────────────────────────────────
  console.log("👤 Membuat akun Super Admin...");
  const superAdminPassword = "Admin@12345!";
  const superAdminHash = await bcrypt.hash(superAdminPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      username: "superadmin",
      email: "superadmin@sitimulyo.desa.id",
      name: "Super Administrator",
      passwordHash: superAdminHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      mustChangePassword: false,
      passwordExpired: false,
      passwordChangedAt: new Date(),
    },
  });
  console.log(`   ✓ Super Admin dibuat: username=superadmin`);
  console.log(`   ✓ Password awal: ${superAdminPassword}`);
  console.log(`   ⚠️  SEGERA GANTI PASSWORD setelah login pertama!\n`);

  // ── 4. Admin Desa ─────────────────────────────────────────────────────────
  const adminDesaHash = await bcrypt.hash("AdminDesa@123!", 12);
  await prisma.user.upsert({
    where: { username: "admindesa" },
    update: {},
    create: {
      username: "admindesa",
      email: "admin@sitimulyo.desa.id",
      name: "Admin Kalurahan Sitimulyo",
      passwordHash: adminDesaHash,
      role: "ADMIN_DESA",
      status: "ACTIVE",
      mustChangePassword: true,
      passwordExpired: false,
      passwordChangedAt: new Date(),
      createdById: superAdmin.id,
    },
  });
  console.log(`   ✓ Admin Desa dibuat: username=admindesa\n`);

  // ── 5. Operator ───────────────────────────────────────────────────────────
  const operatorHash = await bcrypt.hash("Operator@123!", 12);
  await prisma.user.upsert({
    where: { username: "operator1" },
    update: {},
    create: {
      username: "operator1",
      email: "operator@sitimulyo.desa.id",
      name: "Operator Lapangan",
      passwordHash: operatorHash,
      role: "OPERATOR",
      status: "ACTIVE",
      mustChangePassword: true,
      passwordExpired: false,
      passwordChangedAt: new Date(),
      createdById: superAdmin.id,
    },
  });
  console.log(`   ✓ Operator dibuat: username=operator1\n`);

  console.log("✅ Seeding selesai!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("KREDENSIAL LOGIN:");
  console.log("  Super Admin : superadmin / Admin@12345!");
  console.log("  Admin Desa  : admindesa  / AdminDesa@123!");
  console.log("  Operator    : operator1  / Operator@123!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
