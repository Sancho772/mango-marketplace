import { execSync } from 'node:child_process';

async function run() {
  const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (status.length > 0) {
    throw new Error('Working directory has uncommitted files:\n' + status);
  }

  const localHead = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  const remoteHead = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();

  if (localHead !== remoteHead) {
    throw new Error(`Local branch (${localHead}) is not in sync with origin/main (${remoteHead})`);
  }

  console.log('git synchronization verified');
}

run().catch(err => {
  console.error(err.message);
  process.exit(1);
});
