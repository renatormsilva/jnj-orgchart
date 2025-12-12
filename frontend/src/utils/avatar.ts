/**
 * Gera URL de avatar usando DiceBear API
 * @param personId - ID único da pessoa
 * @param name - Nome da pessoa (fallback se não houver ID)
 * @param style - Estilo do avatar (padrão: 'avataaars')
 * @returns URL do avatar SVG
 */
export function getAvatarUrl(
  personId: string,
  name: string,
  style: 'avataaars' | 'bottts' | 'personas' | 'lorelei' | 'micah' | 'initials' = 'avataaars'
): string {
  // Usa o ID da pessoa como seed para garantir consistência
  const seed = personId || name.replace(/\s+/g, '-').toLowerCase();

  // DiceBear API v7
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f0f0f0`;
}

/**
 * Retorna a URL da foto se existir, senão gera avatar
 */
export function getPersonPhotoUrl(photoPath: string | null, personId: string, name: string): string {
  if (photoPath) {
    return photoPath;
  }

  return getAvatarUrl(personId, name, 'personas');
}
