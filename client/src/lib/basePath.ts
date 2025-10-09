// Get the base path for the app
// In production (GitHub Pages): /MentalBiriyani
// In development: (empty string)
export function getBasePath(): string {
  return import.meta.env.PROD ? '/MentalBiriyani' : '';
}

// Get full URL with base path
export function getFullPath(path: string): string {
  const base = getBasePath();
  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${cleanPath}`;
}
