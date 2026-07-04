// Generate sitemap.xml for the demo site
// Run after next build: node demo/scripts/generate-sitemap.mjs
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "out");
const baseUrl = "https://estimatorsuite.github.io/construction-calculators";

// Import calculator metadata (compiled by next build)
// Since this runs post-build, we read the static params from the out directory
const materialSlugs = [
  "soffit-calculator", "hardie-siding-calculator", "house-repiping-cost-calculator",
  "epoxy-flooring-cost-calculator", "concrete-driveway-cost-calculator",
  "pressure-washing-estimate-calculator", "siding-calculator",
  "spray-foam-insulation-cost-calculator", "ductwork-replacement-cost-calculator",
  "heat-pump-cost-calculator", "deck-footing-calculator", "deck-joist-span-calculator",
  "landscaping-cost-calculator", "bathroom-remodel-cost-calculator",
  "concrete-block-calculator", "furnace-size-calculator", "drywall-calculator",
  "roof-area-calculator", "kitchen-remodel-cost-calculator",
  "gutter-installation-cost-calculator", "metal-roof-calculator", "paint-calculator",
  "laminate-flooring-calculator", "flooring-square-foot-calculator",
  "chain-link-fence-calculator", "gambrel-roof-calculator", "mulch-calculator",
  "gravel-calculator", "tile-calculator", "insulation-r-value-calculator",
  "deck-railing-spacing-calculator", "concrete-calculator", "asphalt-calculator",
  "carpet-calculator", "wallpaper-calculator", "deck-stair-calculator",
];

const tradeSlugs = [
  "markup-calculator", "hvac-estimate-calculator", "electrical-estimate-calculator",
  "plumbing-estimate-calculator", "roofing-estimate-calculator",
  "landscaping-estimate-calculator",
];

const urls = [
  `${baseUrl}/`,
  `${baseUrl}/calculators/`,
  `${baseUrl}/tools/`,
  ...materialSlugs.map((s) => `${baseUrl}/calculators/${s}/`),
  ...tradeSlugs.map((s) => `${baseUrl}/tools/${s}/`),
];

const today = new Date().toISOString().split("T")[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === baseUrl + "/" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

const sitemapPath = join(outDir, "sitemap.xml");

if (existsSync(outDir)) {
  writeFileSync(sitemapPath, sitemap, "utf-8");
  console.log(`Sitemap generated: ${sitemapPath} (${urls.length} URLs)`);
} else {
  console.error(`Output directory not found: ${outDir}`);
  console.error("Run 'npm run build:demo' first.");
  process.exit(1);
}
