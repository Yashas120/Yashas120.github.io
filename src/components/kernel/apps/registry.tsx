"use client";

import {
  Activity,
  BookOpen,
  Cpu,
  FileText,
  FlaskConical,
  FolderTree,
  Mail as MailIcon,
  Server,
  TerminalSquare,
} from "lucide-react";
import { kernelProjects as projects } from "@/data/projects";
import type { AppDef } from "../desktop/types";
import { Htop } from "./Htop";
import { Mail } from "./Mail";
import { ManPage } from "./ManPage";
import { Papers } from "./Papers";
import { Procfs } from "./Procfs";
import { Sched } from "./Sched";
import { Systemd } from "./Systemd";
import { Terminal } from "./Terminal";
import { DemoLab } from "./DemoLab";

/** Dock order, left to right. Positions cascade so nothing opens perfectly stacked. */
export const apps: AppDef[] = [
  {
    id: "demo-lab",
    title: "demo-lab — select a project",
    short: "demo-lab",
    friendly: "Live project lab",
    blurb: "Singleton browser process for the selected project demo",
    icon: FlaskConical,
    hiddenLauncher: true,
    size: { w: 960, h: 680 },
    pos: { x: 150, y: 28 },
    render: () => <DemoLab />,
  },
  {
    id: "terminal",
    title: "yashas@kernel: ~",
    short: "terminal",
    friendly: "Command line",
    blurb: "Type commands, or just say hi",
    icon: TerminalSquare,
    terminal: true,
    onDesktop: true,
    size: { w: 560, h: 380 },
    pos: { x: 116, y: 46 },
    render: () => <Terminal />,
  },
  {
    id: "man",
    title: "man 1 yashas",
    short: "man",
    friendly: "Résumé",
    blurb: "Start here — my full résumé in plain English",
    icon: BookOpen,
    onDesktop: true,
    size: { w: 680, h: 540 },
    pos: { x: 430, y: 92 },
    render: () => <ManPage />,
  },
  {
    id: "systemd",
    title: "systemctl — career units",
    short: "systemd",
    friendly: "Work experience",
    blurb: "Where I've worked, as running services",
    icon: Server,
    onDesktop: true,
    size: { w: 700, h: 500 },
    pos: { x: 240, y: 120 },
    render: () => <Systemd />,
  },
  {
    id: "htop",
    title: `htop — ${projects.length} tasks`,
    short: "htop",
    friendly: "Projects",
    blurb: "Things I've built, as running processes",
    icon: Activity,
    onDesktop: true,
    size: { w: 740, h: 480 },
    pos: { x: 190, y: 150 },
    render: () => <Htop />,
  },
  {
    id: "sched",
    title: "sched — ghOSt policy",
    short: "sched",
    friendly: "Research",
    blurb: "My kernel-scheduler research, interactive",
    icon: Cpu,
    size: { w: 620, h: 500 },
    pos: { x: 330, y: 130 },
    render: () => <Sched />,
  },
  {
    id: "proc",
    title: "/proc/yashas",
    short: "proc",
    friendly: "Skills & profile",
    blurb: "Skills and quick facts about me",
    icon: FolderTree,
    size: { w: 660, h: 440 },
    pos: { x: 280, y: 170 },
    render: () => <Procfs />,
  },
  {
    id: "papers",
    title: "~/papers",
    short: "papers",
    friendly: "Publications & awards",
    blurb: "Papers I've published and awards I've won",
    icon: FileText,
    size: { w: 660, h: 540 },
    pos: { x: 300, y: 100 },
    render: () => <Papers />,
  },
  {
    id: "mail",
    title: "compose — new message",
    short: "mail",
    friendly: "Contact",
    blurb: "Get in touch with me",
    icon: MailIcon,
    size: { w: 560, h: 470 },
    pos: { x: 370, y: 160 },
    render: () => <Mail />,
  },
];

/** Windows the desktop opens on first boot: the resume, with a shell behind it. */
export const initialOpen = ["terminal", "man"];
