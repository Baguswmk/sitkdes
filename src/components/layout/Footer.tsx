export function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(180deg, var(--navy-900) 0%, var(--navy-950) 100%)",
        color: "var(--cream-100)",
        textAlign: "center",
        padding: "22px 32px 24px",
        borderTop: "3px solid var(--gold-500)",
        position: "relative",
        marginTop: "auto",
      }}
    >
      {/* Gold shimmer top border */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -3, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, transparent, var(--gold-400) 20%, var(--gold-100) 50%, var(--gold-400) 80%, transparent)",
        }}
      />
      <p
        style={{
          fontFamily: '"Cinzel", serif',
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 3,
          color: "var(--gold-100)",
          lineHeight: 1.8,
        }}
      >
        SISTEM INFORMASI TANAH KAS DESA
      </p>
      <p
        style={{
          fontFamily: '"Cinzel", serif',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: 3,
          lineHeight: 1.8,
        }}
      >
        KALURAHAN SITIMULYO &nbsp;·&nbsp; KAPANEWON PIYUNGAN &nbsp;·&nbsp; KABUPATEN BANTUL
      </p>
      <div
        aria-hidden="true"
        style={{
          color: "var(--gold-400)",
          fontSize: 18,
          marginTop: 10,
        }}
      >
        ❦
      </div>
    </footer>
  );
}
