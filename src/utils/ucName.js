// Shared resolver for the human-readable name of a Chenab UC feature.
//
// Some GeoJSON features carry only code-like identifiers (e.g. "661 Gb",
// "Unknown_12", or a bare number) in their name fields. Those are rejected here
// and replaced with a readable "TEHSIL, DISTRICT" fallback. This only affects
// the displayed name — risk values, colors and geometry are untouched.
//
// Field preference order: New_Name → UC_NAME → UC → uc_name → name, then the
// "TEHSIL, DISTRICT" fallback (then TEHSIL, then DISTRICT, then "Unnamed Area").

// Patterns for non-human-readable, code-like UC values that should never be
// shown to users. Risk values for these features are still correct — only the
// display name is rejected so we fall back to the admin-area name instead.
const PLACEHOLDER_NAME = /^Unknown[_\s-]?\d+$/i;          // "Unknown_12"
const PURE_NUMBER = /^\d+$/;                               // "661"
// Canal-grid codes: a number, an optional "/" or "-", then a 1–3 letter branch
// code. Catches "661 Gb", "278 Jb", "284/gb", "284/ Jb", "57-db", etc.
// (Real names like "18-hazari" or "Chak No. 760" keep >3 trailing letters or
// start with a letter, so they are NOT matched.)
const CANAL_CODE = /^\d+\s*[/-]?\s*[a-z]{1,3}$/i;

export const isMeaningfulUcName = (name) => {
  if (name == null) return false;

  const value = String(name).trim();
  if (value.length === 0) return false;
  if (PLACEHOLDER_NAME.test(value)) return false;
  if (PURE_NUMBER.test(value)) return false;
  if (CANAL_CODE.test(value)) return false;

  return true;
};

export const resolveUcName = (props = {}) => {
  const candidates = [
    props.New_Name,
    props.UC_NAME,
    props.UC,
    props.uc_name,
    props.name,
  ];

  const validName = candidates.find(isMeaningfulUcName);
  if (validName) return String(validName).trim();

  const tehsil = props.TEHSIL || props.tehsil;
  const district = props.DISTRICT || props.district;

  if (tehsil && district) return `${tehsil}, ${district}`;
  if (tehsil) return tehsil;
  if (district) return district;

  return 'Unnamed Area';
};
