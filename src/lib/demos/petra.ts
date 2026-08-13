// Source-grounded walkthrough data for the archived Petra course project.
// Frontend: https://github.com/Yashas120/Petra
// Backend:  https://github.com/iVishalr/petra-backend
//
// The portfolio does not run either repository. These records condense the
// actual React, Express, and Mongoose code into three inspectable stories.

export type PetraChapterId = "read" | "auth" | "session";
export type PetraActor = "React" | "Google" | "Express" | "MongoDB" | "Browser";

export interface PetraChapter {
  id: PetraChapterId;
  number: string;
  label: string;
  title: string;
  summary: string;
}

export interface PetraTraceStep {
  actor: PetraActor;
  title: string;
  detail: string;
  code: string;
}

export const PETRA_CHAPTERS: readonly PetraChapter[] = [
  {
    id: "read",
    number: "01",
    label: "Read path",
    title: "One hotel-search read",
    summary: "Follow one request from Header.jsx to MongoDB and back to SearchPage.jsx.",
  },
  {
    id: "auth",
    number: "02",
    label: "Google auth",
    title: "Identity crosses a trust boundary",
    summary: "See what Google returns, what Express verifies, and what Petra does with the response.",
  },
  {
    id: "session",
    number: "03",
    label: "Backend + session",
    title: "Where state really lives",
    summary: "Inspect the Express/Mongo shape and replay Petra's tab-scoped sessionStorage handoff.",
  },
] as const;

export const READ_FLOW: readonly PetraTraceStep[] = [
  {
    actor: "React",
    title: "Header builds the search payload",
    detail: "The form collects the city, dates, guest counts, pets, and the client-side LoggedIn flag.",
    code: `const data = {
  Query: "Bangalore, India",
  SDate, EDate,
  Guests, Adults, Childern, Infants, Pets,
  LoggedIn: false,
};`,
  },
  {
    actor: "Express",
    title: "POST /search/ selects a city record",
    detail: "The public search handler maps the submitted city string to Petra's city document id.",
    code: `app.post("/search/", (req, res) => {
  if (req.body.Query === "Bangalore, India") {
    // city document: INDKABLR
  }
});`,
  },
  {
    actor: "MongoDB",
    title: "Mongoose reads the hotel list",
    detail: "Hotel is the city-level model. Its hotelList array contains the search-card summaries.",
    code: `Hotel.findOne(
  { _id: "INDKABLR" },
  (err, hotel) => { /* ... */ }
);`,
  },
  {
    actor: "Express",
    title: "The API returns the summaries",
    detail: "The backend sends the city's embedded hotelList; no pricing or filter computation happens here.",
    code: `res.send({
  results: hotel.hotelList,
});`,
  },
  {
    actor: "Browser",
    title: "React caches the result and renders",
    detail: "Header.jsx stores the route props for refresh/navigation recovery, then pushes /search.",
    code: `sessionStorage.setItem(
  "searchPageProps",
  JSON.stringify({ pathname: "/search", props: {
    results, sdate, edate, adults, pets,
    LoggedIn: false, coordinates,
  }})
);
history.push("/search");`,
  },
] as const;

export const AUTH_FLOW: readonly PetraTraceStep[] = [
  {
    actor: "Google",
    title: "GoogleLogin completes in the browser",
    detail: "react-google-login returns a Google ID token, Google account id, and profile metadata to SignUp.jsx.",
    code: `<GoogleLogin
  clientId={GOOGLE_CLIENT_ID}
  onSuccess={responseSuccess}
  cookiePolicy="single_host_origin"
/>

// response: tokenId, googleId, profileObj`,
  },
  {
    actor: "React",
    title: "SignUp posts proof to Petra",
    detail: "The SPA forwards the ID token and account id to the separate Express service on port 3001.",
    code: `axios.post(
  "http://localhost:3001/auth/google/account/",
  { tokenId, googleId, imageUrl }
);`,
  },
  {
    actor: "Express",
    title: "The server verifies the ID token",
    detail: "google-auth-library checks the token for the configured audience, then reads the verified name and email.",
    code: `client.verifyIdToken({
  idToken: tokenId,
  audience: process.env.CLIENT_ID,
});

const { email_verified, name, email } = response.payload;`,
  },
  {
    actor: "MongoDB",
    title: "The user is found or inserted",
    detail: "Petra looks up the verified email. A first-time account is inserted into the PetraUser collection with 1000 perks.",
    code: `User.findOne({ email }, (err, user) => {
  if (!user) User.insertMany([newUser]);
});`,
  },
  {
    actor: "Express",
    title: "Express returns a JWT and profile",
    detail: "The backend signs a seven-day JWT and sends it with the user projection.",
    code: `const token = jwt.sign(
  { _id: user._id },
  process.env.CLIENT_SECRET,
  { expiresIn: "7d" }
);

res.json({ token, user });`,
  },
  {
    actor: "Browser",
    title: "The client keeps the profile, not the JWT",
    detail: "SignUp.jsx stores profile.props.LoggedIn, updates any pending search/hotel state, and resumes the saved hotel route.",
    code: `sessionStorage.setItem("profile", JSON.stringify({
  pathname: "/auth/google/account",
  props: { name, emailID, perks, imageUrl, LoggedIn: true },
}));

history.push(savedHotel.pathname);`,
  },
] as const;

export interface BackendRoute {
  method: "GET" | "POST";
  path: string;
  reads: string;
  response: string;
  guarded: boolean;
}

export const BACKEND_ROUTES: readonly BackendRoute[] = [
  { method: "POST", path: "/search/", reads: "Hotel city document", response: "hotelList[]", guarded: false },
  { method: "POST", path: "/auth/google/account/search/", reads: "Hotel city document", response: "hotelList[]", guarded: false },
  { method: "GET", path: "/hotel/:hotelID", reads: "ALLhotelCollection", response: "hotel detail", guarded: false },
  { method: "GET", path: "/auth/google/account/hotel/:hotelID", reads: "ALLhotelCollection", response: "hotel detail", guarded: false },
] as const;

export interface SessionValue {
  key: "home" | "searchPageProps" | "hotel" | "profile";
  preview: string;
  purpose: string;
}

export interface SessionMoment {
  id: string;
  label: string;
  route: string;
  change: string;
  values: readonly SessionValue[];
}

const HOME: SessionValue = {
  key: "home",
  preview: `{ "showLand": false }`,
  purpose: "Skip the landing animation for the rest of this tab.",
};

const SEARCH_GUEST: SessionValue = {
  key: "searchPageProps",
  preview: `{ pathname: "/search", props: { results: [6 hotels], LoggedIn: false, … } }`,
  purpose: "Recover the search results, dates, guest counts, pets, and map position.",
};

const HOTEL_GUEST: SessionValue = {
  key: "hotel",
  preview: `{ pathname: "/auth/google/account/hotel/3", props: { hotelID: 3, LoggedIn: false, … } }`,
  purpose: "Carry the selected hotel and booking intent through the login detour.",
};

const SEARCH_AUTHED: SessionValue = {
  ...SEARCH_GUEST,
  preview: `{ pathname: "/search", props: { results: [6 hotels], LoggedIn: true, … } }`,
};

const HOTEL_AUTHED: SessionValue = {
  ...HOTEL_GUEST,
  preview: `{ pathname: "/auth/google/account/hotel/3", props: { hotelID: 3, LoggedIn: true, … } }`,
};

const PROFILE: SessionValue = {
  key: "profile",
  preview: `{ pathname: "/auth/google/account", props: { name, emailID, perks, imageUrl, LoggedIn: true } }`,
  purpose: "Drive the signed-in UI and auth-prefixed client routes.",
};

export const SESSION_MOMENTS: readonly SessionMoment[] = [
  {
    id: "tab",
    label: "Landing finished",
    route: "/",
    change: "App.js writes home after the intro animation. There is no profile and the user is a guest.",
    values: [HOME],
  },
  {
    id: "search",
    label: "Search completed",
    route: "/search",
    change: "Header.jsx saves the returned hotel summaries and all search inputs before navigation.",
    values: [HOME, SEARCH_GUEST],
  },
  {
    id: "hotel",
    label: "Hotel selected",
    route: "/hotel/3",
    change: "SearchPage.jsx adds hotel. Its saved pathname already points at the authenticated route so login can return here later.",
    values: [HOME, SEARCH_GUEST, HOTEL_GUEST],
  },
  {
    id: "login",
    label: "Google success",
    route: "/auth/google/account/hotel/3",
    change: "SignUp.jsx creates profile, flips both saved LoggedIn flags, then resumes hotel.pathname.",
    values: [HOME, SEARCH_AUTHED, HOTEL_AUTHED, PROFILE],
  },
  {
    id: "logout",
    label: "Signed out",
    route: "/",
    change: "Header.jsx removes profile, searchPageProps, and hotel. The home flag remains until the browser tab closes.",
    values: [HOME],
  },
] as const;
