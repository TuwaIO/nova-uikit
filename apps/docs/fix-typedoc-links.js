import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The output directory of Typedoc
const API_REF_DIR = path.resolve(__dirname, 'src/API_Reference');
// The root of the docs app, which maps to Storybook's root
const SRC_DIR = path.resolve(__dirname, 'src');

/**
 * Converts an absolute file path into a Storybook Docs Story ID.
 * Example: src/API_Reference/nova-connect/.../ChainSelectorProps.mdx
 * Result: api-reference-nova-connect-...-chainselectorprops--docs
 */
function getStoryId(absoluteFilePath) {
  const relativeToSrc = path.relative(SRC_DIR, absoluteFilePath);
  const parsed = path.parse(relativeToSrc);

  // We combine the directory path and the filename (without extension)
  const withoutExt = path.join(parsed.dir, parsed.name);

  // Storybook ID logic: lowercase, replace all non-alphanumeric with hyphens
  let id = withoutExt.toLowerCase();
  id = id.replace(/[^a-z0-9]/g, '-');
  id = id.replace(/-+/g, '-');
  id = id.replace(/^-|-$/g, '');

  return id + '--docs';
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Markdown link regex: [text](href)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  let changed = false;
  const newContent = content.replace(linkRegex, (match, text, href) => {
    // Ignore external URLs or anchors
    if (href.startsWith('http') || href.startsWith('mailto:')) return match;
    if (href.startsWith('#')) return match;

    const [linkPath, anchor] = href.split('#');

    // Only target typedoc generated pages
    if (!linkPath.endsWith('.mdx') && !linkPath.endsWith('.md')) return match;

    const targetPath = path.resolve(path.dirname(filePath), linkPath);

    // Only resolve links that belong to our src/ folder
    if (!targetPath.startsWith(SRC_DIR)) return match;

    const storyId = getStoryId(targetPath);
    const newHref = `?path=/docs/${storyId}${anchor ? '#' + anchor : ''}`;

    changed = true;
    return `[${text}](${newHref})`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.mdx')) {
      processFile(fullPath);
    }
  }
}

walkDir(API_REF_DIR);
console.log('✅ Storybook links formatted in API Reference.');
