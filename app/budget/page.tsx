"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BudgetPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to quarterly budget page
    router.push("/budget/quarterly");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xl">جاري التحويل...</div>
    </div>
  );
}

