import { NumberField } from './../decorators';

export class PaginationDto {
  @NumberField({ description: 'page', example: 1 })
  page: number;

  @NumberField({ description: 'pageSize', example: 10 })
  pageSize: number;
}
export class PaginationHelper <T>{
    constructor(data:T[],total: number,page:number,pageSize:number){
        this.data=data;
        this.total = total;
        this.page = page;
        this.totalPage = Math.ceil(total / pageSize);
    }
    private data:T[];
    private total: number;
    private page: number;
    private pageSize: number;
    private totalPage:number;
  
}