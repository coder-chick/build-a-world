import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/video/[taskId]/stream
 * Re-fetches the Veo LRO and streams the videoBytes as a proper video/mp4 response.
 * The <video> element uses this URL as its src so the browser can actually play it.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const { taskId } = params;

  if (!taskId.startsWith('veo::')) {
    return new NextResponse('Not a Veo task', { status: 400 });
  }

  const operationName = taskId.slice(5).replace(/~/g, '/');
  const googleKey = process.env.GOOGLE_API_KEY;
  if (!googleKey) {
    return new NextResponse('No GOOGLE_API_KEY configured', { status: 500 });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${googleKey}`
  );
  if (!res.ok) {
    return new NextResponse(`Veo fetch error ${res.status}`, { status: 502 });
  }

  const data = await res.json() as {
    done?: boolean;
    response?: {
      generateVideoResponse?: { generatedSamples?: { video?: { uri?: string; videoBytes?: string; mimeType?: string } }[] };
      generatedSamples?: { video?: { uri?: string; videoBytes?: string; mimeType?: string } }[];
    };
  };

  if (!data.done) {
    return new NextResponse('Video not ready yet', { status: 202 });
  }

  const samples =
    data.response?.generateVideoResponse?.generatedSamples ??
    data.response?.generatedSamples ?? [];
  const video = samples[0]?.video;

  if (!video) {
    return new NextResponse('No video in Veo response', { status: 404 });
  }

  // If Veo gave us a public URI, redirect to it
  if (video.uri?.startsWith('http')) {
    return NextResponse.redirect(video.uri);
  }

  // Convert base64 videoBytes → binary buffer
  if (video.videoBytes) {
    const mime = video.mimeType ?? 'video/mp4';
    const binary = Buffer.from(video.videoBytes, 'base64');
    return new NextResponse(binary, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Length': String(binary.byteLength),
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      },
    });
  }

  return new NextResponse('No video data available', { status: 404 });
}
