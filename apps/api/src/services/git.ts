import { simpleGit, SimpleGit, CloneOptions } from 'simple-git';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { config } from '../config.js';

const CLONE_TIMEOUT = 60000; // 60 seconds

export async function cloneRepository(
  repoUrl: string,
  branch: string = 'main'
): Promise<string> {
  // Create temp directory
  const tempDir = await mkdtemp(join(config.tempDir || tmpdir(), 'vibeaudit-'));

  const git: SimpleGit = simpleGit({
    timeout: {
      block: CLONE_TIMEOUT,
    },
  });

  const cloneOptions: CloneOptions = {
    '--depth': 1, // Shallow clone for speed
    '--branch': branch,
    '--single-branch': null,
  };

  try {
    // Parse and validate URL
    const url = normalizeGitUrl(repoUrl);

    await git.clone(url, tempDir, cloneOptions);

    return tempDir;
  } catch (error) {
    // Clean up on failure
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});

    if (error instanceof Error) {
      // Handle common errors
      if (error.message.includes('not found') || error.message.includes('404')) {
        throw new Error('Repository not found. Check the URL and ensure the repository is public.');
      }
      if (error.message.includes('authentication') || error.message.includes('permission')) {
        throw new Error('Access denied. Private repositories require authentication.');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Repository clone timed out. The repository may be too large.');
      }
      if (error.message.includes('branch')) {
        throw new Error(`Branch "${branch}" not found. Try "main" or "master".`);
      }
    }

    throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function cleanupRepository(repoPath: string): Promise<void> {
  try {
    await rm(repoPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to cleanup repository at ${repoPath}:`, error);
    // Don't throw - cleanup failure shouldn't break the scan
  }
}

function normalizeGitUrl(url: string): string {
  // Handle various GitHub URL formats
  let normalized = url.trim();

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '');

  // Convert HTTPS browse URLs to clone URLs
  // https://github.com/user/repo -> https://github.com/user/repo.git
  if (normalized.match(/^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/)) {
    if (!normalized.endsWith('.git')) {
      normalized += '.git';
    }
  }

  // Convert SSH URLs to HTTPS for easier access
  // git@github.com:user/repo.git -> https://github.com/user/repo.git
  if (normalized.startsWith('git@github.com:')) {
    normalized = normalized
      .replace('git@github.com:', 'https://github.com/')
      .replace(/\.git$/, '') + '.git';
  }

  // Validate URL format
  try {
    new URL(normalized);
  } catch {
    throw new Error('Invalid repository URL format');
  }

  return normalized;
}

export async function getRepoInfo(repoPath: string): Promise<{
  name: string;
  branch: string;
  lastCommit: string;
  author: string;
}> {
  const git: SimpleGit = simpleGit(repoPath);

  try {
    const [branchSummary, log] = await Promise.all([
      git.branch(),
      git.log({ maxCount: 1 }),
    ]);

    return {
      name: repoPath.split('/').pop() || 'unknown',
      branch: branchSummary.current,
      lastCommit: log.latest?.hash.slice(0, 7) || 'unknown',
      author: log.latest?.author_name || 'unknown',
    };
  } catch {
    return {
      name: repoPath.split('/').pop() || 'unknown',
      branch: 'unknown',
      lastCommit: 'unknown',
      author: 'unknown',
    };
  }
}
