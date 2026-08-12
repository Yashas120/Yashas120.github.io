/// <reference lib="webworker" />
// Proof-of-work miner running off the main thread so the UI never janks.
import { hashHeader, meetsDifficulty, type BlockHeader } from "../../../lib/demos/bitcoin";

type StartMsg = { type: "start"; header: BlockHeader; difficulty: number };
type StopMsg = { type: "stop" };
type InMsg = StartMsg | StopMsg;

let running = false;

self.onmessage = (e: MessageEvent<InMsg>) => {
  const data = e.data;

  if (data.type === "stop") {
    running = false;
    return;
  }

  if (data.type === "start") {
    running = true;
    const header: BlockHeader = { ...data.header };
    const { difficulty } = data;
    let nonce = 0;
    let attempts = 0;
    const BATCH = 20000;
    const t0 = performance.now();

    const step = () => {
      if (!running) return;
      let hh = "";
      for (let i = 0; i < BATCH; i++) {
        header.nonce = nonce;
        hh = hashHeader(header);
        attempts++;
        if (meetsDifficulty(hh, difficulty)) {
          running = false;
          self.postMessage({
            type: "found",
            nonce,
            hash: hh,
            attempts,
            ms: performance.now() - t0,
          });
          return;
        }
        nonce++;
      }
      self.postMessage({
        type: "progress",
        nonce,
        hash: hh,
        attempts,
        ms: performance.now() - t0,
      });
      // yield so incoming "stop" messages can be processed between batches
      setTimeout(step, 0);
    };

    step();
  }
};

export {};
