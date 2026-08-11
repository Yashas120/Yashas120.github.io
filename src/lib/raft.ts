import { projects } from "@/data/projects";
import { Project } from "@/types";

// Raft replicated log: each project is a log entry the leader replicates to the
// followers and commits once a majority acks.

export const RAFT_NODES = 5;
export const MAJORITY = Math.floor(RAFT_NODES / 2) + 1; // 3
export const TERM = 3;

export interface RaftEntry {
  index: number;
  term: number;
  project: Project;
}

export const RAFT_ENTRIES: RaftEntry[] = projects.map((project, i) => ({
  index: i + 1,
  term: TERM,
  project,
}));
