/**
 * Wraps `craco build` so every production build is stamped with a unique
 * version. The same version is:
 *  - baked into the JS bundle via REACT_APP_VERSION (available at runtime
 *    as process.env.REACT_APP_VERSION),
 *  - written to build/version.json, served by nginx with no-cache headers.
 *
 * The app compares its own baked-in version against version.json at
 * runtime (see useAppVersionCheck) to detect that a new deployment
 * happened and reload itself.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const version = Date.now().toString();
const buildDir = path.resolve(__dirname, '..', 'build');

console.log(`[build] Building frontend with version ${version}...`);

execSync('craco build', {
  stdio: 'inherit',
  env: { ...process.env, REACT_APP_VERSION: version },
});

fs.writeFileSync(
  path.join(buildDir, 'version.json'),
  JSON.stringify({ version })
);

console.log(`[build] Wrote version.json (${version})`);
