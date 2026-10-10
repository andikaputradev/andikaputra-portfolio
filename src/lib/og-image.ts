import satori from 'satori';
import sharp from 'sharp';
import { fontData, experimental_getFontFileURL } from 'astro:assets';

async function loadFont(cssVariable: string, weight: string, requestUrl: URL): Promise<ArrayBuffer> {
  const entries = (fontData as Record<string, { weight: string; src: { url: string }[] }[]>)[cssVariable];
  const entry = entries?.find((f) => f.weight === weight);
  const src = entry?.src[0]?.url;
  if (!src) {
    throw new Error(`Font file not found for ${cssVariable} weight ${weight}`);
  }
  const url = experimental_getFontFileURL(src, requestUrl);
  const response = await fetch(url);
  return response.arrayBuffer();
}

export interface OgTemplateProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

/**
 * Membangun template OG image 1200x630 dengan:
 * - Eyebrow label (jenis konten / kategori)
 * - Judul besar dengan font Fraunces
 * - Subjudul / ringkasan konten
 * - Footer: accent bar + nama penulis (kiri) dan domain (kanan)
 *
 * Desain mengikuti "Phosphor Terminal Editorial" palette:
 * #0E0F13 background, #EDEAE3 primary text, #8C8A82 muted text, #C97D3F phosphor accent.
 */
function buildTemplate({ eyebrow, title, subtitle }: OgTemplateProps) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '1200px',
        height: '630px',
        padding: '72px 80px',
        backgroundColor: '#0E0F13',
      },
      children: [
        // Eyebrow — jenis konten atau kategori artikel
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: '20px',
              letterSpacing: '2.5px',
              color: '#8C8A82',
              fontFamily: 'Geist Mono',
            },
            children: eyebrow,
          },
        },

        // Blok tengah: judul + subjudul
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '62px',
                    fontFamily: 'Fraunces',
                    color: '#EDEAE3',
                    lineHeight: 1.12,
                    maxWidth: '960px',
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '24px',
                    fontFamily: 'Geist Sans',
                    color: '#8C8A82',
                    maxWidth: '840px',
                    lineHeight: 1.45,
                  },
                  children: subtitle,
                },
              },
            ],
          },
        },

        // Footer: accent bar + penulis (kiri) | domain (kanan)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '16px',
                  },
                  children: [
                    // Garis aksen phosphor — tanda visual identitas merek
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          width: '48px',
                          height: '3px',
                          backgroundColor: '#C97D3F',
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize: '18px',
                          fontFamily: 'Geist Mono',
                          color: '#5C5B56',
                          letterSpacing: '0.5px',
                        },
                        children: 'Wahyu Andika Putra',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '16px',
                    fontFamily: 'Geist Mono',
                    color: '#5C5B56',
                    letterSpacing: '0.75px',
                  },
                  children: 'wahyuandikaputra.my.id',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

export async function renderOgPng(props: OgTemplateProps, requestUrl: URL): Promise<Buffer> {
  const [fraunces, geistSans, geistMono] = await Promise.all([
    loadFont('--font-fraunces', '600', requestUrl),
    loadFont('--font-geist-sans', '400', requestUrl),
    loadFont('--font-geist-mono', '500', requestUrl),
  ]);

  const svg = await satori(buildTemplate(props), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Fraunces', data: fraunces, weight: 600, style: 'normal' },
      { name: 'Geist Sans', data: geistSans, weight: 400, style: 'normal' },
      { name: 'Geist Mono', data: geistMono, weight: 500, style: 'normal' },
    ],
  });

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9, effort: 10 }).toBuffer();
}
