"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("status");
  const errorMessage = searchParams.get("message");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (statusParam === "success") {
      setStatus("success");
      setMessage("✅ Email verified successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } else if (statusParam === "error") {
      setStatus("error");
      setMessage(errorMessage || "Invalid or expired verification link.");
    } else {
      setStatus("error");
      setMessage("Invalid verification request.");
    }
  }, [statusParam, errorMessage, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-xl p-7 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Email Verification</h2>

        <p
          className={`mt-5 text-sm font-semibold ${
            status === "success"
              ? "text-green-600"
              : status === "error"
              ? "text-red-600"
              : "text-slate-600"
          }`}
        >
          {message}
        </p>

        {status === "loading" && (
          <div className="mt-6 flex justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {status === "error" && (
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-block w-full rounded-2xl py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
            >
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
