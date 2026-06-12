#!/usr/bin/env node
/**
 * update-founder-living-resume.mjs
 * --------------------------------------------------------------------------
 * Refreshes the HYBRID living-resume data files that feed the homepage
 * "About the founder" section (#about) on this.live.
 *
 * It does NOT touch the manually-authored core (bio, experience, principles,
 * curated skill groups, project notes). It ONLY refreshes the auto strips:
 *   - assets/currently-building.json  → status + last_active + ordering, from
 *     real git activity across the fleet (most-recently-touched first).
 *   - assets/founder-skills.json      → `detected.active_now`, from the skills
 *     associated with the projects that have been touched most recently.
 *
 * All founding work is framed under the this.live LLC.
 *
 * USAGE
 *   node scripts/update-founder-living-resume.mjs            # write changes
 *   node scripts/update-founder-living-resume.mjs --dry-run  # print, no write
 *   FLEET_ROOT=/Users/jarvis/this.live node scripts/update-founder-living-resume.mjs
 *
 * CRON (refresh nightly at 06:15; static site, Railway autodeploys on push):
 *   15 6 * * *  cd /Users/jarvis/repos/thislive-landing \
 *                 && /usr/bin/env node scripts/update-founder-living-resume.mjs \
 *                 && git add assets/currently-building.json assets/founder-skills.json \
 *                 && git commit -m "chore(about): refresh living-resume data" \
 *                 && git push origin design/award-winning-v1   # (or main after QA)
 *
 * The script is intentionally dependency-free (Node >= 18, built-ins only).
 * --------------------------------------------------------------------------
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const ASSETS = join(REPO_ROOT, 'assets');
const DRY_RUN = process.argv.includes('--dry-run');

/** Where the founding-work repos live. Override with FLEET_ROOT. */
const FLEET_ROOT = process.env.FLEET_ROOT || '/Users/jarvis/this.live';

/**
 * Map each portfolio entry (by name) to the repo dir that backs it, relative
 * to FLEET_ROOT, plus the skills its recent activity implies. The updater uses
 * the repo's last-commit date for `last_active`; if a repo is missing it keeps
 * the value already in the JSON (never invents activity).
 */
const PROJECT_REPOS = {
  'Cortex Suite':         { dir: 'cortex-suite/cortex',       skills: ['Mnemos memory plane', 'Agent Fabric orchestration', 'Maestro routing'] },
  'Maestro':              { dir: 'cortex-suite/maestro',      skills: ['Maestro routing', 'SGLang', 'vLLM', 'Ollama'] },
  'Mnemos':               { dir: 'cortex-suite/mnemos',       skills: ['Mnemos memory plane', 'NAS-backed docs'] },
  'Agent Fabric':         { dir: 'cortex-suite/agent-fabric', skills: ['Agent Fabric orchestration', 'multi-agent workspace bootstrapping'] },
  'Forge':                { dir: 'cortex-suite/forge',        skills: ['LoRA / adapter training', 'Hugging Face', 'eval suites'] },
  'Surfaces':             { dir: 'cortex-suite/surfaces',     skills: ['browser & vision tooling', 'MCP / plugins'] },
  'Beacon':               { dir: 'beacon',                    skills: ['Railway', 'Cloudflare'] },
  'Signal & Noise':       { dir: 'signal-and-noise',          skills: ['content pipelines', 'Buffer / social scheduling'] },
  'Fieldhouse Games':     { dir: 'fieldhouse',                skills: ['MiniMax Code'] },
  'FTAG · Age of Arrows': { dir: 'ftag-studio',               skills: ['Claude Code', 'multi-agent workspace bootstrapping'] },
  'Digital Products Lab': { dir: 'digital-products-lab',      skills: ['content pipelines', 'Buffer / social scheduling', 'founder-operated publishing'] },
};

/** Skills always credited to whatever was committed today (deploy/ops surface). */
const ALWAYS_ACTIVE = ['Claude Code', 'Railway', 'Cloudflare'];

function lastCommitDate(repoDir) {
  const full = join(FLEET_ROOT, repoDir);
  if (!existsSync(join(full, '.git'))) return null;
  try {
    const out = execFileSync('git', ['-C', full, 'log', '-1', '--format=%cs'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function loadJSON(name) {
  return JSON.parse(readFileSync(join(ASSETS, name), 'utf8'));
}

function saveJSON(name, obj) {
  const text = JSON.stringify(obj, null, 2) + '\n';
  if (DRY_RUN) {
    console.log(`\n--- ${name} (dry-run, not written) ---\n${text}`);
  } else {
    writeFileSync(join(ASSETS, name), text);
    console.log(`wrote ${name}`);
  }
}

const today = new Date().toISOString().slice(0, 10);

// ---- 1. currently-building.json: refresh last_active + reorder by recency ----
const building = loadJSON('currently-building.json');
const recencyByName = {};

for (const entry of building.building) {
  const repo = PROJECT_REPOS[entry.name];
  if (repo) {
    const d = lastCommitDate(repo.dir);
    if (d) entry.last_active = d; // only update when we actually have a real date
  }
  recencyByName[entry.name] = entry.last_active || '0000-00-00';
}

// Live first, then build/beta, then by most-recent activity within tier.
const TIER = { live: 0, beta: 1, build: 2, plan: 3 };
building.building.sort((a, b) => {
  const t = (TIER[a.status] ?? 9) - (TIER[b.status] ?? 9);
  if (t !== 0) return t;
  return (recencyByName[b.name] || '').localeCompare(recencyByName[a.name] || '');
});
building.updated = today;
saveJSON('currently-building.json', building);

// ---- 2. founder-skills.json: rewrite detected.active_now from recent work ----
const skills = loadJSON('founder-skills.json');

// Projects touched within the last 4 days are "active now".
const ACTIVE_WINDOW_DAYS = 4;
const cutoff = new Date(Date.now() - ACTIVE_WINDOW_DAYS * 86400_000)
  .toISOString()
  .slice(0, 10);

const activeSet = new Set(ALWAYS_ACTIVE);
for (const [name, repo] of Object.entries(PROJECT_REPOS)) {
  const d = recencyByName[name] || lastCommitDate(repo.dir);
  if (d && d >= cutoff) repo.skills.forEach((s) => activeSet.add(s));
}

skills.detected = skills.detected || {};
skills.detected.active_now = [...activeSet];
skills.updated = today;
saveJSON('founder-skills.json', skills);

console.log(
  `\nliving-resume refresh complete (${DRY_RUN ? 'dry-run' : 'written'}). ` +
    `Active-now skills: ${activeSet.size}. Building entries: ${building.building.length}.`
);
