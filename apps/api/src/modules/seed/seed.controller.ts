import { Controller, Post, Query } from "@nestjs/common";
import { SeedService } from "./seed.service";

@Controller("admin/seed")
export class SeedController {
  constructor(private readonly seed: SeedService) {}

  @Post()
  run(@Query("count") count?: string) {
    return this.seed.seed(count ? Number(count) : 10);
  }
}
