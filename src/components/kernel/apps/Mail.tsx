"use client";

import { useState } from "react";
import { Github, Linkedin, Mail as MailIcon, Send } from "lucide-react";
import { profile } from "@/data/profile";
import { hexToRgba } from "@/lib/utils";
import { PHOSPHOR } from "../desktop/types";
import { AppHeader } from "./ui";

const FIELD =
  "min-h-11 w-full rounded border bg-transparent px-2.5 py-1.5 font-mono text-[12px] text-zinc-200 outline-none transition-colors placeholder:text-zinc-600";

const LINKS = [
  { icon: MailIcon, label: profile.email, href: `mailto:${profile.email}` },
  { icon: Github, label: `@${profile.githubUser}`, href: profile.github },
  { icon: Linkedin, label: "linkedin.com/in/yashas120", href: profile.linkedin },
];

export function Mail() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const send = () => {
    const qs = new URLSearchParams();
    if (subject.trim()) qs.set("subject", subject.trim());
    if (body.trim()) qs.set("body", body.trim());
    const query = qs.toString();
    window.location.href = `mailto:${profile.email}${query ? `?${query}` : ""}`;
  };

  return (
    <div className="min-h-full">
      <AppHeader command={`mail -s "hello" ${profile.email}`} hint="composes in your own mail client — nothing is sent from this page" />

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2 font-mono text-[12px]">
          <span className="w-16 flex-shrink-0 text-zinc-500">To:</span>
          <span className="text-zinc-200">{profile.email}</span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="mail-subject" className="w-16 flex-shrink-0 font-mono text-[12px] text-zinc-500">
            Subject:
          </label>
          <input
            id="mail-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Role, question, or just hello"
            className={FIELD}
            style={{ borderColor: "rgb(var(--line) / 0.12)" }}
          />
        </div>

        <div>
          <label htmlFor="mail-body" className="sr-only">
            Message
          </label>
          <textarea
            id="mail-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            placeholder="Write your message ..."
            className={`${FIELD} resize-none leading-relaxed`}
            style={{ borderColor: "rgb(var(--line) / 0.12)" }}
          />
        </div>

        <button
          onClick={send}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors"
          style={{
            borderColor: hexToRgba(PHOSPHOR, 0.4),
            background: hexToRgba(PHOSPHOR, 0.1),
            color: PHOSPHOR,
          }}
        >
          <Send className="h-3.5 w-3.5" /> send
        </button>

        <ul
          className="space-y-2 border-t pt-3"
          style={{ borderColor: "rgb(var(--line) / 0.08)" }}
        >
          {LINKS.map(({ icon: Icon, label, href }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] text-zinc-400 transition-colors hover:text-zinc-100"
              >
                <Icon className="h-3.5 w-3.5" style={{ color: PHOSPHOR }} />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
