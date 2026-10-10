import type { Project, Article } from '../db/schema';
import { IDENTITY } from '../data/identity';

// Menggabungkan siteUrl dan path secara aman (mencegah double slash atau missing slash)
function combineUrl(baseUrl: string, path: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

// Memastikan format @id Person konsisten di seluruh schema
function getPersonId(siteUrl?: string): string | undefined {
  if (!siteUrl) return undefined;
  const base = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  return `${base}#person`;
}



function buildAddressNode() {
  return {
    '@type': 'PostalAddress',
    streetAddress: IDENTITY.location.streetAddress,
    addressLocality: IDENTITY.location.addressLocality,
    addressRegion: IDENTITY.location.addressRegion,
    postalCode: IDENTITY.location.postalCode,
    addressCountry: IDENTITY.location.addressCountry,
  };
}

function buildGeoNode() {
  return {
    '@type': 'GeoCoordinates',
    latitude: IDENTITY.location.geo.latitude,
    longitude: IDENTITY.location.geo.longitude,
  };
}

export function buildPersonSchema(siteUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': getPersonId(siteUrl),
    name: IDENTITY.fullName,
    alternateName: [IDENTITY.brandName, 'WAP'],
    jobTitle: IDENTITY.role,
    description:
      'Software engineer dan cybersecurity specialist berbasis di Wonosobo, Jawa Tengah. Fokus pada jasa pembuatan website dan aplikasi production-grade, audit keamanan siber, dan protokol Web3.',
    url: siteUrl,
    image: siteUrl ? combineUrl(siteUrl, 'og/index.png') : undefined,
    email: IDENTITY.email,
    telephone: IDENTITY.telephone,
    homeLocation: {
      '@type': 'Place',
      name: 'Wonosobo, Jawa Tengah, Indonesia',
      geo: buildGeoNode(),
    },
    address: buildAddressNode(),
    knowsAbout: [
      'Jasa Pembuatan Website',
      'Jasa Pembuatan Aplikasi Android',
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
    sameAs: [
      IDENTITY.social.github,
      IDENTITY.social.linkedin,
      IDENTITY.social.instagram,
      IDENTITY.social.facebook,
      IDENTITY.social.tiktok,
      IDENTITY.social.twitter,
    ],
  };
}

export function buildProfilePageSchema(siteUrl?: string) {
  const person = buildPersonSchema(siteUrl);
  const cleanPerson = { ...person };
  delete (cleanPerson as Record<string, unknown>)['@context'];

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: cleanPerson,
  };
}

export function buildWebsiteSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${IDENTITY.fullName} | Portfolio`,
    url: siteUrl,
    description:
      'Software engineer dan cybersecurity specialist untuk pengembangan web/aplikasi production-grade dan keamanan protokol Web3.',
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
    name: `${IDENTITY.fullName} | Jasa Pembuatan Website dan Aplikasi`,
    alternateName: IDENTITY.brandName,
    description:
      'Jasa pembuatan website dan aplikasi profesional, jasa upload Play Store, security hardening, serta audit smart contract Web3 oleh software engineer berbasis di Wonosobo, Jawa Tengah.',
    url: combineUrl(siteUrl, 'jasa/'),
    telephone: IDENTITY.telephone,
    email: IDENTITY.email,
    address: buildAddressNode(),
    geo: buildGeoNode(),
    hasMap: `https://www.google.com/maps?q=${IDENTITY.location.geo.latitude},${IDENTITY.location.geo.longitude}`,
    priceRange: 'Hubungi untuk penawaran',
    currenciesAccepted: 'IDR',
    paymentAccepted: 'Transfer Bank, QRIS',
    openingHours: 'Mo-Fr 09:00-17:00',
    serviceType: [
      'Jasa Pembuatan Website',
      'Jasa Pembuatan Aplikasi Android',
      'Web Application Development',
      'Mobile App Development',
      'Play Store Upload',
      'App Store Upload',
      'Cybersecurity Consulting',
      'Security Hardening',
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
      {
        '@type': 'AdministrativeArea',
        name: 'Wonosobo',
        containedInPlace: { '@type': 'AdministrativeArea', name: 'Jawa Tengah' },
      },
      { '@type': 'Country', name: 'Singapore' },
      { '@type': 'Country', name: 'Malaysia' },
    ],
    knowsAbout: [
      'Jasa Pembuatan Website Profesional',
      'Jasa Pembuatan Aplikasi Android',
      'Software Engineer Wonosobo',
      'Pengembangan Sistem Web Next.js',
      'Jasa Upload Play Store',
      'Smart Contract Audit',
      'Security Hardening',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Lingkup Layanan',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Jasa Pembuatan Website & Aplikasi Full-Stack',
            description:
              'Landing page, company profile, dashboard internal, hingga aplikasi full-stack dengan Astro, React/Next.js, atau stack sesuai kebutuhan proyek.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Jasa Pembuatan Aplikasi Android & Upload Play Store',
            description:
              'Pengembangan dan publikasi aplikasi Android ke Google Play Store dan Apple App Store, termasuk setup developer account, listing optimasi (ASO), dan review preparation.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Security Hardening & Audit Defensif',
            description:
              'Threat modeling, secure coding review, dan hardening infrastruktur untuk sistem milik sendiri, dalam batas legal dan izin tertulis.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Smart Contract & Protokol Web3',
            description:
              'Audit keamanan smart contract, desain tokenomics, dan review risiko protokol DeFi dari sudut pandang defensif.',
          },
        },
      ],
    },
  };
}

/**
 * Menghasilkan JSON-LD @graph tunggal yang menggabungkan Person dan ProfessionalService.
 * Digunakan di halaman /jasa untuk membangun sinyal entitas Knowledge Panel
 * tanpa menduplikasi @context di setiap schema terpisah.
 */
export function buildEntityGraph(siteUrl: string) {
  const base = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  const personId = `${base}#person`;
  const serviceId = `${base}#service`;

  const person = {
    '@type': 'Person',
    '@id': personId,
    name: IDENTITY.fullName,
    alternateName: [IDENTITY.brandName, 'WAP'],
    jobTitle: IDENTITY.role,
    description:
      'Software engineer dan cybersecurity specialist berbasis di Wonosobo, Jawa Tengah. Fokus pada jasa pembuatan website dan aplikasi profesional, security hardening, dan protokol Web3.',
    url: siteUrl,
    image: combineUrl(siteUrl, 'og/index.png'),
    email: IDENTITY.email,
    telephone: IDENTITY.telephone,
    homeLocation: {
      '@type': 'Place',
      name: 'Wonosobo, Jawa Tengah, Indonesia',
      geo: buildGeoNode(),
    },
    address: buildAddressNode(),
    knowsAbout: [
      'Jasa Pembuatan Website',
      'Jasa Pembuatan Aplikasi Android',
      'Software Engineering',
      'Web Application Development',
      'Cybersecurity',
      'Security Hardening',
      'Web3',
      'Smart Contract Security',
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: IDENTITY.role,
      occupationCategory: 'Software Engineer',
    },
    sameAs: [
      IDENTITY.social.github,
      IDENTITY.social.linkedin,
      IDENTITY.social.instagram,
      IDENTITY.social.facebook,
      IDENTITY.social.tiktok,
      IDENTITY.social.twitter,
    ],
  };

  const service = {
    '@type': 'ProfessionalService',
    '@id': serviceId,
    name: `${IDENTITY.fullName} | Jasa Pembuatan Website dan Aplikasi`,
    alternateName: IDENTITY.brandName,
    description:
      'Jasa pembuatan website dan aplikasi profesional, jasa upload Play Store, security hardening, serta audit smart contract Web3 oleh software engineer Wonosobo, Jawa Tengah.',
    url: combineUrl(siteUrl, 'jasa/'),
    telephone: IDENTITY.telephone,
    email: IDENTITY.email,
    address: buildAddressNode(),
    geo: buildGeoNode(),
    hasMap: `https://www.google.com/maps?q=${IDENTITY.location.geo.latitude},${IDENTITY.location.geo.longitude}`,
    priceRange: 'Hubungi untuk penawaran',
    currenciesAccepted: 'IDR',
    paymentAccepted: 'Transfer Bank, QRIS',
    openingHours: 'Mo-Fr 09:00-17:00',
    serviceType: [
      'Jasa Pembuatan Website',
      'Jasa Pembuatan Aplikasi Android',
      'Web Application Development',
      'Mobile App Development',
      'Play Store Upload',
      'Cybersecurity Consulting',
      'Security Hardening',
      'Web3 Development',
      'Smart Contract Audit',
    ],
    provider: { '@id': personId },
    founder: { '@id': personId },
    areaServed: [
      { '@type': 'Country', name: 'Indonesia' },
      {
        '@type': 'AdministrativeArea',
        name: 'Wonosobo',
        containedInPlace: { '@type': 'AdministrativeArea', name: 'Jawa Tengah' },
      },
      { '@type': 'Country', name: 'Singapore' },
      { '@type': 'Country', name: 'Malaysia' },
    ],
    sameAs: [IDENTITY.social.github, IDENTITY.social.linkedin],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Layanan Pengembangan Digital',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Jasa Pembuatan Website & Aplikasi Full-Stack',
            description:
              'Landing page, company profile, dashboard, hingga aplikasi full-stack dengan Astro, Next.js, atau stack sesuai kebutuhan proyek.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Jasa Pembuatan Aplikasi Android & Upload Play Store',
            description:
              'Pengembangan dan publikasi aplikasi Android ke Google Play Store dan Apple App Store, termasuk ASO dan review preparation.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Security Hardening & Audit Defensif',
            description:
              'Threat modeling, secure coding review, dan hardening infrastruktur untuk sistem milik sendiri, dalam batas legal.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Smart Contract & Protokol Web3',
            description:
              'Audit keamanan smart contract, desain tokenomics, dan review risiko protokol DeFi dari sudut pandang defensif.',
          },
        },
      ],
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [person, service],
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
  article: Pick<
    Article,
    | 'title'
    | 'summary'
    | 'slug'
    | 'category'
    | 'coverImagePublicId'
    | 'publishedAt'
    | 'updatedAt'
    | 'tags'
    | 'readingTimeMinutes'
  > & {
    wordCount?: number;
    ogImageOverride?: string | null;
  },
  siteUrl: string,
  ratingData?: { ratingValue: number; reviewCount: number },
) {
  const url = combineUrl(siteUrl, `artikel/${article.slug}/`);
  const cloudName = import.meta.env?.CLOUDINARY_CLOUD_NAME;
  const defaultImage = combineUrl(siteUrl, 'og/index.png');

  let imageUrl = defaultImage;
  if (article.ogImageOverride) {
    imageUrl = article.ogImageOverride.startsWith('http')
      ? article.ogImageOverride
      : combineUrl(siteUrl, article.ogImageOverride);
  } else if (article.coverImagePublicId && cloudName) {
    imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1200,h_630,c_fill/${article.coverImagePublicId}.jpg`;
  }

  return {
    '@context': 'https://schema.org',
    '@type': ['TechArticle', 'BlogPosting'],
    headline: article.title,
    description: article.summary,
    url,
    image: imageUrl,
    datePublished: new Date(article.publishedAt).toISOString(),
    dateModified: new Date(article.updatedAt).toISOString(),
    inLanguage: 'id',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
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
      url: siteUrl,
      image: combineUrl(siteUrl, 'og/index.png'),
    },
    ...(article.wordCount ? { wordCount: article.wordCount } : {}),
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