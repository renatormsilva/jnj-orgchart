import { getAvatarUrl, getPersonPhotoUrl } from './avatar';

describe('avatar utils', () => {
  describe('getAvatarUrl', () => {
    it('should generate URL with person ID as seed', () => {
      const url = getAvatarUrl('123', 'John Doe');

      expect(url).toContain('https://api.dicebear.com/7.x/avataaars/svg');
      expect(url).toContain('seed=123');
    });

    it('should use name as seed when personId is empty', () => {
      const url = getAvatarUrl('', 'John Doe');

      expect(url).toContain('seed=john-doe');
    });

    it('should use default avataaars style', () => {
      const url = getAvatarUrl('123', 'John');

      expect(url).toContain('7.x/avataaars/svg');
    });

    it('should support different avatar styles', () => {
      const bottts = getAvatarUrl('123', 'John', 'bottts');
      const personas = getAvatarUrl('123', 'John', 'personas');
      const lorelei = getAvatarUrl('123', 'John', 'lorelei');
      const micah = getAvatarUrl('123', 'John', 'micah');
      const initials = getAvatarUrl('123', 'John', 'initials');

      expect(bottts).toContain('7.x/bottts/svg');
      expect(personas).toContain('7.x/personas/svg');
      expect(lorelei).toContain('7.x/lorelei/svg');
      expect(micah).toContain('7.x/micah/svg');
      expect(initials).toContain('7.x/initials/svg');
    });

    it('should include background color', () => {
      const url = getAvatarUrl('123', 'John');

      expect(url).toContain('backgroundColor=f0f0f0');
    });

    it('should encode special characters in seed', () => {
      const url = getAvatarUrl('', 'John & Jane');

      expect(url).toContain(encodeURIComponent('john-&-jane'));
    });

    it('should handle names with multiple spaces', () => {
      const url = getAvatarUrl('', 'John  Middle  Doe');

      expect(url).toContain('seed=john-middle-doe');
    });
  });

  describe('getPersonPhotoUrl', () => {
    it('should return photoPath when it exists', () => {
      const result = getPersonPhotoUrl('/photos/123.jpg', '123', 'John Doe');

      expect(result).toBe('/photos/123.jpg');
    });

    it('should return avatar URL when photoPath is null', () => {
      const result = getPersonPhotoUrl(null, '123', 'John Doe');

      expect(result).toContain('https://api.dicebear.com/7.x/personas/svg');
      expect(result).toContain('seed=123');
    });

    it('should return avatar URL when photoPath is empty string', () => {
      const result = getPersonPhotoUrl('', '123', 'John Doe');

      expect(result).toContain('https://api.dicebear.com/7.x/personas/svg');
    });

    it('should use personas style for generated avatars', () => {
      const result = getPersonPhotoUrl(null, '456', 'Jane Smith');

      expect(result).toContain('personas');
    });
  });
});
