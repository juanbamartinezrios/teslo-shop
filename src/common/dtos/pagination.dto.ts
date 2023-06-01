import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @Type(() => Number) // sería innecesario si se utiliza enableImplicitConversions: true
    limit?: number;

    @IsOptional()
    @Type(() => Number) // sería innecesario si se utiliza enableImplicitConversions: true
    @Min(0)
    offset?: number;
}