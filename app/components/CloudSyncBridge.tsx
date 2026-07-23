"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase-client";

const SYNC_KEYS = [
  "ministry-partner-projects-v3",
  "ministry-partner-schedule-v1",
  "ministry-workspace-saved",
  "ministry-research-saved",
  "ministry-library-favorites",
  "ministry-library-custom",
  "ministry-partner-transform-history",
  "ministry-partner-name",
  "ministry-partner-denomination",
  "ministry-partner-theology",
];

export default function CloudSyncBridge() {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const client = supabase;

    let active = true;
    let userId = "";
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);

    async function restore() {
      const { data: sessionData } = await client.auth.getSession();
      const user = sessionData.session?.user;
      if (!active || !user) return;
      userId = user.id;

      const { data } = await client
        .from("user_documents")
        .select("document_key, content")
        .in("document_key", SYNC_KEYS);

      for (const row of data || []) {
        if (row?.document_key && row?.content !== undefined && row?.content !== null) {
          // Never overwrite data already created on this device during automatic restore.
          // A manual cloud save remains available from the account page.
          if (window.localStorage.getItem(row.document_key) === null) {
            originalSetItem(row.document_key, typeof row.content === "string" ? row.content : JSON.stringify(row.content));
          }
        }
      }
      window.dispatchEvent(new Event("ministry-cloud-restored"));
    }

    async function save(key: string, value: string) {
      if (!userId || !SYNC_KEYS.includes(key)) return;
      await client.from("user_documents").upsert(
        {
          user_id: userId,
          document_key: key,
          content: value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,document_key" },
      );
    }

    window.localStorage.setItem = function setItem(key: string, value: string) {
      originalSetItem(key, value);
      if (!SYNC_KEYS.includes(key)) return;
      const existing = timers.get(key);
      if (existing) clearTimeout(existing);
      timers.set(key, setTimeout(() => save(key, value), 700));
    };

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      userId = session?.user.id || "";
      if (userId) restore();
    });

    restore();

    return () => {
      active = false;
      timers.forEach(clearTimeout);
      listener.subscription.unsubscribe();
      window.localStorage.setItem = originalSetItem;
    };
  }, []);

  return null;
}
