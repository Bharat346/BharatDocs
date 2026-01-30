// app/api/test/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
  // Firewall is already applied via middleware
  // Your API logic here
  
  return NextResponse.json({
    success: true,
    message: 'API protected by firewall',
    data: {
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers),
    },
  });
}