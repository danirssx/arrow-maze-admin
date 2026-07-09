/**
 * Base domain error. Domain errors carry no HTTP/transport semantics; mapping to a
 * status code (if ever needed) belongs to an outer layer.
 */
export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidPageQueryError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
