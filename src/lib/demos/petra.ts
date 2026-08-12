// Petra is a hand-built MERN booking app: a React SPA (react-router) talking to
// a custom Express API on :3001 backed by MongoDB, with Google OAuth login, a
// static image server for hotel photos, and Leaflet maps. The interesting part
// is the full-stack request lifecycle — how each user action travels Client →
// API → Mongo (and out to Google for auth) and back. This module encodes the
// real endpoints, DB operations, and the app's actual pet-care pricing so the
// flow can be traced live in the browser. No backend runs here.

export type NodeId = "client" | "api" | "db" | "google";

export interface FlowStep {
  from: NodeId;
  to: NodeId;
  title: string; // e.g. "POST /search/"
  kind: "req" | "res" | "query" | "ext" | "render";
  body: string; // faithful code / JSON snippet
}

export interface Action {
  key: string;
  label: string;
  blurb: string;
  steps: FlowStep[];
}

export const NODE_META: Record<NodeId, { label: string; sub: string }> = {
  client: { label: "React SPA", sub: "react-router" },
  api: { label: "Express API", sub: "localhost:3001" },
  db: { label: "MongoDB", sub: "hotels · users" },
  google: { label: "Google OAuth", sub: "verifyIdToken" },
};

// The real Google client id shipped in SignUp.jsx (public by design).
export const GOOGLE_CLIENT_ID = "1065157938718-eudu1eo9ic1l7dduroe3n85ffdthk9fp";

export const ACTIONS: Action[] = [
  {
    key: "search",
    label: "Search stays",
    blurb: "Header.jsx posts the search form to the API, which queries Mongo for hotels in that city and returns the result set the SearchPage + Leaflet map render.",
    steps: [
      { from: "client", to: "api", kind: "req", title: "POST /search/", body: 'axios.post("http://localhost:3001/search/", {\n  Query: "Bangalore, India",\n  SDate, EDate,\n  Guests, Adults, Childern, Infants, Pets,\n  LoggedIn: false,\n})' },
      { from: "api", to: "db", kind: "query", title: "hotels.find({ city })", body: 'db.collection("hotels").find({\n  city: "Bangalore",\n})' },
      { from: "db", to: "api", kind: "res", title: "→ hotel documents", body: "[ { _id, title, ppn, service_fee,\n    spa_cost, sitter_cost,\n    coordinates: { latitude, longitude } },\n  … 5 docs ]" },
      { from: "api", to: "client", kind: "res", title: "200 { results }", body: "{ results: [ …5 hotels… ] }" },
      { from: "client", to: "client", kind: "render", title: "render <SearchPage/>", body: 'sessionStorage.setItem("searchPageProps", …)\n\n// map recentres on the results:\n<MapContainer center={getLoc()} />\n// getLoc = ½·(min+max) of coordinates' },
    ],
  },
  {
    key: "login",
    label: "Google sign-in",
    blurb: "SignUp.jsx runs Google OAuth in the browser, hands the token to the API, which verifies it, upserts the user in Mongo, and returns the profile the SPA persists to flip into its authed routes.",
    steps: [
      { from: "client", to: "google", kind: "ext", title: "GoogleLogin popup", body: `<GoogleLogin clientId="${GOOGLE_CLIENT_ID}…" />\n→ { tokenId, googleId, profileObj }` },
      { from: "client", to: "api", kind: "req", title: "POST /auth/google/account/", body: 'axios.post("http://localhost:3001/auth/google/account/", {\n  tokenId, googleId,\n  imageUrl: profileObj.imageUrl,\n})' },
      { from: "api", to: "google", kind: "ext", title: "verifyIdToken(tokenId)", body: "new OAuth2Client(CLIENT_ID)\n  .verifyIdToken({ idToken: tokenId })\n// → trusted { email, name, picture }" },
      { from: "api", to: "db", kind: "query", title: "users.upsert({ googleId })", body: 'db.collection("users").updateOne(\n  { googleId },\n  { $setOnInsert: { name, email, perks: [] } },\n  { upsert: true },\n)' },
      { from: "db", to: "api", kind: "res", title: "→ user", body: "{ name, email, perks, imageUrl }" },
      { from: "api", to: "client", kind: "res", title: "200 { user }", body: "{ user: { name, email, perks, imageUrl } }" },
      { from: "client", to: "client", kind: "render", title: "persist profile → authed routes", body: 'sessionStorage.setItem("profile", { … })\n\n// every route now gets the prefix:\n/auth/google/account/search\n/auth/google/account/hotel/:id' },
    ],
  },
  {
    key: "view",
    label: "Open a hotel",
    blurb: "Product.jsx fetches one hotel by id (the authed path when logged in), Mongo returns the full document, and the page renders the photo gallery, map, and a live cost breakdown from the hotel's own fields.",
    steps: [
      { from: "client", to: "api", kind: "req", title: "GET /hotel/:id", body: "const url = LoggedIn\n  ? `/auth/google/account/hotel/${hotelID}`\n  : `/hotel/${hotelID}`;\naxios.get(\"http://localhost:3001\" + url)" },
      { from: "api", to: "db", kind: "query", title: "hotels.findById(id)", body: 'db.collection("hotels").findOne({\n  _id: ObjectId(hotelID),\n})' },
      { from: "db", to: "api", kind: "res", title: "→ hotel", body: "{ ppn, service_fee, taxes,\n  spa_cost, sitter_cost,      // ₹ / hour\n  images: { rooms, spa, sitter },\n  reviews, coordinates }" },
      { from: "api", to: "client", kind: "res", title: "200 { results }", body: "{ results: { …hotel… } }" },
      { from: "client", to: "client", kind: "render", title: "gallery + map + cost", body: "<Carousel images={images.rooms} />\n<MapContainer center={coordinates} />\n\ncost = ppn·nights + service_fee + taxes\n     + petCare(sitter, spa)" },
    ],
  },
  {
    key: "reserve",
    label: "Reserve",
    blurb: "Reserve is auth-gated entirely on the client: a guest is stashed in sessionStorage and bounced to /login, then returned to finish; a logged-in guest goes straight to the /redirect confirmation.",
    steps: [
      { from: "client", to: "client", kind: "render", title: "Reserve clicked", body: 'onClick={() => reserve()}\n// dates + guests + pets read from the form' },
      { from: "client", to: "client", kind: "render", title: "auth gate", body: 'if (!isLoggedIn) {\n  sessionStorage.setItem("hotel", { …intent… });\n  history.push("/login");   // ← come back after\n} else {\n  history.push("/redirect");\n}' },
      { from: "client", to: "client", kind: "render", title: "/redirect confirmation", body: '<Redirecting/> // animated spinner ~3–6s\n→ "Thank you for Booking with us"' },
    ],
  },
];

// ---- the app's real pet-care pricing (Product.jsx) -------------------------
export interface HotelDoc {
  id: string;
  title: string;
  city: "Bangalore" | "Chennai";
  rating: number;
  ppn: number; // ₹ / night
  service_fee: number; // ₹ flat
  taxes: number; // ₹ flat ("Other Charges")
  spa_cost: number; // ₹ / hour
  sitter_cost: number; // ₹ / hour
}

export const HOTELS: HotelDoc[] = [
  { id: "taj-west-end", title: "Taj West End", city: "Bangalore", rating: 4.8, ppn: 9200, service_fee: 1200, taxes: 900, spa_cost: 300, sitter_cost: 250 },
  { id: "four-seasons", title: "Four Seasons", city: "Bangalore", rating: 4.9, ppn: 15400, service_fee: 1800, taxes: 1500, spa_cost: 450, sitter_cost: 350 },
  { id: "itc-grand-chola", title: "ITC Grand Chola", city: "Chennai", rating: 4.8, ppn: 11800, service_fee: 1400, taxes: 1100, spa_cost: 400, sitter_cost: 300 },
  { id: "fishermans-cove", title: "Taj Fisherman's Cove", city: "Chennai", rating: 4.6, ppn: 8700, service_fee: 1000, taxes: 800, spa_cost: 280, sitter_cost: 220 },
];

export interface CostBreakdown {
  base: number; // ppn × nights
  service_fee: number;
  taxes: number;
  petPerDay: number; // (spa? + sitter?) × 5 hrs/day — as computed in Product.jsx
  total: number;
}

// Mirrors Product.jsx exactly: pet care is billed at 5 hours/day, sitter/spa are
// optional add-ons priced per hour, and only apply when pets > 0.
export function bookingCost(h: HotelDoc, nights: number, pets: number, withSitter: boolean, withSpa: boolean): CostBreakdown {
  const base = h.ppn * nights;
  const petPerDay = pets > 0 ? ((withSpa ? h.spa_cost : 0) + (withSitter ? h.sitter_cost : 0)) * 5 : 0;
  const total = base + h.service_fee + h.taxes + petPerDay;
  return { base, service_fee: h.service_fee, taxes: h.taxes, petPerDay, total };
}

export function inr(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
