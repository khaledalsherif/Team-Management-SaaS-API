export const fieldsTrimmed = (obj) => {
  const trimmed = {};
  for (const [field, val] of Object.entries(obj)) {
    if (val !== undefined && val !== null)
      trimmed[field] = typeof val === 'string' ? val.trim() : val;
  }
  return trimmed;
};
