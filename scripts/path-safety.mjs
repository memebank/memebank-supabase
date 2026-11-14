import { lstatSync } from 'node:fs';
import { isAbsolute, join, relative, sep } from 'node:path';

// Refuse symlinks in any existing segment of a repository-controlled path.
// Missing components are diagnosed separately by the contract validator.
export function hasSymlinkComponent(root, candidate) {
  const relativePath = relative(root, candidate);
  if (isAbsolute(relativePath) || relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw new Error('path escapes repository root');
  }
  let cursor = root;
  for (const segment of relativePath.split(sep)) {
    if (!segment || segment === '.') continue;
    cursor = join(cursor, segment);
    try {
      if (lstatSync(cursor).isSymbolicLink()) return true;
    } catch (error) {
      if (error?.code === 'ENOENT') return false;
      throw error;
    }
  }
  return false;
}
