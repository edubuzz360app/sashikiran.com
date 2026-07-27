/**
 * Certifications gallery data.
 *
 * To add a new AWARD:
 *   1. Drop the file in public/assets/certificates/
 *   2. Add its filename to AWARD_FILES below (and to manifest.json awards[])
 *
 * Courses are auto-picked from every other image in that folder (Vite glob),
 * with manifest.json "courses" as a runtime fallback.
 */

export const AWARD_FILES = [
  'UdIQV32F6VGqc2GG31b0ac8Nk0g.avif',
  'SuVfvuXRmIThyZYoS8kG9Y8iL1w.webp',
  'encore.jpeg',
  // Add next award filename here ↓
];

/** Course filenames pinned to the front of the courses carousel (in this order). */
export const COURSE_PIN_FIRST = [
  'Screenshot 2026-07-26 001130.png',
];

const AWARD_SET = new Set(AWARD_FILES);
const SKIP = new Set(['_names.txt', '_dir_listing.txt', 'manifest.json', '.gitkeep']);

const certModules = import.meta.glob('./public/assets/certificates/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

function fileNameFromPath(path) {
  return path.split('/').pop().split('\\').pop();
}

export function publicCertSrc(name) {
  return `/assets/certificates/${encodeURI(name)}`;
}

export function toCertItem(name, kind) {
  return {
    src: publicCertSrc(name),
    file: name,
    alt: kind === 'award' ? 'Award certificate' : 'Course certificate',
  };
}

function sortCourses(courses) {
  const pin = COURSE_PIN_FIRST;
  return [...courses].sort((a, b) => {
    const ai = pin.indexOf(a.file);
    const bi = pin.indexOf(b.file);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return a.file.localeCompare(b.file);
  });
}

function collectFromGlob() {
  const awards = [];
  const courses = [];
  const seen = new Set();

  for (const [path, url] of Object.entries(certModules)) {
    const name = fileNameFromPath(path);
    if (!name || SKIP.has(name) || !/\.(avif|webp|png|jpe?g|gif)$/i.test(name)) continue;
    seen.add(name);
    const item = {
      src: typeof url === 'string' ? url : publicCertSrc(name),
      file: name,
      alt: AWARD_SET.has(name) ? 'Award certificate' : 'Course certificate',
    };
    if (AWARD_SET.has(name)) awards.push(item);
    else courses.push(item);
  }

  for (const name of AWARD_FILES) {
    if (seen.has(name)) continue;
    awards.push(toCertItem(name, 'award'));
  }

  // Ensure pinned courses appear even if glob missed them
  for (const name of COURSE_PIN_FIRST) {
    if (seen.has(name) || AWARD_SET.has(name)) continue;
    courses.push(toCertItem(name, 'course'));
    seen.add(name);
  }

  awards.sort((a, b) => AWARD_FILES.indexOf(a.file) - AWARD_FILES.indexOf(b.file));

  return { awards, courses: sortCourses(courses), seen };
}

export const { awards: AWARD_CERTIFICATES, courses: COURSE_CERTIFICATES } = collectFromGlob();

/** Merge runtime manifest (optional) so courses can be listed without rebuild. */
export async function loadCertManifest() {
  try {
    const res = await fetch('/assets/certificates/manifest.json', { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function mergeWithManifest(manifest, currentAwards, currentCourses) {
  if (!manifest) return { awards: currentAwards, courses: currentCourses };

  const awardNames = Array.isArray(manifest.awards) ? manifest.awards : AWARD_FILES;
  const courseNames = Array.isArray(manifest.courses) ? manifest.courses : [];

  const awards =
    currentAwards.length >= awardNames.length
      ? currentAwards
      : awardNames.map((name) => toCertItem(name, 'award'));

  const known = new Set([...awards.map((a) => a.file), ...currentCourses.map((c) => c.file)]);
  const courses = [...currentCourses];

  for (const name of courseNames) {
    if (known.has(name) || AWARD_SET.has(name) || SKIP.has(name)) continue;
    if (!/\.(avif|webp|png|jpe?g|gif)$/i.test(name)) continue;
    courses.push(toCertItem(name, 'course'));
    known.add(name);
  }

  return { awards, courses: sortCourses(courses) };
}
