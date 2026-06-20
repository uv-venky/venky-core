'use client';
import { showError } from '@/lib/core/client/notifications';
import clientLogger from '@/lib/core/client/client-logger';

async function getDomToImage() {
  return (await import('dom-to-image')).default;
}

interface Section {
  title: string;
  refs: React.RefObject<HTMLElement | null>[];
}

interface Options {
  fileName?: string;
  coverTitle: string;
  dashboardRef?: React.RefObject<HTMLElement | null>;
  summary?: Record<string, any>;
  sections: Section[];
}

interface CapturedImage {
  data: string;
  width: number;
  height: number;
}

async function capture(ref: React.RefObject<HTMLElement | null>): Promise<CapturedImage | null> {
  if (!ref.current) return null;

  const node = ref.current;
  const parent = node.parentElement;

  // Store original styles
  const originalNodeStyles = {
    width: node.style.width,
    height: node.style.height,
    overflow: node.style.overflow,
    transform: node.style.transform,
    transformOrigin: node.style.transformOrigin,
    margin: node.style.margin,
    padding: node.style.padding,
  };

  const originalParentStyles = parent
    ? {
        display: parent.style.display,
        justifyContent: parent.style.justifyContent,
        alignItems: parent.style.alignItems,
      }
    : null;

  try {
    if (parent) {
      parent.style.display = 'flex';
      parent.style.justifyContent = 'center';
      parent.style.alignItems = 'center';
    }

    // Set node dimensions
    node.style.width = `${node.scrollWidth}px`;
    node.style.height = `${node.scrollHeight}px`;
    node.style.overflow = 'visible';
    node.style.transform = 'none';
    node.style.transformOrigin = 'top left';
    node.style.margin = '0 auto';
    node.style.padding = '10px';

    const domtoimage = await getDomToImage();
    const dataUrl = await domtoimage.toPng(node, {
      bgcolor: '#fff',
      quality: 1,
      width: node.scrollWidth,
      height: node.scrollHeight,
      style: {
        margin: '0 auto',
        display: 'block',
      },
    });

    return {
      data: dataUrl,
      width: node.scrollWidth,
      height: node.scrollHeight,
    };
  } finally {
    // Restore original styles
    node.style.width = originalNodeStyles.width;
    node.style.height = originalNodeStyles.height;
    node.style.overflow = originalNodeStyles.overflow;
    node.style.transform = originalNodeStyles.transform;
    node.style.transformOrigin = originalNodeStyles.transformOrigin;
    node.style.margin = originalNodeStyles.margin;
    node.style.padding = originalNodeStyles.padding;

    if (parent && originalParentStyles) {
      parent.style.display = originalParentStyles.display;
      parent.style.justifyContent = originalParentStyles.justifyContent;
      parent.style.alignItems = originalParentStyles.alignItems;
    }
  }
}

// Note: concatenateImagesHorizontally is no longer used, so it is removed.

export async function exportDashboardPPT({
  fileName = 'dashboard-report.pptx',
  coverTitle,
  dashboardRef,
  summary,
  sections,
}: Options) {
  const html = document.documentElement;
  const body = document.body;

  const prevClass = html.className;
  const prevScheme = html.style.colorScheme;
  const prevBorder = html.style.getPropertyValue('--border');
  const prevBodyTransform = body.style.transform;
  const prevBodyTransformOrigin = body.style.transformOrigin;
  const prevBodyWidth = body.style.width;

  try {
    html.classList.remove('dark');
    html.classList.add('light');
    html.style.colorScheme = 'light';
    html.style.setProperty('--border', 'transparent');
    body.style.transform = 'scale(0.9)';
    body.style.transformOrigin = '0 0';
    body.style.width = '138.2632%';
    await new Promise((resolve) => setTimeout(resolve, 100));

    const dashboardImg = dashboardRef ? await capture(dashboardRef) : null;

    const payloadSections: { title: string; image: string }[] = [];

    for (const { title, refs } of sections) {
      for (const ref of refs) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const img = await capture(ref);
        if (img) {
          // Push each captured image separately so each becomes its own slide
          payloadSections.push({ title, image: img.data });
        }
      }
    }

    // Restore styles early if needed before network call
    body.style.transform = prevBodyTransform;
    body.style.transformOrigin = prevBodyTransformOrigin;
    body.style.width = prevBodyWidth;
    html.className = prevClass;
    html.style.colorScheme = prevScheme;
    html.style.setProperty('--border', prevBorder);

    const res = await fetch('/api/export-dashboard-ppt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        coverTitle,
        dashboardImage: dashboardImg?.data,
        summary,
        sections: payloadSections,
      }),
    });

    if (!res.ok) {
      clientLogger.error({
        message: 'PPT export failed',
        response: await res.text(),
      });
      showError('PPT export failed!');
      return;
    }
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  } finally {
    // Ensure styles get restored even if error occurs
    body.style.transform = prevBodyTransform;
    body.style.transformOrigin = prevBodyTransformOrigin;
    body.style.width = prevBodyWidth;
    html.className = prevClass;
    html.style.colorScheme = prevScheme;
    html.style.setProperty('--border', prevBorder);
  }
}
