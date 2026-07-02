import { InvalidPageQueryError } from "../errors/DomainError";

/**
 * Pagination value object (pure domain). Validates a 1-based page and a bounded limit,
 * and derives the offset. Used by admin listings (users, levels).
 */
export class PageQuery {
  static readonly DEFAULT_PAGE = 1;
  static readonly DEFAULT_LIMIT = 20;
  static readonly MAX_LIMIT = 100;

  private constructor(
    readonly page: number,
    readonly limit: number,
  ) {}

  static create(
    page: number = PageQuery.DEFAULT_PAGE,
    limit: number = PageQuery.DEFAULT_LIMIT,
  ): PageQuery {
    if (!Number.isInteger(page) || page < 1) {
      throw new InvalidPageQueryError("page must be a positive integer");
    }
    if (!Number.isInteger(limit) || limit < 1) {
      throw new InvalidPageQueryError("limit must be a positive integer");
    }
    return new PageQuery(page, Math.min(limit, PageQuery.MAX_LIMIT));
  }

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
