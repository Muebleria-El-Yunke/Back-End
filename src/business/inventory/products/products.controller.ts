import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { SellerOrAdmin } from "business/accounts/auth/decorators/index.decorator";
import { JwtAuthGuard } from "business/accounts/auth/guard/jwt-auth.guard";
import { RolesGuard } from "business/accounts/auth/guard/role.guard";
import { PaginationDto } from "core/dto/pagination.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Category } from "./enum/category.enum";
import { ProductsService } from "./products.service";

@Controller("products")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@SellerOrAdmin()
	@Post()
	create(@Body() createProductDto: CreateProductDto) {
		return this.productsService.create(createProductDto);
	}

	@Get()
	findAll(@Query() paginationDto: PaginationDto) {
		return this.productsService.findAll(paginationDto);
	}

	@Get("active")
	findActive(@Query() paginationDto: PaginationDto) {
		return this.productsService.findActive(paginationDto);
	}

	@Get("featured")
	findFeatured(@Query() paginationDto: PaginationDto) {
		return this.productsService.findFeatured(paginationDto);
	}

	@Get("in-stock")
	findInStock(@Query() paginationDto: PaginationDto) {
		return this.productsService.findInStock(paginationDto);
	}

	@Get("category/:category")
	findByCategory(@Param("category") category: Category, @Query() paginationDto: PaginationDto) {
		return this.productsService.findByCategory(category, paginationDto);
	}

	@Get("slug/:slug")
	findBySlug(@Param("slug") slug: string) {
		return this.productsService.findBySlug(slug);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.productsService.findOne(id);
	}

	@SellerOrAdmin()
	@Patch(":id")
	update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
		return this.productsService.update(id, updateProductDto);
	}

	@SellerOrAdmin()
	@Patch(":id/toggle-active")
	toggleActive(@Param("id") id: string) {
		return this.productsService.toggleActive(id);
	}

	@SellerOrAdmin()
	@Patch(":id/toggle-featured")
	toggleFeatured(@Param("id") id: string) {
		return this.productsService.toggleFeatured(id);
	}

	@SellerOrAdmin()
	@Patch(":id/stock")
	updateStock(@Param("id") id: string, @Body("quantity") quantity: number) {
		return this.productsService.updateStock(id, quantity);
	}

	@SellerOrAdmin()
	@Patch(":id/stock/increment")
	incrementStock(@Param("id") id: string, @Body("quantity") quantity: number) {
		return this.productsService.incrementStock(id, quantity);
	}

	@SellerOrAdmin()
	@Patch(":id/stock/decrement")
	decrementStock(@Param("id") id: string, @Body("quantity") quantity: number) {
		return this.productsService.decrementStock(id, quantity);
	}

	@SellerOrAdmin()
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.productsService.remove(id);
	}
}
