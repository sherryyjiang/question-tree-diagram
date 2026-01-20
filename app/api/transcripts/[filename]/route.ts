import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const decodedFilename = decodeURIComponent(filename);

    // Validate filename to prevent directory traversal
    if (decodedFilename.includes('..') || decodedFilename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const transcriptsDir = path.join(process.cwd(), 'transcripts');
    const filePath = path.join(transcriptsDir, decodedFilename);

    // Ensure the file is within the transcripts directory
    if (!filePath.startsWith(transcriptsDir)) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error reading transcript:', error);
    return NextResponse.json(
      { error: 'Failed to read transcript' },
      { status: 500 }
    );
  }
}
