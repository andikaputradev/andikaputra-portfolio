import type { Project } from '../db/schema';
import { IDENTITY } from '../data/identity';

export function buildPersonSchema(siteUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': siteUrl ? `${siteUrl}#person` : undefined,
    name: IDENTITY.fullName,
    jobTitle: IDENTITY.role,
    description:
      'Software engineer dan cybersecurity specialist berbasis di Indonesia, fokus pada pengembangan web/aplikasi production-grade serta audit keamanan dan protokol Web3.',
    url: siteUrl,
    image: siteUrl ? `${siteUrl}og/index.png` : undefined,
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
    sameAs: [IDENTITY.social.github, IDENTITY.social.linkedin, IDENTITY.social.instagram],
  };
}

export function buildWebsiteSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${IDENTITY.fullName} — Portfolio`,
    url: siteUrl,
    author: {
      '@type': 'Person',
      name: IDENTITY.fullName,
    },
  };
}

export function buildServiceSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${IDENTITY.fullName} — Jasa Pembuatan Website, Aplikasi & Keamanan Siber`,
    description:
      'Jasa pembuatan website dan aplikasi, security hardening, serta audit smart contract Web3 oleh software engineer dan profesional keamanan siber berbasis di Indonesia.',
    serviceType: [
      'Web Development',
      'Application Development',
      'Cybersecurity Consulting',
      'Web3 Development',
      'Smart Contract Audit',
    ],
    provider: {
      '@type': 'Person',
      '@id': `${siteUrl}#person`,
      name: IDENTITY.fullName,
    },
    areaServed: 'ID',
    url: `${siteUrl}jasa/`,
    knowsAbout: [
      'Jasa Pembuatan Website',
      'Jasa Pembuatan Aplikasi',
      'Web3 Specialist',
      'Profesional Keamanan Siber',
      'Security Hardening',
      'Smart Contract Audit',
      'DeFi Risk Assessment',
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
    url: `${siteUrl}work/${project.slug}/`,
    ...(stack.length > 0 ? { keywords: stack.join(', ') } : {}),
    author: {
      '@type': 'Person',
      name: IDENTITY.fullName,
    },
  };
}
