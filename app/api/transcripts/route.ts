import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const transcriptsDir = path.join(process.cwd(), 'transcripts');

    // Check if directory exists
    if (!fs.existsSync(transcriptsDir)) {
      return NextResponse.json({ transcripts: [] });
    }

    const files = fs.readdirSync(transcriptsDir);
    const transcripts = files
      .filter((file) => file.endsWith('.md'))
      .map((filename) => ({
        filename,
        name: filename.replace('.md', ''),
      }));

    return NextResponse.json({ transcripts });
  } catch (error) {
    console.error('Error reading transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to read transcripts' },
      { status: 500 }
    );
  }
}
