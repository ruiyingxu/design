const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const assetsRoot = path.join(root, "assets");
const applyChanges = process.argv.includes("--apply");
const isDryRun = !applyChanges;
const sourcePattern = /(?:\.\/)?(assets\/[A-Za-z0-9_./-]+\.(?:png|jpe?g))/gi;
const codeExtensions = new Set([".html", ".css", ".js"]);
const ignoredCodeDirectories = new Set([".git", "assets"]);

function listCodeFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredCodeDirectories.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listCodeFiles(fullPath);
    return codeExtensions.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
}

const codeFiles = listCodeFiles(root);

const sourcePaths = new Set();
for (const file of codeFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(sourcePattern)) sourcePaths.add(match[1]);
}

const mappings = new Map();

async function convert(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const metadata = await sharp(absolutePath).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Missing dimensions: ${relativePath}`);

  const largestWidth = Math.min(metadata.width, 2400);
  const widths = [...new Set([640, 1280, largestWidth].filter((width) => width <= largestWidth))]
    .sort((a, b) => a - b);
  const extension = path.extname(relativePath);
  const base = relativePath.slice(0, -extension.length);
  const variants = [];

  for (const width of widths) {
    const output = `${base}-${width}.webp`;
    if (!isDryRun) {
      await sharp(absolutePath)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 84, alphaQuality: 92, effort: 4, smartSubsample: true })
        .toFile(path.join(root, output));
    }
    variants.push({
      path: output,
      width,
      height: Math.round((metadata.height / metadata.width) * width)
    });
  }

  mappings.set(relativePath, {
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    variants
  });
  process.stdout.write(`${isDryRun ? "Would convert" : "Converted"} ${relativePath}\n`);
}

function writeTextFile(file, content) {
  const previous = fs.readFileSync(file, "utf8");
  if (previous === content) return;
  if (isDryRun) {
    process.stdout.write(`Would update ${path.relative(root, file)}\n`);
    return;
  }
  fs.writeFileSync(file, content);
}

function setAttribute(tag, name, value) {
  const pattern = new RegExp(`\\s${name}=(?:"[^"]*"|'[^']*')`, "i");
  const attribute = ` ${name}="${value}"`;
  if (pattern.test(tag)) return tag.replace(pattern, attribute);
  if (/\s*\/>$/.test(tag)) return tag.replace(/\s*\/>$/, `${attribute} />`);
  return tag.replace(/\s*>$/, `${attribute}>`);
}

function removeAttribute(tag, name) {
  return tag.replace(new RegExp(`\\s${name}=(?:"[^"]*"|'[^']*')`, "gi"), "");
}

function sizesForContext(context) {
  if (/project-detail-more-card|works-project-card|project-list/.test(context)) {
    return "(max-width: 900px) 100vw, 33vw";
  }
  if (/gallery-row|forma-brand-grid|about-grid/.test(context)) {
    return "(max-width: 900px) 100vw, 50vw";
  }
  return "100vw";
}

function updateHtml(file) {
  let content = fs.readFileSync(file, "utf8");
  let imageIndex = 0;
  content = content.replace(/<img\b[^>]*>/gi, (originalTag, offset) => {
    const srcMatch = originalTag.match(/\ssrc="([^"]+)"/i);
    const eagerLimit = path.basename(file) === "index.html" ? 2 : 1;
    const isEager = imageIndex < eagerLimit;
    imageIndex += 1;

    let tag = setAttribute(originalTag, "loading", isEager ? "eager" : "lazy");
    tag = setAttribute(tag, "decoding", "async");
    tag = removeAttribute(tag, "fetchpriority");
    if (isEager) tag = setAttribute(tag, "fetchpriority", "high");
    if (!srcMatch) return tag;

    const normalized = srcMatch[1].replace(/^\.\//, "");
    const mapping = mappings.get(normalized);
    if (!mapping) return tag;

    const largest = mapping.variants[mapping.variants.length - 1];
    const srcset = mapping.variants.map((variant) => `./${variant.path} ${variant.width}w`).join(", ");
    const context = content.slice(Math.max(0, offset - 600), offset);
    tag = setAttribute(tag, "src", `./${largest.path}`);
    tag = setAttribute(tag, "srcset", srcset);
    tag = setAttribute(tag, "sizes", sizesForContext(context));
    tag = setAttribute(tag, "width", String(largest.width));
    tag = setAttribute(tag, "height", String(largest.height));
    return tag;
  });

  content = content.replace(/(poster=")\.\/(assets\/[^"]+\.(?:png|jpe?g))(\")/gi, (_, prefix, source, suffix) => {
    const mapping = mappings.get(source);
    if (!mapping) return `${prefix}./${source}${suffix}`;
    return `${prefix}./${mapping.variants[mapping.variants.length - 1].path}${suffix}`;
  });

  writeTextFile(file, content);
}

function updateScript(file) {
  let content = fs.readFileSync(file, "utf8");
  for (const [source, mapping] of mappings) {
    const largest = mapping.variants[mapping.variants.length - 1];
    content = content.split(`./${source}`).join(`./${largest.path}`);
  }
  writeTextFile(file, content);
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

function referencedAssets() {
  const referenced = new Set();
  const pattern = /assets\/[A-Za-z0-9_./-]+\.(?:avif|gif|jpe?g|png|webp|mp4|mov|woff2?|ttf)/gi;
  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");
    for (const match of content.matchAll(pattern)) referenced.add(match[0]);
  }

  const imageBasePattern = /imageBase\s*:\s*["'`](\.\/?assets\/[A-Za-z0-9_./-]+)["'`]/gi;
  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");
    for (const match of content.matchAll(imageBasePattern)) {
      const base = match[1].replace(/^\.\//, "");
      [640, 1280, 2400].forEach((width) => referenced.add(`${base}-${width}.webp`));
    }
  }

  for (const mapping of mappings.values()) {
    mapping.variants.forEach((variant) => referenced.add(variant.path));
  }

  // These assets are selected at runtime rather than through project-data imageBase fields.
  ["assets/now-assist-directions", "assets/now-assist-takeaways"].forEach((base) => {
    [640, 1280, 2400].forEach((width) => referenced.add(`${base}-${width}.webp`));
  });
  return referenced;
}

(async () => {
  process.stdout.write(`Mode: ${isDryRun ? "dry-run (use --apply to write files)" : "apply"}\n`);
  process.stdout.write(`Scanning ${codeFiles.length} HTML, CSS, and JavaScript files\n`);

  const beforeBytes = listFiles(assetsRoot)
    .reduce((total, file) => total + fs.statSync(file).size, 0);
  const initiallyReferenced = referencedAssets();

  for (const source of [...sourcePaths].sort()) await convert(source);
  for (const file of codeFiles.filter((file) => file.endsWith(".html"))) updateHtml(file);
  updateScript(path.join(root, "script.js"));

  const referenced = referencedAssets();
  // Never delete an asset that was referenced when this run started, even if
  // an HTML rewrite points to a newly generated replacement later in the run.
  initiallyReferenced.forEach((relative) => referenced.add(relative));
  const plannedOutputs = new Set(
    [...mappings.values()].flatMap((mapping) => mapping.variants.map((variant) => variant.path))
  );
  const missingReferenced = [...referenced]
    .filter((relative) => !plannedOutputs.has(relative) && !fs.existsSync(path.join(root, relative)))
    .sort();
  if (missingReferenced.length) {
    throw new Error(`Referenced assets are missing:\n${missingReferenced.join("\n")}`);
  }

  const deleteCandidates = [];
  for (const file of listFiles(assetsRoot)) {
    const relative = path.relative(root, file);
    if (referenced.has(relative)) continue;
    deleteCandidates.push(relative);
  }

  const referencedDeleteCandidates = deleteCandidates.filter((relative) => referenced.has(relative));
  if (referencedDeleteCandidates.length) {
    throw new Error(`Referenced assets entered the deletion list:\n${referencedDeleteCandidates.join("\n")}`);
  }

  if (isDryRun) {
    deleteCandidates.forEach((relative) => process.stdout.write(`Would delete ${relative}\n`));
  } else {
    deleteCandidates.forEach((relative) => fs.unlinkSync(path.join(root, relative)));
  }

  const afterFiles = listFiles(assetsRoot);
  const afterBytes = afterFiles.reduce((total, file) => total + fs.statSync(file).size, 0);
  const manifest = {
    generatedAt: new Date().toISOString(),
    mode: isDryRun ? "dry-run" : "apply",
    scannedCodeFiles: codeFiles.length,
    referencedAssets: referenced.size,
    protectedCurrentReferences: initiallyReferenced.size,
    referencedDeleteCandidates: referencedDeleteCandidates.length,
    missingReferencedAssets: missingReferenced.length,
    convertedSources: mappings.size,
    deleteCandidates: deleteCandidates.length,
    deletedFiles: isDryRun ? 0 : deleteCandidates.length,
    beforeBytes,
    afterBytes,
    savedBytes: beforeBytes - afterBytes
  };
  if (!isDryRun) {
    fs.writeFileSync(path.join(root, "asset-optimization-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  }
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
