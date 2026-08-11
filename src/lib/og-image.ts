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
        padding: '80px',
        backgroundColor: '#0E0F13',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: '22px',
              letterSpacing: '2px',
              color: '#8C8A82',
              fontFamily: 'Geist Mono',
            },
            children: eyebrow,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '64px',
                    fontFamily: 'Fraunces',
                    color: '#EDEAE3',
                    lineHeight: 1.15,
                    maxWidth: '980px',
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: '26px',
                    fontFamily: 'Geist Sans',
                    color: '#8C8A82',
                    maxWidth: '860px',
                    lineHeight: 1.4,
                  },
                  children: subtitle,
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
              width: '64px',
              height: '4px',
              backgroundColor: '#C97D3F',
            },
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

  return sharp(Buffer.from(svg)).png().toBuffer();
}
