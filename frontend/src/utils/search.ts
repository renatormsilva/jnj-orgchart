import { HierarchyNode } from '../types/person';

export interface SearchResult {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  photoPath: string | null;
  score: number;
  matchedFields: string[];
}

export const searchHierarchy = (
  node: HierarchyNode,
  searchTerm: string,
  results: SearchResult[] = []
): SearchResult[] => {
  if (!searchTerm.trim()) return [];

  const score = calculateMatchScore(searchTerm, node.name, node.jobTitle, node.department);

  if (score > 0) {
    const matchedFields: string[] = [];
    const searchWords = normalizeText(searchTerm).split(/\s+/);

    if (matchesWords(searchWords, node.name)) matchedFields.push('name');
    if (matchesWords(searchWords, node.jobTitle)) matchedFields.push('jobTitle');
    if (matchesWords(searchWords, node.department)) matchedFields.push('department');

    results.push({
      id: node.id,
      name: node.name,
      jobTitle: node.jobTitle,
      department: node.department,
      photoPath: node.photoPath,
      score,
      matchedFields,
    });
  }

  if (node.children) {
    node.children.forEach(child => searchHierarchy(child, searchTerm, results));
  }

  return results.sort((a, b) => b.score - a.score);
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const matchesWords = (searchWords: string[], target: string): boolean => {
  const targetNormalized = normalizeText(target);
  const targetWords = targetNormalized.split(/\s+/);

  return searchWords.every(searchWord =>
    targetWords.some(targetWord => targetWord.startsWith(searchWord))
  );
};

const calculateMatchScore = (
  searchTerm: string,
  name: string,
  jobTitle: string,
  department: string
): number => {
  const searchNormalized = normalizeText(searchTerm);
  const searchWords = searchNormalized.split(/\s+/);

  let score = 0;

  const nameNormalized = normalizeText(name);
  const nameWords = nameNormalized.split(/\s+/);

  if (nameNormalized === searchNormalized) {
    score += 100;
  } else if (nameNormalized.startsWith(searchNormalized)) {
    score += 80;
  } else if (matchesWords(searchWords, name)) {
    score += 60;

    const exactWordMatches = searchWords.filter(sw =>
      nameWords.some(nw => nw === sw)
    ).length;
    score += exactWordMatches * 10;
  }

  if (matchesWords(searchWords, jobTitle)) {
    score += 30;
  }

  if (matchesWords(searchWords, department)) {
    score += 20;
  }

  return score;
};

export const isNodeMatch = (
  searchTerm: string,
  name: string,
  jobTitle: string,
  department: string
): boolean => {
  if (!searchTerm.trim()) return false;
  return calculateMatchScore(searchTerm, name, jobTitle, department) > 0;
};
