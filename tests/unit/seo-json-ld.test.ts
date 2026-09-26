import { describe, expect, it } from 'vitest';
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildPersonSchema,
  buildWebsiteSchema,
  buildServiceSchema,
} from '../../src/lib/json-ld';

describe('JSON-LD Schema Builder — BlogPosting', () => {
  const mockArticle = {
    title: 'Panduan Audit Smart Contract Web3',
    summary: 'Langkah taktis melakukan audit smart contract defensif untuk protokol DeFi.',
    slug: 'panduan-audit-smart-contract',
    category: 'WEB3' as const,
    coverImagePublicId: 'cover_123',
    publishedAt: new Date('2026-03-01T10:00:00.000Z'),
    updatedAt: new Date('2026-03-02T12:00:00.000Z'),
    tags: ['web3', 'audit', 'solidity'],
    readingTimeMinutes: 7,
    wordCount: 1450,
  };

  const siteUrl = 'https://wahyuandikaputra.my.id/';

  it('menghasilkan schema BlogPosting dengan atribut wajib dan tipe data valid', () => {
    const schema = buildArticleSchema(mockArticle, siteUrl);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BlogPosting');
    expect(schema.headline).toBe('Panduan Audit Smart Contract Web3');
    expect(schema.description).toBe(mockArticle.summary);
    expect(schema.url).toBe('https://wahyuandikaputra.my.id/artikel/panduan-audit-smart-contract/');
    expect(schema.datePublished).toBe('2026-03-01T10:00:00.000Z');
    expect(schema.dateModified).toBe('2026-03-02T12:00:00.000Z');
    expect(schema.inLanguage).toBe('id');
    expect(schema.wordCount).toBe(1450);
    expect(schema.timeRequired).toBe('PT7M');
    expect(schema.keywords).toBe('web3, audit, solidity');

    // Author & Publisher
    expect(schema.author).toMatchObject({
      '@type': 'Person',
      name: 'Wahyu Andika Putra',
      url: siteUrl,
    });
    expect(schema.publisher).toMatchObject({
      '@type': 'Person',
      name: 'Wahyu Andika Putra',
      url: siteUrl,
    });
    expect(schema.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': 'https://wahyuandikaputra.my.id/artikel/panduan-audit-smart-contract/',
    });
  });

  it('mendukung aggregateRating jika terdapat ulasan pembaca', () => {
    const schema = buildArticleSchema(mockArticle, siteUrl, {
      ratingValue: 4.8,
      reviewCount: 12,
    });

    expect(schema.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      reviewCount: 12,
      bestRating: 5,
      worstRating: 1,
    });
  });

  it('menggunakan ogImageOverride jika disediakan', () => {
    const schema = buildArticleSchema(
      {
        ...mockArticle,
        ogImageOverride: 'https://cdn.example.com/custom-og.jpg',
      },
      siteUrl,
    );

    expect(schema.image).toBe('https://cdn.example.com/custom-og.jpg');
  });
});

describe('JSON-LD Schema Builder — BreadcrumbList', () => {
  it('menghasilkan BreadcrumbList terpisah dengan hierarki yang tepat', () => {
    const siteUrl = 'https://wahyuandikaputra.my.id/';
    const breadcrumb = buildBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: 'Artikel', url: 'artikel/' },
        { name: 'Detail Artikel', url: 'artikel/detail/' },
      ],
      siteUrl,
    );

    expect(breadcrumb['@context']).toBe('https://schema.org');
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
    expect(breadcrumb.itemListElement).toHaveLength(3);
    expect(breadcrumb.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://wahyuandikaputra.my.id/',
    });
    expect(breadcrumb.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Artikel',
      item: 'https://wahyuandikaputra.my.id/artikel/',
    });
    expect(breadcrumb.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Detail Artikel',
      item: 'https://wahyuandikaputra.my.id/artikel/detail/',
    });
  });
});

describe('JSON-LD Schema Builder — Person, WebSite & Service', () => {
  const siteUrl = 'https://wahyuandikaputra.my.id/';

  it('menghasilkan Person schema lengkap', () => {
    const person = buildPersonSchema(siteUrl);
    expect(person['@context']).toBe('https://schema.org');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Wahyu Andika Putra');
    expect(person.url).toBe(siteUrl);
  });

  it('menghasilkan WebSite schema dengan SearchAction', () => {
    const website = buildWebsiteSchema(siteUrl);
    expect(website['@context']).toBe('https://schema.org');
    expect(website['@type']).toBe('WebSite');
    expect(website.potentialAction).toBeDefined();
  });

  it('menghasilkan ProfessionalService schema dengan offer catalog', () => {
    const service = buildServiceSchema(siteUrl);
    expect(service['@context']).toBe('https://schema.org');
    expect(service['@type']).toBe('ProfessionalService');
    expect(service.hasOfferCatalog).toBeDefined();
  });
});
