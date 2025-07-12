import { NextRequest, NextResponse } from 'next/server';
import * as esbuild from 'esbuild';

// Optional: CDN resolver plugin for esbuild
const cdnResolverPlugin = {
  name: 'cdn-resolver',
  setup(build) {
    build.onResolve({ filter: /^[^./]/ }, args => ({
      path: `https://esm.sh/${args.path}`,
      namespace: 'http-url',
    }));
    build.onResolve({ filter: /.*/, namespace: 'http-url' }, args => ({
      path: new URL(args.path, args.importer).href,
      namespace: 'http-url',
    }));
    build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
      const res = await fetch(args.path);
      const contents = await res.text();
      return { contents, loader: 'default', resolveDir: new URL('.', args.path).href };
    });
  },
};

const createRawGitHubUrl = (githubUrl: string): string | null => {
  githubUrl = githubUrl.replaceAll(" ", "");
  if (githubUrl.includes("raw.githubusercontent.com")) {
    return githubUrl;
  }
  try {
    const url = new URL(githubUrl);
    if (url.hostname !== 'github.com') {
      return null;
    }
    const path = url.pathname.replace('/blob/', '/');
    return `https://raw.githubusercontent.com${path}`;
  } catch (e) {
    console.error('Invalid URL for createRawGitHubUrl:', e);
    return null;
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const githubUrlParam = searchParams.get('url');
  const githubUrl = githubUrlParam ? decodeURIComponent(githubUrlParam).replaceAll(" ", "").trim() : null;

  if (!githubUrl) {
    return new NextResponse('Missing "url" parameter', { status: 400 });
  }

  const rawUrl = createRawGitHubUrl(githubUrl);
  if (!rawUrl) {
    return new NextResponse('Invalid GitHub URL format. Must be a direct link to a file on github.com.', { status: 400 });
  }

  try {
    const codeResponse = await fetch(rawUrl, { cache: 'no-store' });
    if (!codeResponse.ok) {
      return new NextResponse(`Failed to fetch code from GitHub: ${codeResponse.statusText}`, { status: codeResponse.status });
    }
    const sourceCode = await codeResponse.text();

    // Transpile TSX/JSX to JS using esbuild
    const result = await esbuild.build({
      stdin: {
        contents: sourceCode,
        loader: 'tsx',
        resolveDir: process.cwd(),
      },
      bundle: true,
      format: 'iife',
      globalName: 'MizanDynamicComponent',
      target: 'esnext',
      write: false,
      plugins: [cdnResolverPlugin],
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      footer: {
        js: 'if (typeof window !== "undefined") { window.MizanDynamicComponent = typeof MizanDynamicComponent === "function" ? MizanDynamicComponent : (typeof MizanDynamicComponent === "object" && MizanDynamicComponent && typeof MizanDynamicComponent.default === "function" ? MizanDynamicComponent.default : undefined); }'
      }
    });
    const transpiledCode = result.outputFiles[0].text;

    const headers = new Headers();
    headers.set('Content-Type', 'application/javascript; charset=utf-8');
    headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return new NextResponse(transpiledCode, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('esbuild transformation error:', error);
    const errorMessage = error.message || 'An unknown error occurred during transpilation.';
    return new NextResponse(`Compilation Error: ${errorMessage}`, { status: 500 });
  }
} 