import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  fullyParallel: false,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    channel: "chrome",
    headless: true,
  },
  webServer: {
    command: "python3 -m http.server 4173 --directory out",
    url: "http://127.0.0.1:4173/fde/",
    reuseExistingServer: true,
  },
});
