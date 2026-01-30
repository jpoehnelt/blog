import { getPostMetadata, getPostsMetadata } from '$lib/content/posts.server';
import { error, json } from '@sveltejs/kit';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { AUTHOR_NAME } from '$lib/constants';
import type { RequestHandler, EntryGenerator } from './$types';

export const prerender = true;

// Generate entries for all posts so the OG images get prerendered
export const entries: EntryGenerator = () => {
  const posts = getPostsMetadata();
  return posts.map((post) => ({ id: post.id }));
};

// Cache fonts at module level
let interFont: ArrayBuffer | null = null;

async function loadFonts() {
  if (!interFont) {
    const fontResponse = await fetch(
      "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf"
    );
    if (!fontResponse.ok) {
      throw new Error(`Failed to load font: ${fontResponse.status}`);
    }
    interFont = await fontResponse.arrayBuffer();
  }
  return { interFont };
}

// Category badge colors
function getTagColor(tag: string): { bg: string; border: string; text: string } {
  const tagLower = tag.toLowerCase();
  if (tagLower === 'tutorial' || tagLower === 'guide') {
    return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.4)', text: '#22c55e' };
  }
  if (tagLower === 'tip') {
    return { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.4)', text: '#3b82f6' };
  }
  if (tagLower === 'essay' || tagLower === 'opinion') {
    return { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.4)', text: '#a855f7' };
  }
  if (tagLower === 'showcase') {
    return { bg: 'rgba(249, 115, 22, 0.2)', border: 'rgba(249, 115, 22, 0.4)', text: '#f97316' };
  }
  if (tagLower === 'workshop') {
    return { bg: 'rgba(236, 72, 153, 0.2)', border: 'rgba(236, 72, 153, 0.4)', text: '#ec4899' };
  }
  return { bg: 'rgba(100, 116, 139, 0.2)', border: 'rgba(100, 116, 139, 0.4)', text: '#94a3b8' };
}

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  // Get post metadata
  const post = getPostMetadata(id);
  if (!post) {
    throw error(404, 'Post not found');
  }

  // Load fonts
  const { interFont } = await loadFonts();

  // Find category tag
  const categoryTags = ['Tutorial', 'Guide', 'Tip', 'Essay', 'Opinion', 'Showcase', 'Workshop'];
  const categoryTag = post.tags?.find((t: string) => categoryTags.includes(t)) || post.tags?.[0] || '';
  const tagColor = categoryTag ? getTagColor(categoryTag) : null;

  // Format date
  const formattedDate = post.pubDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Truncate title and description for display
  const title = post.title || 'Untitled';
  const description = post.description ? 
    (post.description.length > 180 ? post.description.substring(0, 177) + '...' : post.description) : '';

  // Dynamic font sizing based on content length
  // Title: 70px baseline, scales down for longer titles
  const getTitleSize = (len: number) => {
    if (len <= 40) return '70px';
    if (len <= 60) return '59px';
    if (len <= 80) return '52px';
    return '48px';
  };
  
  // Description: 29px baseline, scales down for longer descriptions
  const getDescriptionSize = (len: number) => {
    if (len <= 100) return '29px';
    if (len <= 150) return '26px';
    return '24px';
  };

  const titleFontSize = getTitleSize(title.length);
  const descriptionFontSize = getDescriptionSize(description.length);

  // Create the OG image using satori - simplified version
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          padding: '56px',
        },
        children: [
          // Top badges row
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
              },
              children: [
                // Date badge
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      padding: '8px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '20px',
                      fontSize: '15px',
                      color: '#64748b',
                      fontWeight: 500,
                    },
                    children: formattedDate,
                  },
                },
              ],
            },
          },
          // Title
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: titleFontSize,
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2,
                marginBottom: '24px',
              },
              children: title,
            },
          },
          // Description
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: descriptionFontSize,
                color: '#94a3b8',
                lineHeight: 1.5,
              },
              children: description,
            },
          },
          // Tags row
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '20px',
              },
              children: (post.tags || []).slice(0, 6).map((tag: string) => ({
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    fontSize: '18px',
                    color: '#94a3b8',
                    fontWeight: 500,
                  },
                  children: `#${tag}`,
                },
              })),
            },
          },
          // Spacer
          { type: 'div', props: { style: { display: 'flex', flex: 1 } } },
          // Author row
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', fontSize: '20px', color: '#ffffff', fontWeight: 600 },
                          children: AUTHOR_NAME,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', fontSize: '15px', color: '#94a3b8', fontWeight: 400, marginTop: '2px' },
                          children: 'Software engineer, ultrarunner, and writer',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interFont!,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  );

  // Convert SVG to PNG
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
