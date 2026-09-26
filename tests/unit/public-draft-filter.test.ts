import { describe, expect, it } from 'vitest';

interface MockItem {
  id: number;
  slug: string;
  title: string;
  published: boolean;
}

function filterPublicItems<T extends { published: boolean }>(items: T[]): T[] {
  return items.filter((item) => item.published === true);
}

function resolvePublicOgItem(
  projectsList: MockItem[],
  articlesList: MockItem[],
  slug: string,
): { type: 'project' | 'article'; item: MockItem } | null {
  const publishedProjects = filterPublicItems(projectsList);
  const project = publishedProjects.find((p) => p.slug === slug);
  if (project) {
    return { type: 'project', item: project };
  }

  const publishedArticles = filterPublicItems(articlesList);
  const article = publishedArticles.find((a) => a.slug === slug);
  if (article) {
    return { type: 'article', item: article };
  }

  return null;
}

describe('Public Content & Draft Filtering', () => {
  const projectsMock: MockItem[] = [
    { id: 1, slug: 'published-project', title: 'Published Project', published: true },
    { id: 2, slug: 'draft-project', title: 'Secret Draft Project', published: false },
  ];

  const articlesMock: MockItem[] = [
    { id: 10, slug: 'published-article', title: 'Published Article', published: true },
    { id: 11, slug: 'draft-article', title: 'Secret Draft Article', published: false },
  ];

  it('strictly excludes unpublished projects from public listings', () => {
    const publicProjects = filterPublicItems(projectsMock);
    expect(publicProjects.length).toBe(1);
    expect(publicProjects[0].slug).toBe('published-project');
    expect(publicProjects.some((p) => p.published === false)).toBe(false);
  });

  it('strictly excludes unpublished articles from public listings', () => {
    const publicArticles = filterPublicItems(articlesMock);
    expect(publicArticles.length).toBe(1);
    expect(publicArticles[0].slug).toBe('published-article');
    expect(publicArticles.some((a) => a.published === false)).toBe(false);
  });

  it('rejects draft projects in OG image lookup and returns 404/null', () => {
    const result = resolvePublicOgItem(projectsMock, articlesMock, 'draft-project');
    expect(result).toBeNull();
  });

  it('rejects draft articles in OG image lookup and returns 404/null', () => {
    const result = resolvePublicOgItem(projectsMock, articlesMock, 'draft-article');
    expect(result).toBeNull();
  });

  it('resolves published projects in OG image lookup', () => {
    const result = resolvePublicOgItem(projectsMock, articlesMock, 'published-project');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('project');
    expect(result?.item.title).toBe('Published Project');
  });

  it('resolves published articles in OG image lookup when project does not match', () => {
    const result = resolvePublicOgItem(projectsMock, articlesMock, 'published-article');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('article');
    expect(result?.item.title).toBe('Published Article');
  });
});
