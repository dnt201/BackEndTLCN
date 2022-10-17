export class OrderQuery {
  name: string;
  value: string;
}

export class Page {
  size: number;
  pageNumber: number;
  totalElement: number;
  order: OrderQuery[];

  constructor(
    size: number,
    pageNumber: number,
    totalElement: number,
    order: OrderQuery[],
  ) {
    this.size = size;
    this.pageNumber = pageNumber;
    this.totalElement = totalElement;
    this.order = order;
  }
}
