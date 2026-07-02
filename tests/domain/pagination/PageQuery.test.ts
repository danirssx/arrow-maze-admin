import { InvalidPageQueryError } from "@/domain/errors/DomainError";
import { PageQuery } from "@/domain/pagination/PageQuery";

// Subject to human review — domain value-object test

describe("PageQuery", () => {
  it("should_default_page_and_limit_when_none_given", () => {
    const query = PageQuery.create();

    expect(query.page).toBe(1);
    expect(query.limit).toBe(20);
  });

  it("should_compute_offset_from_page_and_limit", () => {
    expect(PageQuery.create(3, 10).offset).toBe(20);
    expect(PageQuery.create(1, 20).offset).toBe(0);
  });

  it("should_cap_limit_at_the_maximum", () => {
    expect(PageQuery.create(1, 99999).limit).toBe(100);
  });

  it("should_accept_a_limit_of_one", () => {
    expect(PageQuery.create(1, 1).limit).toBe(1);
  });

  it("should_throw_when_page_is_not_a_positive_integer", () => {
    expect(() => PageQuery.create(0, 20)).toThrow(InvalidPageQueryError);
    expect(() => PageQuery.create(0, 20)).toThrow("page must be a positive integer");
    expect(() => PageQuery.create(1.5, 20)).toThrow(InvalidPageQueryError);
  });

  it("should_throw_when_limit_is_not_a_positive_integer", () => {
    expect(() => PageQuery.create(1, 0)).toThrow(InvalidPageQueryError);
    expect(() => PageQuery.create(1, 0)).toThrow("limit must be a positive integer");
    expect(() => PageQuery.create(1, -5)).toThrow(InvalidPageQueryError);
  });
});
