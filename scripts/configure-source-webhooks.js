import { execFileSync } from 'node:child_process';
import { SOURCE_SITES } from '../lib/source-sites.js';

const apply = process.argv.includes('--apply');
const url = process.env.CONTENT_SYNC_WEBHOOK_URL || 'https://launcher.sch-nie.com/api/content-update';
const secret = process.env.CONTENT_SYNC_WEBHOOK_SECRET || '';
if (!url.startsWith('https://')) throw new Error('Webhook URL must use HTTPS');
if (apply && secret.length < 32) throw new Error('Set CONTENT_SYNC_WEBHOOK_SECRET (at least 32 characters) to the same value configured in Vercel');
for (const site of SOURCE_SITES) {
  const endpoint = `repos/${site.repository}/hooks`;
  const hooks = JSON.parse(execFileSync('gh', ['api', endpoint, '--paginate'], { encoding: 'utf8' }));
  const existing = hooks.find(hook => hook.config?.url === url);
  if (!apply) { console.log(`${site.name}: ${existing ? `configured, active=${existing.active}, events=${existing.events.join(',')}` : 'not configured'}; source files remain read-only`); continue; }
  const body = JSON.stringify({ name: 'web', active: true, events: ['push'], config: { url, content_type: 'json', secret, insecure_ssl: '0' } });
  execFileSync('gh', ['api', existing ? `${endpoint}/${existing.id}` : endpoint, '--method', existing ? 'PATCH' : 'POST', '--input', '-'], { input: body, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  console.log(`${site.name}: webhook configured; no repository files were changed`);
}
