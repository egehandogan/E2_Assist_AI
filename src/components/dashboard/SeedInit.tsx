"use client";

import { useEffect } from "react";

export function SeedInit() {
  useEffect(() => {
    // Initialize demo user once on first load
    fetch("/api/seed").catch(() => {});
  }, []);
  return null;
}
