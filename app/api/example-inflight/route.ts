import { NextRequest, NextResponse } from 'next/server';
import { inflightManager } from '@/lib/inflight/manager';

// Example expensive operation that should only be executed once globally
async function fetchExpensiveDataFromDatabase(productId: string) {
  // Simulate heavy database/network latency
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Return deterministic payload
  return {
    id: productId,
    timestamp: Date.now(),
    source: 'database',
    description: `Fetched expensive data for product ${productId}`,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') || 'default-product';

  try {
    // We wrap the expensive database call in the InFlight Manager
    const data = await inflightManager.execute(
      {
        method: request.method,
        url: request.nextUrl.pathname,
        query: { productId },
        // If the query was scoped to a user, you'd add userId: request.user.id
      },
      () => fetchExpensiveDataFromDatabase(productId)
    );

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
