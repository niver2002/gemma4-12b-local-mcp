import fs from "node:fs";

const envText = fs.readFileSync("C:/project/Gemma-4-12B/.env", "utf8");
for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const [key, ...valueParts] = trimmed.split("=");
  process.env[key.trim()] = valueParts.join("=").trim();
}

const response = await fetch("https://api.search.brave.com/res/v1/web/search?q=OpenAI&count=3", {
  headers: {
    "X-Subscription-Token": process.env.BRAVE_API_KEY,
    Accept: "application/json",
  },
});

console.log(`status=${response.status}`);
const data = await response.json();
console.log(`web_results=${data.web?.results?.length ?? 0}`);
console.log(`first_title=${data.web?.results?.[0]?.title ?? ""}`);
