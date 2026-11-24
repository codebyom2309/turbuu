import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatFileSize,
  reorderProfileSections,
  sanitizeS3FileName,
  sanitizeUrl,
  slugify,
  toggleProfileSection,
  validateUploadRequest,
  createInquirySchema,
} from './validators';
import { DEFAULT_SECTION_CONFIG } from './types';

test('sanitizeUrl allows https, http, mailto, and relative paths while blocking javascript/data schemes', () => {
  assert.equal(sanitizeUrl('https://turbobits.in/projects'), 'https://turbobits.in/projects');
  assert.equal(sanitizeUrl('/images/project-ai-vision.jpg'), '/images/project-ai-vision.jpg');
  assert.equal(sanitizeUrl('mailto:hello@turbobits.in'), 'mailto:hello@turbobits.in');
  assert.equal(sanitizeUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(sanitizeUrl('//evil.example/payload'), null);
});

test('slugify and sanitizeS3FileName strip unsafe characters and path traversal', () => {
  assert.equal(slugify('AEON-18 Edge Vision!!'), 'aeon-18-edge-vision');
  assert.equal(sanitizeS3FileName('../../etc/passwd'), 'passwd');
  assert.equal(sanitizeS3FileName('release v2..1 (final).apk'), 'release_v2.1__final_.apk');
});

test('validateUploadRequest enforces extension allowlist and size caps', () => {
  const validApk = validateUploadRequest('AR-X4_v2.apk', 24 * 1024 * 1024);
  assert.equal(validApk.ok, true);

  const badExt = validateUploadRequest('malware.exe', 1024);
  assert.equal(badExt.ok, false);

  const tooBigPdf = validateUploadRequest('huge.pdf', 30 * 1024 * 1024);
  assert.equal(tooBigPdf.ok, false);
});

test('formatFileSize formats bytes cleanly', () => {
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(5 * 1024 * 1024), '5.00 MB');
});

test('profile section reordering and visibility toggling preserve sequential sortOrder', () => {
  const reordered = reorderProfileSections(DEFAULT_SECTION_CONFIG, 'skills', 'up');
  assert.equal(reordered[0].key, 'skills');
  assert.equal(reordered[0].sortOrder, 0);
  assert.equal(reordered[1].key, 'about');
  assert.equal(reordered[1].sortOrder, 1);

  const toggled = toggleProfileSection(reordered, 'skills');
  assert.equal(toggled.find((s) => s.key === 'skills')?.visible, false);
});

test('createInquirySchema validates required fields strictly', () => {
  const bad = createInquirySchema.safeParse({
    name: 'A',
    email: 'not-an-email',
    serviceType: 'Web',
    budgetRange: '$5k',
    message: 'short',
  });
  assert.equal(bad.success, false);

  const good = createInquirySchema.safeParse({
    name: 'Karan Mehta',
    email: 'karan@acme.io',
    organization: 'Acme Corp',
    serviceType: 'Full-Stack Platforms',
    budgetRange: '$5,000 – $10,000',
    message: 'We need an interactive 3D product platform with TiDB backend.',
  });
  assert.equal(good.success, true);
});
