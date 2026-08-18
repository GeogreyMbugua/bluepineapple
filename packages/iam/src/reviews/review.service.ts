import { reviewRepository, userRepository } from "@blue-pineapple/database";
import { notificationService } from "../adapters";
import { renderAdminReviewCreatedEmail } from "../notifications/templates/review-created-admin.template";
import type { CreateReviewInput, ReviewQueryInput } from "./review.validators";

export class ReviewService {
  async createReview(data: CreateReviewInput) {
    const review = await reviewRepository.create({
      experienceId: data.experienceId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      isApproved: true,
      isFeatured: false,
      helpfulCount: 0,
    } as any);

    let experienceName: string | undefined;
    if (data.experienceId) {
      const { experienceRepository: expRepo } = await import("@blue-pineapple/database");
      const experience = await expRepo.findById(data.experienceId);
      experienceName = experience?.name ?? undefined;
    }

    const admins = await userRepository.findAdmins();
    const recipientEmails = admins
      .map((admin) => admin.email)
      .filter((email): email is string => Boolean(email));

    if (recipientEmails.length === 0) return;

    const html = renderAdminReviewCreatedEmail({
      guestName: review.guestName,
      rating: review.rating,
      comment: review.comment,
      experienceName,
    });

    for (const email of recipientEmails) {
      void notificationService.send({
        to: email,
        subject: `New Review Submitted — ${review.rating} stars`,
        body: html,
        purpose: "ADMIN_REVIEW_CREATED",
      }).catch((err) => {
        console.error("[reviews] Failed to send admin notification:", err);
      });
    }

    return review;
  }

  async listReviews(query: ReviewQueryInput = {}) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const reviews = await reviewRepository.findApproved(
      query.experienceId,
      limit,
      offset
    );

    const averageRating = await reviewRepository.getAverageRating(
      query.experienceId
    );
    const totalCount = await reviewRepository.getCount(query.experienceId);

    return {
      reviews,
      averageRating,
      totalCount,
    };
  }

  async listFeatured() {
    const reviews = await reviewRepository.findFeatured();
    const averageRating = await reviewRepository.getAverageRating();
    const totalCount = await reviewRepository.getCount();

    return {
      reviews,
      averageRating,
      totalCount,
    };
  }

  async markFeatured(id: string, featured: boolean) {
    return reviewRepository.update(id, { isFeatured: featured } as any);
  }

  async approve(id: string, approved: boolean) {
    return reviewRepository.update(id, { isApproved: approved } as any);
  }

  async delete(id: string) {
    await reviewRepository.delete(id);
  }
}

export const reviewService = new ReviewService();
