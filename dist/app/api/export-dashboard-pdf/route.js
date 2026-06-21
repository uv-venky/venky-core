import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { join } from 'node:path';
import logger from '../../../lib/core/server/logger';
import { withSessionRoute } from '../../../lib/core/server/withDBRoutes';
import { dataURLToUint8Array, readImageFromFS } from '../../../lib/core/server/export-utils';
import { isAbortedRequestError } from '../../../lib/core/common/error';
const pageWidth = 841.89;
const pageHeight = 595.28;
async function addImagePage(pdfDoc, font, image, title) {
  const bytes = dataURLToUint8Array(image);
  const img = await pdfDoc.embedPng(bytes);
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  const marginX = 32;
  const marginY = 48;
  let y = pageHeight - marginY;
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(0.95, 0.95, 0.95),
  });
  if (title) {
    page.drawText(title, {
      x: marginX,
      y,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 40;
  }
  const maxW = pageWidth - marginX * 2;
  const maxH = y - marginY;
  let w = img.width;
  let h = img.height;
  const widthRatio = maxW / w;
  const heightRatio = maxH / h;
  const scale = Math.min(widthRatio, heightRatio, 1);
  w *= scale;
  h *= scale;
  const x = marginX + (maxW - w) / 2;
  const yImg = y - h;
  page.drawImage(img, { x, y: yImg, width: w, height: h });
}
export const POST = withSessionRoute(async (_session, req) => {
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    if (isAbortedRequestError(error)) {
      // Return empty response for aborted requests - no logging needed
      return new Response(null, { status: 499 }); // 499 Client Closed Request
    }
    logger.error('Failed to parse request body:', error);
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
  const {
    fileName = `dashboard-report-${new Date().toISOString().slice(0, 10)}.pdf`,
    coverTitle,
    dashboardImage,
    summary,
    sections,
  } = payload;
  if (!coverTitle || !sections || !Array.isArray(sections)) {
    logger.error('Missing required fields in request payload');
    return new Response(
      JSON.stringify({
        error: 'Missing required fields: coverTitle and sections are required',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const cover = pdfDoc.addPage([pageWidth, pageHeight]);
  cover.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(1, 1, 1),
  });
  try {
    const logoBytes = await readImageFromFS(join(process.cwd(), 'public/images/logo.png'));
    const logo = await pdfDoc.embedPng(logoBytes);
    const logoW = 1.8 * 72;
    const logoH = (logo.height / logo.width) * logoW;
    cover.drawImage(logo, {
      x: 0.7 * 72,
      y: pageHeight - 0.7 * 72 - logoH,
      width: logoW,
      height: logoH,
    });
  } catch (err) {
    logger.error('Logo load failed', err);
  }
  const blackHeight = pageHeight - 2.6 * 72;
  cover.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: blackHeight,
    color: rgb(0, 0, 0),
  });
  cover.drawText(coverTitle, {
    x: 0.7 * 72,
    y: pageHeight - 3.1 * 72,
    size: 36,
    font: font,
    color: rgb(1, 1, 1),
  });
  cover.drawText(`Generated On ${new Date().toLocaleDateString()}`, {
    x: 0.9 * 72,
    y: pageHeight - 3.5 * 72,
    size: 14,
    font: font,
    color: rgb(1, 1, 1),
  });
  if (summary) {
    const marginX = 0.7 * 72;
    let y = pageHeight - 4.2 * 72;
    cover.drawText('Dashboard Filters', {
      x: marginX,
      y,
      size: 24,
      font: font,
      color: rgb(1, 1, 1),
    });
    y -= 0.5 * 72;
    for (const [key, value] of Object.entries(summary)) {
      const text = `${key.replace(/([A-Z])/g, ' $1').replace(/\b\w/g, (c) => c.toUpperCase())}: ${String(value)}`;
      cover.drawText(`• ${text}`, {
        x: marginX + 0.2 * 72,
        y,
        size: 14,
        font: font,
        color: rgb(1, 1, 1),
      });
      y -= 0.35 * 72;
    }
  }
  if (dashboardImage) {
    await addImagePage(pdfDoc, font, dashboardImage, coverTitle);
  }
  for (const sec of sections) {
    await addImagePage(pdfDoc, font, sec.image, sec.title);
  }
  const pdfBytes = await pdfDoc.save();
  logger.info(`PDF download size: ${pdfBytes.length / 1024} KB`);
  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
});
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
//# sourceMappingURL=route.js.map
