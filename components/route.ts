import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[ViewComponent] API called');
    
    const { searchParams } = new URL(request.url);
    const slideParam = searchParams.get('slide');
    const masjidParam = searchParams.get('masjid');

    console.log('[ViewComponent] Params:', { slideParam: !!slideParam, masjidParam: !!masjidParam });

    if (!slideParam) {
      console.log('[ViewComponent] No slide data provided');
      return NextResponse.json(
        { error: 'No slide data provided' },
        { status: 400 }
      );
    }

    let slide, masjid;
    try {
      // Decode URL-encoded parameters first
      const decodedSlideParam = decodeURIComponent(slideParam);
      const decodedMasjidParam = masjidParam ? decodeURIComponent(masjidParam) : undefined;
      
      console.log('[ViewComponent] Decoded slide param:', decodedSlideParam.substring(0, 100) + '...');
      
      slide = JSON.parse(decodedSlideParam);
      masjid = decodedMasjidParam ? JSON.parse(decodedMasjidParam) : undefined;
      console.log('[ViewComponent] Parsed data:', { slideId: slide?.id, masjidId: masjid?.id });
    } catch (parseError) {
      console.error('[ViewComponent] Failed to parse JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON data' },
        { status: 400 }
      );
    }

    if (!slide.customComponentUrl) {
      console.log('[ViewComponent] No component URL in slide data');
      return NextResponse.json(
        { error: 'No component URL in slide data' },
        { status: 400 }
      );
    }

    console.log('[ViewComponent] Component URL:', slide.customComponentUrl);

    // Generate a hash for the slide content to use as ETag
    const contentHash = generateContentHash(JSON.stringify({ slide, masjid }));
    
    // Check if client has the latest version
    const ifNoneMatch = request.headers.get('if-none-match');
    
    if (ifNoneMatch === `"${contentHash}"`) {
      console.log('[ViewComponent] Returning 304 - Not Modified');
      return new NextResponse(null, { status: 304 });
    }

    // For now, return a simple HTML response for testing
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Slide - ${slide.id}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #550C18 0%, #78001A 100%);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        .info {
            background: rgba(255,255,255,0.1);
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }
        .timestamp {
            font-size: 0.9rem;
            opacity: 0.7;
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Custom Slide</h1>
        <div class="subtitle">Dynamic content from API</div>
        
        <div class="info">
            <strong>Slide ID:</strong> ${slide.id}<br>
            <strong>Type:</strong> ${slide.type}<br>
            <strong>Component URL:</strong> ${slide.customComponentUrl}<br>
            ${masjid ? `<strong>Masjid:</strong> ${masjid.name}` : ''}
        </div>
        
        <div class="info">
            <strong>Content:</strong><br>
            <pre style="text-align: left; font-size: 0.8rem; overflow: auto; max-height: 200px;">${JSON.stringify(slide.content || {}, null, 2)}</pre>
        </div>
        
        <div class="timestamp">
            Generated at: ${new Date().toLocaleString()}
        </div>
    </div>
    
    <script>
        // Inject the slide and masjid data for potential use
        window.slideData = ${JSON.stringify(slide)};
        window.masjidData = ${JSON.stringify(masjid)};
        
        console.log('Custom slide loaded:', window.slideData);
    </script>
</body>
</html>`;

    // Set caching headers
    const headersList = new Headers();
    headersList.set('Content-Type', 'text/html; charset=utf-8');
    headersList.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    headersList.set('ETag', `"${contentHash}"`);
    headersList.set('Last-Modified', new Date().toUTCString());

    console.log('[ViewComponent] Returning HTML response');

    return new NextResponse(html, {
      status: 200,
      headers: headersList,
    });

  } catch (error) {
    console.error('[ViewComponent] Error in API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateContentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
} 