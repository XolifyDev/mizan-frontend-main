import { NextRequest, NextResponse } from 'next/server';
import type { Plugin } from 'esbuild';
import * as esbuild from 'esbuild';

/**
 * Transforms a standard GitHub file URL into a raw content URL.
 * e.g., https://github.com/user/repo/blob/main/src/component.tsx
 * becomes https://raw.githubusercontent.com/user/repo/main/src/component.tsx
 */
const createRawGitHubUrl = (githubUrl: string): string | null => {
  try {
    const url = new URL(githubUrl);
    if (url.hostname !== 'github.com') {
      return null; // Only handle github.com URLs
    }
    const path = url.pathname.replace('/blob/', '/');
    return `https://raw.githubusercontent.com${path}`;
  } catch (e) {
    console.error('Invalid URL for createRawGitHubUrl:', e);
    return null;
  }
};

/**
 * An esbuild plugin to resolve bare module specifiers to a CDN.
 * This turns `import React from 'react'` into `import React from 'https://esm.sh/react'`.
 */
const cdnResolverPlugin: Plugin = {
    name: 'cdn-resolver',
    setup(build) {
        // Intercept any import path that does not start with "." or "/"
        build.onResolve({ filter: /^[^./]/ }, args => {
            console.log(`[cdn-resolver] Remapping bare import: ${args.path}`);
            // Rewrite the path to point to the esm.sh CDN and mark it as external.
            // This stops esbuild from trying to bundle the dependency itself.
            return {
                path: `https://esm.sh/${args.path}`,
                external: true,
            }
        })
    },
};

/**
 * This API route fetches raw TSX/JSX code from a GitHub URL,
 * transpiles it on-the-fly using esbuild, and serves it as
 * executable JavaScript. This acts as a self-hosted CDN.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const githubUrl = searchParams.get('url');

  if (!githubUrl) {
    return new NextResponse('Missing "url" parameter', { status: 400 });
  }

  const rawUrl = createRawGitHubUrl(githubUrl);

  if (!rawUrl) {
    return new NextResponse('Invalid GitHub URL format. Must be a direct link to a file on github.com.', { status: 400 });
  }

  try {
    // 1. Fetch the raw source code from GitHub
    const codeResponse = await fetch(rawUrl, {
      // Use no-store to ensure we always get the latest commit from GitHub
      cache: 'no-store',
    });

    if (!codeResponse.ok) {
        console.log('Failed to fetch code from GitHub:', codeResponse.statusText);
        return new NextResponse(`Failed to fetch code from GitHub: ${codeResponse.statusText}`, { status: codeResponse.status });
    }

    const sourceCode = await codeResponse.text();

    // 2. Transpile the code and resolve imports using esbuild
    const result = await esbuild.build({
        stdin: {
            contents: sourceCode,
            loader: 'tsx',
            resolveDir: process.cwd(), // Needed for plugins to work correctly
        },
        bundle: true, // We need bundle:true to process imports
        format: 'esm',
        target: 'esnext',
        write: false, // Return the result in memory instead of writing to a file
        plugins: [cdnResolverPlugin],
    });

    const transpiledCode = result.outputFiles[0].text;

    // 3. Send the transpiled JavaScript back to the client
    const headers = new Headers();
    headers.set('Content-Type', 'application/javascript; charset=utf-8');
    // Instruct the browser not to cache our transpiled component
    headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    console.log(transpiledCode);

    return new NextResponse(transpiledCode, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('esbuild transformation error:', error);
    // Forward esbuild's specific error message if available
    const errorMessage = error.message || 'An unknown error occurred during transpilation.';
    return new NextResponse(`Compilation Error: ${errorMessage}`, { status: 500 });
  }
} 