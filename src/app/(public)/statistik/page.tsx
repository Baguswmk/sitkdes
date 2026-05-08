import type { Metadata } from "next";
import { StatistikClient } from "./StatistikClient";

export const metadata: Metadata = {
  title: "Statistik | SI-TAKAL Sitimulyo",
  description:
    "Statistik luasan dan sebaran Tanah Kas Desa Kalurahan Sitimulyo",
};

export default function StatistikPage() {
  return <StatistikClient />;
}
