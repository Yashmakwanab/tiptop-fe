import BasicTableOne from "@/components/tables/BasicTableOne";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Employees",
  description:
    "Employee tabel data"
};

export default function BasicTables() {
  return (
    <div className="space-y-6">
      <BasicTableOne />
    </div>
  );
}
