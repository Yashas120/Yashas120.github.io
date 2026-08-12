// In-browser re-creation of the Cloud-Provisioning-using-RDBMS project, built to
// showcase the *implementation*, not an end-user console. It models the unusual
// parts of the Postgres design and traces the stored-procedure call chain:
//
//   create_VM(composite)                      -- one deeply-nested composite arg
//     → CHECK_PROJ_QUOTA(project, zone, ...)   -- nested LIMIT_QUOTAS lookup
//       → CHECK_RACK_QUOTA(project, zone, ...)  -- RAM-block bin-packing over racks
//         → CHECK_ZONE_QUOTA(zone, ...)          -- composite-field availability
//
// Quotas live in nested composite types (LIMIT_QUOTAS → LIMIT_QUOTAS_ZONE →
// GPU_FAMILY / DISK_FAMILY / MACHINE_FAMILY) and are decremented with dotted-path
// UPDATEs (quotas.Z1.GPU_PREMPT.NVIDIA_TESLA_A100 = …). Everything runs live.

export const GPUS = ["A100", "V100", "K80", "T4", "P4"] as const;
export const GPU_COL = ["NVIDIA_TESLA_A100", "NVIDIA_TESLA_V100", "NVIDIA_TESLA_K80", "NVIDIA_TESLA_T4", "NVIDIA_TESLA_P4"];
export const MACHINES = ["EC2", "N1", "N2", "C2", "A2"] as const;
export const DISKS = ["HDD", "SSD", "BALANCED"] as const;
export const RAM_OPTIONS = [8, 16, 32, 64];
export type Gpu = (typeof GPUS)[number];
export type Machine = (typeof MACHINES)[number];
export type Disk = (typeof DISKS)[number];
export type FamMap<K extends string> = Record<K, number>;

export interface ZoneQuota {
  NO_VMS: number;
  GPU_PREMPT: FamMap<Gpu>;
  GPU: FamMap<Gpu>;
  DISK: FamMap<Disk>;
  MACHINE_FAMILY_PREMPT: FamMap<Machine>;
  MACHINE_FAMILY: FamMap<Machine>;
}
export interface ZoneState {
  name: string; // Z1..Z4
  gpu: FamMap<Gpu>; // GPU_AVAILABLE
  machine: FamMap<Machine>; // MACHINE_TYPE_AVAILABLE
  disk: FamMap<Disk>; // DISK_AVAILABLE
  ram: { blk1: number; blk2: number; blk3: number; blk4: number }; // RAM_FAMILY (GB tiers)
}
export interface ProjectState {
  id: string;
  name: string;
  quota: Record<string, ZoneQuota>; // LIMIT_QUOTAS: per-zone
}
export interface VM {
  id: string;
  name: string;
  project: string;
  zone: string;
  machine: Machine;
  gpu: Gpu;
  gpuCount: number;
  disk: Disk;
  ram: number;
  ip: string;
  rack: string;
  preemptible: boolean;
}
export interface CloudDB {
  zones: ZoneState[];
  projects: ProjectState[];
  vms: VM[];
  nextId: number;
}
export interface VMRequest {
  project: string;
  zone: string;
  machine: Machine;
  gpu: Gpu;
  gpuCount: number;
  disk: Disk;
  ram: number;
  preemptible: boolean;
}

function fam<K extends string>(keys: readonly K[], vals: number[]): FamMap<K> {
  const o = {} as FamMap<K>;
  keys.forEach((k, i) => (o[k] = vals[i]));
  return o;
}

// Seeded database. Quotas mirror the DDL DEFAULT: on-demand (GPU/MACHINE_FAMILY)
// and preemptible (…_PREMPT) pools differ per zone, so preemptibility matters.
export function seedDB(): CloudDB {
  const zq = (
    noVms: number,
    gp: number[],
    g: number[],
    d: number[],
    mp: number[],
    m: number[],
  ): ZoneQuota => ({
    NO_VMS: noVms,
    GPU_PREMPT: fam(GPUS, gp),
    GPU: fam(GPUS, g),
    DISK: fam(DISKS, d),
    MACHINE_FAMILY_PREMPT: fam(MACHINES, mp),
    MACHINE_FAMILY: fam(MACHINES, m),
  });
  // MACHINE order in the composite is (EC2,N1,N2,C2,A2)
  const quota = (): Record<string, ZoneQuota> => ({
    Z1: zq(5, [1, 0, 0, 0, 0], [0, 0, 0, 0, 0], [100, 200, 200], [5, 3, 5, 1, 1], [5, 3, 5, 1, 0]),
    Z2: zq(5, [0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [100, 200, 200], [5, 3, 5, 1, 0], [5, 3, 5, 1, 0]),
    Z3: zq(5, [1, 2, 0, 0, 0], [0, 2, 0, 0, 0], [100, 200, 200], [5, 3, 5, 1, 1], [5, 3, 5, 1, 0]),
    Z4: zq(5, [0, 2, 0, 0, 0], [0, 1, 1, 1, 1], [100, 200, 200], [5, 3, 5, 1, 0], [5, 3, 5, 1, 0]),
  });
  const zone = (name: string, g: number[], m: number[], d: number[], ram: number[]): ZoneState => ({
    name,
    gpu: fam(GPUS, g),
    machine: fam(MACHINES, m),
    disk: fam(DISKS, d),
    ram: { blk1: ram[0], blk2: ram[1], blk3: ram[2], blk4: ram[3] },
  });
  return {
    zones: [
      zone("Z1", [4, 2, 2, 6, 4], [8, 8, 8, 6, 4], [200, 200, 200], [16, 32, 64, 128]),
      zone("Z2", [2, 3, 1, 4, 2], [6, 6, 8, 4, 3], [200, 200, 200], [16, 32, 64, 128]),
      zone("Z3", [6, 1, 3, 8, 2], [8, 6, 6, 8, 6], [200, 200, 200], [16, 32, 64, 128]),
      zone("Z4", [1, 4, 0, 3, 5], [4, 8, 6, 2, 8], [200, 200, 200], [16, 32, 64, 128]),
    ],
    projects: [
      { id: "labra213-123", name: "alpha", quota: quota() },
      { id: "msft-2028341", name: "beta", quota: quota() },
    ],
    vms: [],
    nextId: 1,
  };
}

// --------------------------------------------------------------------------
// Execution trace: a stack of function frames mirroring the real call chain.
// --------------------------------------------------------------------------
export interface Frame {
  fn: string;
  sig: string;
  depth: number;
  args: { name: string; val: string }[];
  src: string[]; // condensed but faithful PL/pgSQL
  activeLine: number; // decisive line to highlight
  watch: { name: string; val: string }[];
  ret: string; // rendered return value
  retType: string;
  ok: boolean; // did it succeed (return a usable value)?
  note: string;
}
export interface Trace {
  call: string; // SELECT create_VM((...));
  frames: Frame[];
  ramBlk: string;
  rackId: string;
  ok: boolean;
  updates: string[]; // dotted-path UPDATE / INSERT statements applied on success
  vm: VM | null;
}

const GPU_COMPOSITE = (g: Gpu, n: number) => `(${GPUS.map((k) => (k === g ? n : 0)).join(",")})`;
const DISK_COMPOSITE = (d: Disk) => `(${DISKS.map((k) => (k === d ? 1 : 0)).join(",")})`;

function ramBlockFor(zone: ZoneState, ram: number): string {
  if (ram <= zone.ram.blk1) return "blk1";
  if (ram <= zone.ram.blk2) return "blk2";
  if (ram <= zone.ram.blk3) return "blk3";
  if (ram <= zone.ram.blk4) return "blk4";
  return "0000";
}

const SRC_ZONE = [
  "CREATE FUNCTION CHECK_ZONE_QUOTA(zone, RAM, GPU GPU_FAMILY,",
  "                                 DISK DISK_FAMILY, MACHINE) RETURNS CHAR(4) AS $$",
  "  d_ram_blk := '0000';",
  "  SELECT (GPU_AVAILABLE).* INTO d_GPU  FROM ZONE WHERE ZONE_NAME=zone;   -- composite read",
  "  SELECT (RAM_AVAILABLE).* INTO d_RAM  FROM ZONE WHERE ZONE_NAME=zone;",
  "  IF (GPU).A100<=(d_GPU).A100 AND … AND (GPU).P4<=(d_GPU).P4 THEN        -- every GPU family fits?",
  "    IF (MACHINE='A2' AND (d_MACHINE).A2>0 AND (GPU).A100<>0) OR … THEN   -- machine type available?",
  "      IF (DISK).HDD<=(d_DISK).HDD AND … THEN                            -- disk fits?",
  "        IF   RAM<=(d_RAM).blk1 THEN d_ram_blk:='blk1';                  -- smallest RAM tier",
  "        ELSIF RAM<=(d_RAM).blk2 THEN d_ram_blk:='blk2';",
  "        ELSIF RAM<=(d_RAM).blk3 THEN d_ram_blk:='blk3';",
  "        ELSIF RAM<=(d_RAM).blk4 THEN d_ram_blk:='blk4'; END IF;",
  "      END IF; END IF; END IF;",
  "  RETURN d_ram_blk;   -- '0000' ⇒ zone cannot host this VM",
];
const SRC_RACK = [
  "CREATE FUNCTION CHECK_RACK_QUOTA(project, zone, RAM, GPU, DISK, MACHINE)",
  "                                 RETURNS CHAR(10) AS $$",
  "  d_rack_id := '0000000000';  d_offset := 0;",
  "  SELECT CHECK_ZONE_QUOTA(zone,RAM,GPU,DISK,MACHINE) INTO d_ram_blk;   -- nested call ↓",
  "  IF d_ram_blk NOT LIKE '0000' THEN",
  "    WHILE flag1=1 LOOP                                                 -- scan racks in tier",
  "      SELECT RACK_ID INTO d_spatial FROM HARDWARE",
  "        WHERE ZONE_NAME=zone AND RACK_ID LIKE '%'||d_ram_blk||'%'      -- block-tagged rack ids",
  "        ORDER BY RACK_ID DESC LIMIT 1 OFFSET d_offset;",
  "      IF d_spatial IS NULL THEN d_ram_blk:='blk'||(substr(d_ram_blk,4)::int+1);  -- next tier",
  "      ELSIF gpu&disk&machine fit AND d_RAM>=RAM THEN d_rack_id:=d_spatial; flag1:=0;  -- found",
  "      ELSE d_offset:=d_offset+1; END IF;                              -- keep scanning",
  "    END LOOP; END IF;",
  "  RETURN d_rack_id;",
];
const SRC_PROJ = [
  "CREATE FUNCTION CHECK_PROJ_QUOTA(project, zone, preempt, RAM, GPU, DISK, MACHINE)",
  "                                 RETURNS CHAR(10) AS $$",
  "  SELECT (QUOTAS).Z1 INTO q FROM PROJECT WHERE PROJECT_ID=project;    -- nested composite lookup",
  "  IF (q).NO_VMS <= 0 THEN RETURN '0000000000'; END IF;               -- VM-count quota",
  "  IF preempt THEN                                                     -- preemptible pool",
  "     IF (q).GPU_PREMPT.A100 < (GPU).A100 THEN RETURN '0000000000';",
  "     IF (q).MACHINE_FAMILY_PREMPT.<m> <= 0 THEN RETURN '0000000000';",
  "  ELSE                                                                -- on-demand pool",
  "     IF (q).GPU.A100 < (GPU).A100 THEN RETURN '0000000000';",
  "     IF (q).MACHINE_FAMILY.<m> <= 0 THEN RETURN '0000000000'; END IF;",
  "  IF (q).DISK.<d> < (DISK).<d> THEN RETURN '0000000000'; END IF;      -- disk quota",
  "  SELECT CHECK_RACK_QUOTA(project,zone,RAM,GPU,DISK,MACHINE) INTO d_rack;  -- nested call ↓",
  "  RETURN d_rack;",
];
const SRC_CREATE = [
  "CREATE FUNCTION create_VM(v VM) RETURNS VOID AS $$",
  "  SELECT CHECK_PROJ_QUOTA((v).PROJECT_ID,(v).ZONE,(v).PREEMPT,",
  "                          (v).RAM,(v).GPU,(v).DISK,(v).MACHINE) INTO d_rack;   -- nested call ↓",
  "  IF d_rack = '0000000000' THEN RAISE NOTICE 'quota/hardware unavailable'; RETURN; END IF;",
  "  INSERT INTO VM     VALUES (gen_id(),(v).NAME,…,d_rack,(v).ZONE,(v).PROJECT_ID,",
  "                             (v).RAM,(v).GPU,(v).DISK,(v).MACHINE);",
  "  INSERT INTO RUNTIME VALUES (id, now(), 0,0,0,0, '0','0');",
  "  INSERT INTO MONITORS/ACCESS …;",
  "  UPDATE PROJECT SET quotas.<Z>.<pool>.<gpu> = quotas.<Z>.<pool>.<gpu> - (GPU).<gpu>,   -- dotted path",
  "                     quotas.<Z>.<mpool>.<m>  = … - 1,  quotas.<Z>.DISK.<d> = … - 1,",
  "                     quotas.<Z>.NO_VMS       = quotas.<Z>.NO_VMS - 1  WHERE PROJECT_ID=(v).PROJECT_ID;",
];

// Build the composite-literal call, mirroring concurrency.sql.
export function callLiteral(db: CloudDB, req: VMRequest): string {
  const proj = db.projects.find((p) => p.id === req.project)!;
  const vmName = `${proj.name}-${String(db.nextId).padStart(3, "0")}`;
  return `SELECT create_VM(('${req.project}','${vmName}','Ubuntu-20.04','Stopped',${req.preemptible ? "TRUE" : "FALSE"},'10.1.1.20','34.122.7.189','dlink','${req.zone}',${req.ram},${GPU_COMPOSITE(req.gpu, req.gpuCount)},${DISK_COMPOSITE(req.disk)},'${req.machine}'));`;
}

// Run the trace. Returns the frames plus, on success, a new DB with the nested
// composite quotas and zone availability decremented (the dotted-path UPDATE).
export function traceCreateVM(db: CloudDB, req: VMRequest): { trace: Trace; db: CloudDB } {
  const proj = db.projects.find((p) => p.id === req.project)!;
  const zone = db.zones.find((z) => z.name === req.zone)!;
  const q = proj.quota[req.zone];
  const frames: Frame[] = [];
  const gpuArg = `${GPU_COMPOSITE(req.gpu, req.gpuCount)} → ${req.gpu}×${req.gpuCount}`;
  const commonArgs = [
    { name: "zone", val: req.zone },
    { name: "RAM", val: `${req.ram}` },
    { name: "GPU", val: gpuArg },
    { name: "DISK", val: `${DISK_COMPOSITE(req.disk)} → ${req.disk}` },
    { name: "MACHINE", val: `'${req.machine}'` },
  ];

  // ---- frame 0: create_VM -------------------------------------------------
  frames.push({
    fn: "create_VM",
    sig: "create_VM(v VM) → VOID",
    depth: 0,
    args: [{ name: "v", val: `(…,'${req.zone}','${req.project}',${req.ram},${GPU_COMPOSITE(req.gpu, req.gpuCount)},${DISK_COMPOSITE(req.disk)},'${req.machine}')` }],
    src: SRC_CREATE,
    activeLine: 1,
    watch: [],
    ret: "",
    retType: "VOID",
    ok: true,
    note: "unpacks the composite arg and calls CHECK_PROJ_QUOTA",
  });

  // ---- frame 1: CHECK_PROJ_QUOTA -----------------------------------------
  const pool = req.preemptible ? "GPU_PREMPT" : "GPU";
  const mpool = req.preemptible ? "MACHINE_FAMILY_PREMPT" : "MACHINE_FAMILY";
  const gpuQ = req.preemptible ? q.GPU_PREMPT[req.gpu] : q.GPU[req.gpu];
  const macQ = req.preemptible ? q.MACHINE_FAMILY_PREMPT[req.machine] : q.MACHINE_FAMILY[req.machine];
  const diskQ = q.DISK[req.disk];
  let projFail = "";
  let projLine = 11;
  if (q.NO_VMS <= 0) { projFail = `NO_VMS = 0 in ${req.zone}`; projLine = 3; }
  else if (gpuQ < req.gpuCount) { projFail = `${pool}.${req.gpu} = ${gpuQ} < ${req.gpuCount}`; projLine = req.preemptible ? 5 : 8; }
  else if (macQ <= 0) { projFail = `${mpool}.${req.machine} = 0`; projLine = req.preemptible ? 6 : 9; }
  else if (diskQ < 1) { projFail = `DISK.${req.disk} = 0`; projLine = 10; }
  frames.push({
    fn: "CHECK_PROJ_QUOTA",
    sig: "CHECK_PROJ_QUOTA(project,zone,preempt,RAM,GPU,DISK,MACHINE) → CHAR(10)",
    depth: 1,
    args: [
      { name: "project", val: `'${req.project}'` },
      { name: "preempt", val: req.preemptible ? "TRUE" : "FALSE" },
      ...commonArgs,
    ],
    src: SRC_PROJ,
    activeLine: projFail ? projLine : 11,
    watch: [
      { name: "(q).NO_VMS", val: `${q.NO_VMS}` },
      { name: `(q).${pool}.${req.gpu}`, val: `${gpuQ}` },
      { name: `(q).${mpool}.${req.machine}`, val: `${macQ}` },
      { name: `(q).DISK.${req.disk}`, val: `${diskQ}` },
    ],
    ret: projFail ? "'0000000000'" : "d_rack",
    retType: "CHAR(10)",
    ok: !projFail,
    note: projFail ? `project quota exceeded: ${projFail}` : `${req.preemptible ? "preemptible" : "on-demand"} pool ok → CHECK_RACK_QUOTA`,
  });
  if (projFail) {
    frames[0].ok = false;
    frames[0].note = "d_rack = '0000000000' → RAISE NOTICE, no VM created";
    frames[0].activeLine = 3;
    return { trace: { call: callLiteral(db, req), frames, ramBlk: "0000", rackId: "0000000000", ok: false, updates: [], vm: null }, db };
  }

  // ---- frame 3 (computed first): CHECK_ZONE_QUOTA -------------------------
  const gpuFit = GPUS.every((g) => (g === req.gpu ? req.gpuCount : 0) <= zone.gpu[g]);
  const macFit = zone.machine[req.machine] > 0 && !(req.machine === "A2" && req.gpuCount === 0);
  const diskFit = zone.disk[req.disk] >= 1;
  const ramBlk = gpuFit && macFit && diskFit ? ramBlockFor(zone, req.ram) : "0000";
  let zoneLine = 13;
  if (!gpuFit) zoneLine = 5;
  else if (!macFit) zoneLine = 6;
  else if (!diskFit) zoneLine = 7;
  else zoneLine = ramBlk === "blk1" ? 8 : ramBlk === "blk2" ? 9 : ramBlk === "blk3" ? 10 : ramBlk === "blk4" ? 11 : 13;

  // ---- frame 2: CHECK_RACK_QUOTA (wraps zone) ----------------------------
  const rackFound = ramBlk !== "0000";
  const rackId = rackFound ? `${ramBlk}-${String(zone.name.charCodeAt(1) - 48).padStart(5, "0")}` : "0000000000";
  frames.push({
    fn: "CHECK_RACK_QUOTA",
    sig: "CHECK_RACK_QUOTA(project,zone,RAM,GPU,DISK,MACHINE) → CHAR(10)",
    depth: 2,
    args: [{ name: "project", val: `'${req.project}'` }, ...commonArgs],
    src: SRC_RACK,
    activeLine: rackFound ? 10 : 4,
    watch: [
      { name: "d_ram_blk", val: `'${ramBlk}'` },
      { name: "d_offset", val: "0" },
      { name: "d_spatial", val: rackFound ? `'${rackId}'` : "NULL" },
      { name: "d_rack_id", val: `'${rackId}'` },
    ],
    ret: `'${rackId}'`,
    retType: "CHAR(10)",
    ok: rackFound,
    note: rackFound
      ? `matched rack via RACK_ID LIKE '%${ramBlk}%'`
      : "CHECK_ZONE_QUOTA returned '0000' → no rack",
  });
  frames.push({
    fn: "CHECK_ZONE_QUOTA",
    sig: "CHECK_ZONE_QUOTA(zone,RAM,GPU,DISK,MACHINE) → CHAR(4)",
    depth: 3,
    args: commonArgs,
    src: SRC_ZONE,
    activeLine: zoneLine,
    watch: [
      { name: `(d_GPU).${req.gpu}`, val: `${zone.gpu[req.gpu]}` },
      { name: `(d_MACHINE).${req.machine}`, val: `${zone.machine[req.machine]}` },
      { name: `(d_DISK).${req.disk}`, val: `${zone.disk[req.disk]}` },
      { name: "(d_RAM) tiers", val: `${zone.ram.blk1}/${zone.ram.blk2}/${zone.ram.blk3}/${zone.ram.blk4}` },
      { name: "d_ram_blk", val: `'${ramBlk}'` },
    ],
    ret: `'${ramBlk}'`,
    retType: "CHAR(4)",
    ok: ramBlk !== "0000",
    note:
      !gpuFit ? `GPU ${req.gpu} unavailable in ${req.zone}`
      : !macFit ? (req.machine === "A2" && req.gpuCount === 0 ? "A2 requires an A100 GPU" : `${req.machine} unavailable in ${req.zone}`)
      : !diskFit ? `${req.disk} disk unavailable`
      : ramBlk === "0000" ? `no RAM tier fits ${req.ram}GB`
      : `smallest RAM tier: ${ramBlk} (${req.ram}GB)`,
  });

  const ok = rackFound;
  frames[1].ok = ok; // proj quota's return depends on rack
  frames[1].ret = `'${rackId}'`;
  frames[0].ok = ok;
  frames[0].activeLine = ok ? 8 : 3;
  frames[0].note = ok ? "rack returned → INSERT VM + dotted-path UPDATE" : "d_rack = '0000000000' → RAISE NOTICE, no VM created";

  if (!ok) {
    return { trace: { call: callLiteral(db, req), frames, ramBlk, rackId, ok: false, updates: [], vm: null }, db };
  }

  // ---- success: build the dotted-path UPDATE + INSERTs, apply to a new DB --
  const id = `vm-${String(db.nextId).padStart(4, "0")}`;
  const gpuCol = GPU_COL[GPUS.indexOf(req.gpu)];
  const vm: VM = {
    id,
    name: `${proj.name}-${String(db.nextId).padStart(3, "0")}`,
    project: req.project,
    zone: req.zone,
    machine: req.machine,
    gpu: req.gpu,
    gpuCount: req.gpuCount,
    disk: req.disk,
    ram: req.ram,
    ip: `10.128.${Math.floor(db.nextId / 254)}.${(db.nextId % 254) + 1}`,
    rack: rackId,
    preemptible: req.preemptible,
  };
  const Z = req.zone;
  const updates = [
    `INSERT INTO VM VALUES ('${id}', '${vm.name}', …, '${rackId}', '${Z}', '${req.project}', ${req.ram}, ${GPU_COMPOSITE(req.gpu, req.gpuCount)}, ${DISK_COMPOSITE(req.disk)}, '${req.machine}');`,
    `UPDATE PROJECT SET quotas.${Z}.${pool}.${gpuCol} = quotas.${Z}.${pool}.${gpuCol} - ${req.gpuCount}`,
    `                   quotas.${Z}.${mpool}.${req.machine} = quotas.${Z}.${mpool}.${req.machine} - 1,`,
    `                   quotas.${Z}.DISK.${req.disk} = quotas.${Z}.DISK.${req.disk} - 1,`,
    `                   quotas.${Z}.NO_VMS = quotas.${Z}.NO_VMS - 1  WHERE PROJECT_ID = '${req.project}';`,
  ];

  const ndb: CloudDB = JSON.parse(JSON.stringify(db));
  const nq = ndb.projects.find((p) => p.id === req.project)!.quota[req.zone];
  const nzone = ndb.zones.find((z) => z.name === req.zone)!;
  nq.NO_VMS -= 1;
  if (req.preemptible) {
    nq.GPU_PREMPT[req.gpu] -= req.gpuCount;
    nq.MACHINE_FAMILY_PREMPT[req.machine] -= 1;
  } else {
    nq.GPU[req.gpu] -= req.gpuCount;
    nq.MACHINE_FAMILY[req.machine] -= 1;
  }
  nq.DISK[req.disk] -= 1;
  nzone.gpu[req.gpu] -= req.gpuCount;
  nzone.machine[req.machine] -= 1;
  nzone.disk[req.disk] -= 1;
  ndb.vms = ndb.vms.concat(vm);
  ndb.nextId += 1;

  return { trace: { call: callLiteral(db, req), frames, ramBlk, rackId, ok: true, updates, vm }, db: ndb };
}

// deleteVM.sql — reclaim the nested quota + zone availability.
export function deleteVM(db: CloudDB, id: string): CloudDB {
  const vm = db.vms.find((v) => v.id === id);
  if (!vm) return db;
  const ndb: CloudDB = JSON.parse(JSON.stringify(db));
  const nq = ndb.projects.find((p) => p.id === vm.project)!.quota[vm.zone];
  const nzone = ndb.zones.find((z) => z.name === vm.zone)!;
  nq.NO_VMS += 1;
  if (vm.preemptible) {
    nq.GPU_PREMPT[vm.gpu] += vm.gpuCount;
    nq.MACHINE_FAMILY_PREMPT[vm.machine] += 1;
  } else {
    nq.GPU[vm.gpu] += vm.gpuCount;
    nq.MACHINE_FAMILY[vm.machine] += 1;
  }
  nq.DISK[vm.disk] += 1;
  nzone.gpu[vm.gpu] += vm.gpuCount;
  nzone.machine[vm.machine] += 1;
  nzone.disk[vm.disk] += 1;
  ndb.vms = ndb.vms.filter((v) => v.id !== id);
  return ndb;
}
