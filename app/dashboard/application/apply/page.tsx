"use client";

import { ApplicationForm } from "../components/ApplicationForm";
import { plusJakarta } from "./fonts";

export default function ApplyPage() {
  return (
    <div className={`min-h-screen bg-brand-deep-dark/[2%] ${plusJakarta.className}`}>
      <ApplicationForm />
    </div>
  );
}
