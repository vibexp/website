/**
 * The latest release, resolved at build time.
 *
 * Nothing about a version may be hand-written. This asks the GitHub API once
 * per build and writes src/data/release.json, which the pages import, so the
 * version in the hero, the one on the install button and the image tag in the
 * install section are one fact rather than three.
 *
 * Two properties are deliberate:
 *
 *   - **It never fails the build.** No network, no token, a rate limit, a
 *     repository with no releases yet: each falls back to `version: null` and
 *     the `releases/latest` redirect, and the pages then say "latest" rather
 *     than a number. A site that cannot build because GitHub is slow is worse
 *     than one showing a generic link.
 *   - **It runs at build time, not in the visitor's browser.** A client-side
 *     fetch would put a third-party request on every page view and would show
 *     a blank version to anyone the API rate-limits.
 *
 * Unlike the sibling SlackCLI and Agento sites, VibeXP releases carry no
 * downloadable assets: the deliverable is the container image
 * `ghcr.io/vibexp/vibexp`, tagged per release, and the install section is a
 * `docker compose` recipe. So only the version and its date are read. And
 * because the release lives in a DIFFERENT repository from this site, a
 * release there does not rebuild this one by itself - see the triggers in
 * .github/workflows/pages.yml.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../src/data/release.json');
const REPO_OUT = resolve(here, '../src/data/repo.json');
const REPO_API = 'https://api.github.com/repos/vibexp/vibexp';
const API = `${REPO_API}/releases/latest`;
const RELEASES = 'https://github.com/vibexp/vibexp/releases';

/** The published image. Every release is pushed under its version and `latest`. */
const IMAGE = 'ghcr.io/vibexp/vibexp';

function fallback(reason) {
  console.warn(`fetch-release: ${reason}, falling back to "latest"`);
  return {
    version: null,
    tag: null,
    url: `${RELEASES}/latest`,
    publishedAt: null,
    resolved: false,
    image: `${IMAGE}:latest`,
  };
}

function headers() {
  const h = { accept: 'application/vnd.github+json', 'user-agent': 'vibexp-site-build' };
  if (process.env.GITHUB_TOKEN) h.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

/** Star count for the call to action. A missing count renders no number. */
async function repoStats() {
  try {
    const res = await fetch(REPO_API, { headers: headers(), signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const r = await res.json();
    console.log(`fetch-release: repo has ${r.stargazers_count} stars`);
    return { stars: r.stargazers_count, forks: r.forks_count, resolved: true };
  } catch (err) {
    console.warn(`fetch-release: could not read repo stats (${err.message})`);
    return { stars: null, forks: null, resolved: false };
  }
}

async function main() {
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(REPO_OUT, JSON.stringify(await repoStats(), null, 2) + '\n', 'utf8');

  let data;
  try {
    const res = await fetch(API, { headers: headers(), signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const release = await res.json();
    const version = String(release.tag_name).replace(/^v/, '');
    data = {
      version,
      tag: release.tag_name,
      url: release.html_url,
      publishedAt: release.published_at,
      resolved: true,
      image: `${IMAGE}:${version}`,
    };
    console.log(`fetch-release: ${data.tag}`);
  } catch (err) {
    data = fallback(err.message);
  }

  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

await main();
