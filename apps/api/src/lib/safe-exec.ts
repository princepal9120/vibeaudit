import { spawn, SpawnOptions } from 'child_process';

export interface SafeSpawnOptions {
  timeout?: number;
  cwd?: string;
  maxBuffer?: number;
  env?: NodeJS.ProcessEnv;
}

export interface SafeSpawnResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

/**
 * Safe wrapper around child_process.spawn that prevents command injection.
 *
 * Unlike exec(), spawn() uses an argument array instead of shell string
 * interpolation, which prevents shell metacharacter injection attacks.
 *
 * @param command - The command to run (e.g., 'semgrep', 'npm', 'trivy')
 * @param args - Array of arguments (NOT interpolated into a shell string)
 * @param options - Spawn options including timeout, cwd, maxBuffer
 * @returns Promise with stdout, stderr, and exit code
 *
 * @example
 * // SAFE: Arguments are passed as array elements
 * await safeSpawn('semgrep', ['scan', '--config', 'auto', '--json', repoPath]);
 *
 * // VULNERABLE (old pattern with exec):
 * // exec(`semgrep scan --config auto --json "${repoPath}"`)
 * // If repoPath = "; rm -rf /", this would execute the malicious command
 */
export function safeSpawn(
  command: string,
  args: string[],
  options: SafeSpawnOptions = {}
): Promise<SafeSpawnResult> {
  const { timeout = 120000, cwd, maxBuffer = 50 * 1024 * 1024, env } = options;

  return new Promise((resolve, reject) => {
    const spawnOptions: SpawnOptions = {
      cwd,
      env: env || process.env,
      // Do NOT use shell: true - that would reintroduce injection risk
      shell: false,
    };

    const child = spawn(command, args, spawnOptions);

    let stdout = '';
    let stderr = '';
    let stdoutSize = 0;
    let stderrSize = 0;
    let killed = false;

    // Set up timeout
    const timeoutId = setTimeout(() => {
      killed = true;
      child.kill('SIGKILL');
      reject(new Error(`Command timed out after ${timeout}ms: ${command}`));
    }, timeout);

    child.stdout?.on('data', (data: Buffer) => {
      stdoutSize += data.length;
      if (stdoutSize <= maxBuffer) {
        stdout += data.toString();
      }
    });

    child.stderr?.on('data', (data: Buffer) => {
      stderrSize += data.length;
      if (stderrSize <= maxBuffer) {
        stderr += data.toString();
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      if (killed) return; // Already rejected via timeout

      resolve({
        stdout,
        stderr,
        exitCode: code,
      });
    });
  });
}

/**
 * Wrapper that throws on non-zero exit code (similar to execAsync behavior).
 * Useful when you expect the command to succeed.
 */
export async function safeSpawnStrict(
  command: string,
  args: string[],
  options: SafeSpawnOptions = {}
): Promise<SafeSpawnResult> {
  const result = await safeSpawn(command, args, options);

  if (result.exitCode !== 0) {
    const error = new Error(
      `Command failed with exit code ${result.exitCode}: ${command} ${args.join(' ')}`
    ) as Error & { stdout: string; stderr: string; exitCode: number | null };
    error.stdout = result.stdout;
    error.stderr = result.stderr;
    error.exitCode = result.exitCode;
    throw error;
  }

  return result;
}
