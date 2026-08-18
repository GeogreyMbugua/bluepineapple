import { NextRequest } from 'next/server';
import { reviewService } from '@blue-pineapple/iam';
import { ReviewQuerySchema, CreateReviewSchema } from '@blue-pineapple/iam';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = ReviewQuerySchema.parse({
      experienceId: searchParams.get('experienceId') || undefined,
      featured: searchParams.get('featured') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    if (query.featured) {
      const result = await reviewService.listFeatured();
      return Response.json({ data: result, timestamp: new Date().toISOString() });
    }

    const result = await reviewService.listReviews(query);
    return Response.json({ data: result, timestamp: new Date().toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch reviews' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateReviewSchema.parse(body);

    const review = await reviewService.createReview(validated);

    return Response.json({ data: review, timestamp: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || error.message || 'Validation failed';
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', message } },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      if (error.message.includes('already been reviewed')) {
        return Response.json(
          { error: { code: 'CONFLICT', message: error.message } },
          { status: 409 }
        );
      }
      console.error('[reviews] Failed to create review:', error);
      return Response.json(
        { error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to create review' } },
        { status: 500 }
      );
    }
    console.error('[reviews] Unknown error:', error);
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create review' } },
      { status: 500 }
    );
  }
}
