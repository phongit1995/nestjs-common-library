import { NumberField } from "./../decorators";

export class PaginationDto {
  @NumberField({ description: "page", example: 1 })
  page: number;

  @NumberField({ description: "pageSize", example: 10 })
  pageSize: number;
}
export class PaginationHelper<T> {
  constructor(
    public readonly data: T[],
    public readonly total: number,
    public readonly page: number,
    public readonly pageSize: number
  ) {
    this.totalPage = Math.ceil(total / pageSize);
  }

  private readonly totalPage: number;
}
