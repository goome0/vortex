/* eslint-disable no-console */
const axios = require("axios");

function getEnv(name, fallback = "") {
  const v = process.env[name];
  return (v == null ? fallback : String(v)).trim();
}

function parseIntOr(value, fallback) {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseArgs(argv) {
  const out = {
    count: undefined,
    token: undefined,
    baseUrl: undefined,
  };

  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i] ?? "";

    if (a === "--token") {
      out.token = (args[i + 1] ?? "").trim();
      i++;
      continue;
    }
    if (a.startsWith("--token=")) {
      out.token = a.slice("--token=".length).trim();
      continue;
    }

    if (a === "--base-url") {
      out.baseUrl = (args[i + 1] ?? "").trim();
      i++;
      continue;
    }
    if (a.startsWith("--base-url=")) {
      out.baseUrl = a.slice("--base-url=".length).trim();
      continue;
    }

    if (a === "--count") {
      out.count = parseIntOr(args[i + 1], undefined);
      i++;
      continue;
    }
    if (a.startsWith("--count=")) {
      out.count = parseIntOr(a.slice("--count=".length), undefined);
      continue;
    }

    if (!a.startsWith("-") && out.count == null) {
      out.count = parseIntOr(a, undefined);
      continue;
    }
  }

  return out;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function yyyyMmDd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function buildDummyImageUrl(text) {
  const encoded = encodeURIComponent(text).replace(/%20/g, "+");
  return `https://dummyimage.com/1200x700/111111/ffffff.png?text=${encoded}`;
}

function buildContentHtml({ title, category, hasVideo, hasGif, index }) {
  const parts = [];
  parts.push(`<p><strong>${category}</strong> — ${title}</p>`);
  parts.push("<p>This is a launcher news item generated for development/testing.</p>");

  if (hasVideo) {
    // Small, stable public MP4 (CC0) used by MDN docs.
    const videoUrl = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
    parts.push(
      `<h3>Preview Video</h3><video controls preload="metadata" playsinline src="${videoUrl}"></video>`,
    );
  } else if (hasGif) {
    // Static gif with a real .gif extension.
    const gifUrl =
      "https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif";
    parts.push(`<h3>Animated Preview</h3><img src="${gifUrl}" alt="Preview gif"/>`);
  }

  parts.push("<h3>Highlights</h3>");
  parts.push(
    `<ul>
      <li>Server: ${yyyyMmDd(new Date())}</li>
      <li>Patch: ${Math.floor(index / 6) + 1}.${(index % 6) + 1}</li>
      <li>Notes: Updated tooltips and UI text</li>
    </ul>`,
  );

  parts.push("<h3>Details</h3>");
  parts.push(
    `<table>
      <thead><tr><th>Item</th><th>Change</th><th>Impact</th></tr></thead>
      <tbody>
        <tr><td>Gear</td><td>Drop rates adjusted</td><td>More consistent progression</td></tr>
        <tr><td>Skills</td><td>Cooldown tuning</td><td>Better class pacing</td></tr>
        <tr><td>Events</td><td>Rotation updated</td><td>More weekly variety</td></tr>
      </tbody>
    </table>`,
  );

  return parts.join("\n");
}

function buildNewsItem(index) {
  const categories = [
    "New Gear",
    "New Skills",
    "Balance",
    "Event",
    "Patch Notes",
    "Dev Update",
    "Maintenance",
    "Community",
  ];

  const badgeVariants = ["default", "info", "warning", "danger"];
  const category = categories[index % categories.length];
  const badgeVariant = badgeVariants[index % badgeVariants.length];

  const hasVideo = index % 9 === 0;
  const hasGif = !hasVideo && index % 7 === 0;

  const dateTag = yyyyMmDd(new Date(Date.now() - index * 86400000));
  const title = `${category}: Update ${pad2(index + 1)} (${dateTag})`;

  const imageUrl = hasVideo
    ? "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    : buildDummyImageUrl(`${category} ${pad2(index + 1)}`);

  const excerpt = `MMORPG news: ${category.toLowerCase()} update #${index + 1}.`;

  return {
    title,
    excerpt,
    category,
    badgeVariant,
    featured: index === 0,
    isPublished: true,
    imageUrl,
    // Keep HTML to render rich content (tables, images, video).
    contentHtml: buildContentHtml({ title, category, hasVideo, hasGif, index }),
  };
}

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBjb21wX2hhY2suZ2l0aHViLmNvbSIsImRpc3BfbmFtZSI6Ikdob3N0YmF5IiwidXNlcl9sZXZlbCI6MTAwMCwiZW5hYmxlZCI6dHJ1ZSwiY2hhbGxlbmdlIjoiNWRkMjJiMTExOCIsInR5cCI6ImFjY2VzcyIsImlhdCI6MTc3MTc2MzA3MSwiZXhwIjoxNzcxNzY2NjcxfQ.t40H8iDssG-DY8NesC5_WQdfHtRe2JI4rb4wMZAiVXY"


async function main() {
  const args = parseArgs(process.argv);
  const baseUrl = args.baseUrl || getEnv("VORTEX_API_BASE_URL", "http://localhost:6005");
  const count = args.count ?? parseIntOr(getEnv("COUNT", "30"), 30);

  if (!token) {
    console.error("Missing admin token.");
    console.error("Set env var VORTEX_ADMIN_TOKEN (or ADMIN_TOKEN) or pass --token <JWT>.");
    process.exit(1);
  }

  const api = axios.create({
    baseURL: baseUrl,
    timeout: 30_000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  console.log(`Seeding ${count} news items into ${baseUrl}...`);

  for (let i = 0; i < count; i++) {
    const payload = buildNewsItem(i);
    try {
      await api.post("/admin/news/create", payload);
      console.log(`[${pad2(i + 1)}/${pad2(count)}] created: ${payload.title}`);
    } catch (err) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      console.error(`[${pad2(i + 1)}/${pad2(count)}] failed: ${payload.title}`);
      if (status) console.error(`HTTP ${status}`);
      if (body) {
        try {
          console.error(JSON.stringify(body, null, 2));
        } catch {
          console.error(String(body));
        }
      }
      console.error(`code: ${String(err?.code ?? "")}`);
      console.error(`message: ${String(err?.message ?? err)}`);
      process.exit(1);
    }
  }

  console.log("Done.");
}

main();
