"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

export function AuditPagination({ totalPages, totalItems, itemsPerPage }: { totalPages: number, totalItems: number, itemsPerPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push("?" + params.toString());
  };

  const handlePageSizeChange = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("perPage", size.toString());
    params.set("page", "1");
    router.push("?" + params.toString());
  };

  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      itemName="log aktivitas"
    />
  );
}
