import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query("q") q?: string, @Query("type") type?: string, @Query("genre") genre?: string, @Query("mood") mood?: string) {
    return this.searchService.search(q, type, { genre, mood });
  }
}
