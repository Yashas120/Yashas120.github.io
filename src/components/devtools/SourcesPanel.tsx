"use client";

import { useState } from "react";

const ACCENT = "#f59e0b";

const files: { name: string; lang: string; code: string[] }[] = [
  {
    name: "deploy.tf",
    lang: "hcl",
    code: [
      "# PX Cloud — parallelized plan cut deploy time 50%",
      'module "service" {',
      '  source          = "./modules/service"',
      '  for_each        = var.services',
      "  parallelism     = 20",
      "  event_triggers  = [aws_sqs_queue.q, aws_sns_topic.t]",
      "}",
    ],
  },
  {
    name: "stream.py",
    lang: "python",
    code: [
      "# Spark streaming — CIFAR-10 across servers",
      "stream = ssc.socketTextStream(host, port)",
      "batches = stream.map(decode_image).window(batch_size)",
      "batches.foreachRDD(lambda rdd: model.partial_fit(rdd.collect()))",
      "ssc.start(); ssc.awaitTermination()",
    ],
  },
  {
    name: "rag.py",
    lang: "python",
    code: [
      "# GPU-free multilingual assistant (~20s/query)",
      "docs = retriever.search(query, k=4)",
      "ctx  = rerank(docs)[:2]",
      "answer = llm.generate(prompt(query, ctx), device='cpu')",
      "return translate(answer, target=user_lang)",
    ],
  },
];

export function SourcesPanel() {
  const [active, setActive] = useState(0);
  const file = files[active];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr]">
      <div className="border-b sm:border-b-0 sm:border-r" style={{ borderColor: "rgb(var(--line) / 0.08)" }}>
        {files.map((f, i) => (
          <button
            key={f.name}
            onClick={() => setActive(i)}
            className="block w-full px-3 py-2 text-left font-mono text-[12px]"
            style={{ color: i === active ? ACCENT : "#a1a1aa", background: i === active ? "rgba(245,158,11,0.08)" : "transparent" }}
          >
            {f.name}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed">
        {file.code.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="w-6 select-none text-right text-zinc-600">{i + 1}</span>
            <span style={{ color: line.trim().startsWith("#") ? "#65a30d" : "#d4d4d8" }}>{line}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
