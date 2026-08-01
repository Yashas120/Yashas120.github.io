"use client";

import { profile } from "@/data/profile";
import { metrics } from "@/data/metrics";
import { useDesktop } from "../desktop/DesktopContext";
import { PHOSPHOR } from "../desktop/types";

const OPTIONS: [string, string][] = [
  ["--systems", "Linux kernel scheduling (ghOSt), NCS 1014 line-card dataplanes, CDR hardware integration, secure boot, from-scratch cryptography."],
  ["--distributed", "Apache Spark streaming pipelines, event-driven workflows over DynamoDB/SQS/SNS, consensus and replication fundamentals."],
  ["--backend", "PX Cloud and SNTC services at Cisco; Postgres, Mongo, and Cassandra performance work on a $2B-revenue application."],
  ["--devops", "Terraform IaC across EC2, ECS, Lambda, RDS, DynamoDB, SQS, SNS, and IAM; CI/CD pipelines; a Ping to Okta migration across 7 products."],
  ["--research", "Two published papers, lightweight super-resolution with Transformers and Fourier convolutions, multiview 3D reconstruction."],
  ["--teaching", "Three CSE courses at PES University as a TA; labs, worksheets, and office hours."],
];

const SEE_ALSO: [string, string][] = [
  ["htop(1)", "htop"],
  ["systemctl(1)", "systemd"],
  ["proc(5)", "proc"],
  ["sched(7)", "sched"],
  ["papers(3)", "papers"],
  ["mail(1)", "mail"],
];

function Sec({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="mt-5 first:mt-0">
      <h3 className="font-mono text-[12px] font-bold tracking-wide text-zinc-100">{title}</h3>
      <div className="mt-1.5 pl-6 text-[12px] leading-relaxed text-zinc-400">{children}</div>
    </section>
  );
}

export function ManPage() {
  const desktop = useDesktop();

  return (
    <div className="min-h-full px-5 py-4 font-mono sm:px-7">
      <div className="flex justify-between text-[11px] text-zinc-500">
        <span>YASHAS(1)</span>
        <span className="hidden sm:inline">General Commands Manual</span>
        <span>YASHAS(1)</span>
      </div>

      <div className="mt-5">
        <Sec title="NAME">
          <p>
            <span className="text-zinc-200">yashas</span> — systems and distributed engineer
          </p>
        </Sec>

        <Sec title="SYNOPSIS">
          <p className="text-zinc-300">
            <span className="text-zinc-100">yashas</span>{" "}
            {OPTIONS.map(([flag]) => `[${flag}]`).join(" ")}
          </p>
        </Sec>

        <Sec title="DESCRIPTION">
          <p>{profile.summary}</p>
          <p className="mt-2">{profile.tagline}</p>
        </Sec>

        <Sec title="OPTIONS">
          <dl className="space-y-2.5">
            {OPTIONS.map(([flag, desc]) => (
              <div key={flag}>
                <dt className="text-[12px]" style={{ color: PHOSPHOR }}>
                  {flag}
                </dt>
                <dd className="pl-6">{desc}</dd>
              </div>
            ))}
          </dl>
        </Sec>

        <Sec title="EDUCATION">
          <p>
            <span className="text-zinc-200">UC San Diego</span> — M.S. Computer Science (incoming,
            Sep 2026). Focus: distributed systems, operating systems, applied ML.
          </p>
          <p className="mt-1.5">
            <span className="text-zinc-200">PES University</span> — B.Tech, Computer Science &amp;
            Engineering. {profile.education.replace("B.Tech CSE, PES University — ", "")}. Officially
            evaluated to a U.S. B.S. in CSE.
          </p>
        </Sec>

        <Sec title="IMPACT">
          <dl className="space-y-2">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-wrap items-baseline gap-x-2">
                <dt className="w-44 flex-shrink-0 text-zinc-500">{m.label}</dt>
                <dd className="flex-1">
                  <span className="font-semibold" style={{ color: PHOSPHOR }}>
                    {m.value}
                  </span>
                  <span className="ml-2 text-zinc-500">{m.context}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Sec>

        <Sec title="FILES">
          <p className="text-zinc-500">
            /proc/yashas/status — identity and loaded skills
            <br />
            /etc/systemd/system/*.service — career history
          </p>
        </Sec>

        <Sec title="SEE ALSO">
          <p className="flex flex-wrap gap-x-1.5 gap-y-1">
            {SEE_ALSO.map(([label, appId], i) => (
              <span key={label}>
                <button
                  onClick={() => desktop.open(appId)}
                  className="underline decoration-dotted underline-offset-2 transition-colors hover:text-zinc-100"
                  style={{ color: PHOSPHOR }}
                >
                  {label}
                </button>
                {i < SEE_ALSO.length - 1 ? "," : ""}
              </span>
            ))}
          </p>
        </Sec>

        <Sec title="AUTHOR">
          <p>
            {profile.name}{" "}
            <a
              href={`mailto:${profile.email}`}
              className="underline decoration-dotted underline-offset-2"
              style={{ color: PHOSPHOR }}
            >
              &lt;{profile.email}&gt;
            </a>
          </p>
        </Sec>
      </div>

      <div className="mt-7 flex justify-between border-t pt-2 text-[11px] text-zinc-500" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
        <span>yashOS 6.11</span>
        <span className="hidden sm:inline">July 2026</span>
        <span>YASHAS(1)</span>
      </div>
    </div>
  );
}
