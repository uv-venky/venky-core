import { getPngDimensions, readImageFromFSAsBase64 } from '../../../lib/core/server/export-utils';
import { join } from 'node:path';
import PptxGenJS from 'pptxgenjs';
import { isAbortedRequestError } from '../../../lib/core/common/error';
export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    if (isAbortedRequestError(error)) {
      // Return empty response for aborted requests - no logging needed
      return new Response(null, { status: 499 }); // 499 Client Closed Request
    }
    console.error('Failed to parse request body:', error);
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { fileName = 'dashboard-report.pptx', coverTitle, dashboardImage, summary, sections } = payload;
  if (!coverTitle || !sections || !Array.isArray(sections)) {
    console.error('Missing required fields in request payload');
    return Response.json(
      {
        error: 'Missing required fields: coverTitle and sections are required',
      },
      { status: 400 },
    );
  }
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'A4', width: 11.69, height: 8.27 });
  pptx.layout = 'A4';
  const slideWidth = 11.69;
  const slideHeight = 8.27;
  const marginX = 0.3;
  const marginY = 0.5;
  const maxWidth = slideWidth - marginX * 2;
  const cover = pptx.addSlide();
  cover.background = { fill: 'ffffff' };
  try {
    const logoBase64 = await readImageFromFSAsBase64(join(process.cwd(), 'public/images/logo.png'));
    cover.addImage({ data: logoBase64, x: 0.7, y: 0.7, w: 1.8, h: 1.8 });
  } catch (err) {
    console.warn('Logo load failed', err);
  }
  cover.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 2.6,
    w: slideWidth,
    h: slideHeight - 2.6,
    fill: { color: '000000' },
    line: { color: '000000', width: 0 },
  });
  cover.addText(coverTitle, { x: 0.7, y: 3, fontSize: 36, color: 'ffffff' });
  cover.addText(`Generated On ${new Date().toLocaleDateString()}`, {
    x: 0.9,
    y: 3.5,
    fontSize: 14,
    fontFace: 'Monospace',
    color: 'ffffff',
  });
  if (summary) {
    let y = 4.2;
    cover.addText('Dashboard Filters', {
      x: 0.7,
      y,
      fontSize: 24,
      fontFace: 'Monospace',
      color: 'ffffff',
    });
    y += 0.5;
    for (const [key, value] of Object.entries(summary)) {
      const text = `${key.replace(/([A-Z])/g, ' $1').replace(/\b\w/g, (c) => c.toUpperCase())}: ${String(value)}`;
      cover.addText(`• ${text}`, {
        x: 0.9,
        y,
        fontSize: 14,
        fontFace: 'Monospace',
        color: 'ffffff',
      });
      y += 0.35;
    }
  }
  function addImageSlide(image, title) {
    const slide = pptx.addSlide();
    slide.background = { fill: 'F2F2F2' };
    let y = marginY;
    if (title) {
      slide.addText(title, {
        x: marginX,
        y,
        fontSize: 32,
        fontFace: 'Monospace',
        color: '000000',
      });
      y += 0.6;
    }
    const maxH = slideHeight - y - marginY;
    const { width, height } = getPngDimensions(image);
    const widthRatio = maxWidth / width;
    const heightRatio = maxH / height;
    const scale = Math.min(widthRatio, heightRatio, 1);
    const w = width * scale;
    const h = height * scale;
    slide.addImage({ data: image, x: marginX, y, w, h });
  }
  if (dashboardImage) {
    addImageSlide(dashboardImage, coverTitle);
  }
  for (const sec of sections) {
    addImageSlide(sec.image, sec.title);
  }
  const buf = await pptx.write({ outputType: 'uint8array' });
  return new Response(Buffer.from(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
//# sourceMappingURL=route.js.map
