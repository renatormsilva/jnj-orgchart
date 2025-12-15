export function getAvatarUrl(
  personId: string,
  name: string,
  style: 'avataaars' | 'bottts' | 'personas' | 'lorelei' | 'micah' | 'initials' = 'avataaars'
): string {
  const seed = personId || name.replace(/\s+/g, '-').toLowerCase();
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f0f0f0`;
}

export function getPersonPhotoUrl(photoPath: string | null, personId: string, name: string): string {
  if (photoPath) {
    return photoPath;
  }
  return getAvatarUrl(personId, name, 'personas');
}
