import Link from "next/link";
import { ArrowRight, Map, BarChart3, FileText, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--navy-900)] via-[var(--navy-800)] to-[var(--navy-900)] text-white">
        <div className="absolute inset-0 opacity-10 bg-[url('/pattern-batik.svg')] bg-repeat" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold-500)]/30 bg-[var(--gold-500)]/10 px-4 py-1.5 text-sm text-[var(--gold-300)] mb-6 animate-fadeUp">
              <Shield className="h-4 w-4" />
              Kalurahan Sitimulyo · Kapanewon Piyungan · Kabupaten Bantul
            </div>

            <h1 className="font-[Cinzel] text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fadeUp animation-delay-100">
              Sistem Informasi
              <span className="block text-[var(--gold-400)]">
                Tanah Kas Desa
              </span>
            </h1>

            <p className="font-[Cormorant_Garamond] text-xl lg:text-2xl text-white/80 mb-8 leading-relaxed animate-fadeUp animation-delay-200">
              Pengelolaan, pemetaan, dan transparansi data tanah kas desa
              berbasis sistem informasi geografis terintegrasi.
            </p>

            <div className="flex flex-wrap gap-4 animate-fadeUp animation-delay-300">
              <Link
                href="/peta"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--gold-500)] px-6 py-3 font-semibold text-[var(--navy-900)] hover:bg-[var(--gold-400)] transition-colors shadow-lg"
              >
                <Map className="h-5 w-5" />
                Lihat Peta Interaktif
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/data"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <FileText className="h-5 w-5" />
                Jelajahi Data
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[var(--cream-50)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[Cinzel] text-3xl lg:text-4xl font-bold text-[var(--navy-900)] mb-3">
              Fitur Utama
            </h2>
            <p className="font-[Cormorant_Garamond] text-lg text-[var(--navy-700)] max-w-2xl mx-auto">
              Pengelolaan tanah kas desa yang transparan, terintegrasi, dan
              mudah diakses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Map className="h-8 w-8" />}
              title="Peta Interaktif"
              description="Visualisasi lokasi seluruh tanah kas desa dengan peta digital berbasis OpenStreetMap."
              href="/peta"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Statistik Real-Time"
              description="Data luas, status sertifikat, dan distribusi per padukuhan dalam dashboard ringkas."
              href="/statistik"
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Data Terbuka"
              description="Akses publik untuk informasi dasar tanah kas desa demi transparansi pengelolaan."
              href="/data"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[var(--navy-800)] text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[Cinzel] text-3xl lg:text-4xl font-bold mb-4">
            Untuk Aparat Desa
          </h2>
          <p className="font-[Cormorant_Garamond] text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Login untuk mengelola data tanah kas desa, melakukan pemetaan, dan
            mengakses fitur administrasi sistem.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--gold-500)] px-6 py-3 font-semibold text-[var(--navy-900)] hover:bg-[var(--gold-400)] transition-colors shadow-lg"
          >
            <Shield className="h-5 w-5" />
            Masuk Sebagai Aparat
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-[var(--gold-200)] bg-white p-6 hover:border-[var(--gold-500)] hover:shadow-lg transition-all"
    >
      <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-[var(--gold-500)]/10 p-3 text-[var(--gold-600)] group-hover:bg-[var(--gold-500)]/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-[Cinzel] text-xl font-bold text-[var(--navy-900)] mb-2">
        {title}
      </h3>
      <p className="font-[Cormorant_Garamond] text-base text-[var(--navy-700)] leading-relaxed">
        {description}
      </p>
    </Link>
  );
}