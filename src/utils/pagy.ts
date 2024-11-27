export class Pagy {
  page: number;
  perPage: number;

  constructor(page?: string, per_page?: string) {
    this.page = page && !Number.isNaN(+page) ? +page : 1;
    this.perPage =
      per_page && !Number.isNaN(+per_page) ? +per_page : 20;
  }
}
