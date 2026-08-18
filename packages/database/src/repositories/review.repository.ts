import { prisma } from "../client.ts";
import type { Review, Prisma } from "@prisma/client";

export class ReviewRepository {
  async findById(id: string): Promise<Review | null> {
    return prisma.review.findUnique({ where: { id } });
  }

  async findApproved(experienceId?: string, limit = 20, offset = 0): Promise<Review[]> {
    return prisma.review.findMany({
      where: {
        isApproved: true,
        ...(experienceId ? { experienceId } : {}),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async findFeatured(limit = 6): Promise<Review[]> {
    return prisma.review.findMany({
      where: {
        isApproved: true,
        isFeatured: true,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findByBookingId(bookingId: string): Promise<Review | null> {
    return prisma.review.findFirst({ where: { bookingId } });
  }

  async findByUserId(userId: string): Promise<Review[]> {
    return prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return prisma.review.create({ data });
  }

  async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return prisma.review.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.review.delete({ where: { id } });
  }

  async getAverageRating(experienceId?: string): Promise<number> {
    const result = await prisma.review.aggregate({
      where: {
        isApproved: true,
        ...(experienceId ? { experienceId } : {}),
      },
      _avg: { rating: true },
    });
    return result._avg.rating ? Number(result._avg.rating) : 0;
  }

  async getCount(experienceId?: string): Promise<number> {
    return prisma.review.count({
      where: {
        isApproved: true,
        ...(experienceId ? { experienceId } : {}),
      },
    });
  }
}

export const reviewRepository = new ReviewRepository();
