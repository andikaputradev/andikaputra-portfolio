import type { Project, Article } from '../db/schema';
import { IDENTITY } from '../data/identity';

// Helper untuk menggabungkan siteUrl dan path secara aman (mencegah double slash // atau missing slash)
function combineUrl(baseUrl: string, path: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

// Helper untuk memastikan format @id Person konsisten
function getPersonId(siteUrl?: string): string | undefined {
  if (!siteUrl) return undefined;
  const base = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  return `${base}#person`;
}

export function buildPersonSchema(siteUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': getPersonId(siteUrl),
    name: IDENTITY.fullName,
    alternateName: ['WAP', 'Wahyu Andika Putra'],
    jobTitle: IDENTITY.role,
    description:
      'Software engineer dan cybersecurity specialist berbasis di Indonesia, fokus pada pengembangan web/aplikasi production-grade serta audit keamanan dan protokol Web3.',
    url: siteUrl,
    image: siteUrl ? combineUrl(siteUrl, 'og/index.png') : undefined,
    email: IDENTITY.email,
    knowsAbout: [
      'Software Engineering',
      'Web Application Development',
      'Cybersecurity',
      'Security Hardening',
      'Penetration Testing Defensif',
      'Web3',
      'Blockchain',
      'Smart Contract Security',
      'DeFi Risk Analysis',
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: IDENTITY.role,
      occupationCategory: 'Software Engineer',
    },
    sameAs: [IDENTITY.social.github, IDENTITY.social.linkedin, IDENTITY.social.instagram],
  };
}

export function buildWebsiteSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${IDENTITY.fullName} | Portfolio`,
    url: siteUrl,
    description:
      'Software engineer and cybersecurity specialist working across Web2 product engineering and Web3 protocol security.',
    inLanguage: ['en', 'id'],
    author: {
      '@type': 'Person',
      name: IDENTITY.fullName,
      url: siteUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: combineUrl(siteUrl, 'artikel?q={search_term_string}'),
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildServiceSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${IDENTITY.fullName} | Jasa Pembuatan Website, Aplikasi & Keamanan Siber`,
    description:
      'Jasa pembuatan website dan aplikasi, jasa upload Play Store, security hardening, serta audit smart contract Web3 oleh software engineer dan profesional keamanan siber berbasis di Indonesia.',
    serviceType: [
      'Web Development',
      'Application Development',
      'Mobile App Upload Play Store',
      'Cybersecurity Consulting',
      'Web3 Development',
      'Smart Contract Audit',
    ],
    provider: {
      '@type': 'Person',
      '@id': getPersonId(siteUrl),
      name: IDENTITY.fullName,
    },
    areaServed: [
      { '@type': 'Country', name: 'Indonesia' },
      { '@type': 'Country', name: 'Singapore' },
      { '@type': 'Country', name: 'Malaysia' },
    ],
    url: combineUrl(siteUrl, 'jasa/'),
    knowsAbout: [
      'Jasa Pembuatan Website',
      'Jasa Pembuatan Aplikasi',
      'Jasa Upload Play Store',
      'Jasa Upload App Store',
      'Web3 Specialist',
      'Profesional Keamanan Siber',
      'Security Hardening',
      'Smart Contract Audit',
      'DeFi Risk Assessment',
      'Jasa Pembuatan Web Application',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Lingkup Layanan',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Pengembangan Web & Aplikasi',
            description:
              'Landing page, portfolio, dashboard internal, hingga aplikasi full-stack dengan Astro, React/Next.js, atau stack sesuai kebutuhan proyek.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Upload & Publish Aplikasi ke Play Store / App Store',
            description:
              'Jasa upload, publikasi, dan optimasi aplikasi ke Google Play Store dan Apple App Store, termasuk setup developer account, listing optimasi, dan review preparation.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Security Hardening & Audit Defensif',
            description:
              'Threat modeling, secure coding review, dan hardening infrastruktur oleh profesional keamanan siber untuk sistem milik sendiri, dalam batas legal.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Smart Contract & Protokol Web3',
            description:
              'Audit keamanan smart contract, desain tokenomics, dan review risiko protokol DeFi oleh Web3 specialist dari sudut pandang defensif.',
          },
        },
      ],
    },
  };
}

export function buildProjectSchema(
  project: Pick<Project, 'title' | 'summary' | 'stack' | 'slug' | 'schemaType'>,
  siteUrl: string,
) {
  const stack = project.stack ?? [];

  return {
    '@context': 'https://schema.org',
    '@type': project.schemaType,
    name: project.title,
    description: project.summary,
    url: combineUrl(siteUrl, `work/${project.slug}/`),
    ...(stack.length > 0 ? { keywords: stack.join(', ') } : {}),
    author: {
      '@type': 'Person',
      '@id': getPersonId(siteUrl),
      name: IDENTITY.fullName,
    },
  };
}

export function buildArticleSchema(
  article: Pick<Article, 'title' | 'summary' | 'slug' | 'category' | 'coverImagePublicId' | 'publishedAt' | 'updatedAt' | 'tags' | 'readingTimeMinutes'>,
  siteUrl: string,
  ratingData?: { ratingValue: number; reviewCount: number },
) {
  const url = combineUrl(siteUrl, `artikel/${article.slug}/`);
  const cloudName = import.meta.env?.CLOUDINARY_CLOUD_NAME;
  const imageUrl = article.coverImagePublicId && cloudName
    ? `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/${article.coverImagePublicId}.jpg`
    : combineUrl(siteUrl, 'og/index.png');

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    url,
    image: imageUrl,
    datePublished: new Date(article.publishedAt).toISOString(),
    dateModified: new Date(article.updatedAt).toISOString(),
    author: {
      '@type': 'Person',
      '@id': getPersonId(siteUrl),
      name: IDENTITY.fullName,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Person',
      '@id': getPersonId(siteUrl),
      name: IDENTITY.fullName,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(article.tags && article.tags.length > 0 ? { keywords: article.tags.join(', ') } : {}),
    ...(article.readingTimeMinutes ? { timeRequired: `PT${article.readingTimeMinutes}M` } : {}),
    ...(ratingData && ratingData.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: ratingData.ratingValue,
            reviewCount: ratingData.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}


export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  siteUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : combineUrl(siteUrl, item.url),
    })),
  };
}

export function buildFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}