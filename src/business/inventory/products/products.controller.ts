import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Roles } from "business/accounts/auth/decorators/index.decorator";
import { ROLE } from "core/enum/role.enum";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Category } from "./enum/category.enum";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
	@Post()
	create(@Body() createProductDto: CreateProductDto) {
		return this.productsService.create(createProductDto);
	}

	@Get()
	findAll() {
		return this.productsService.findAll();
	}

	@Get("active")
	findActive() {
		return this.productsService.findActive();
	}

	@Get("featured")
	findFeatured() {
		return this.productsService.findFeatured();
	}

	@Get("in-stock")
	findInStock() {
		return this.productsService.findInStock();
	}

	@Get("category/:category")
	findByCategory(@Param("category") category: Category) {
		return this.productsService.findByCategory(category);
	}

	@Get("slug/:slug")
	findBySlug(@Param("slug") slug: string) {
		return this.productsService.findBySlug(slug);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.productsService.findOne(id);
	}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
	@Patch(":id")
	update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
		return this.productsService.update(id, updateProductDto);
	}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
	@Patch(":id/toggle-active")
	toggleActive(@Param("id") id: string) {
		return this.productsService.toggleActive(id);
	}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
	@Patch(":id/toggle-featured")
	toggleFeatured(@Param("id") id: string) {
		return this.productsService.toggleFeatured(id);
	}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
	@Patch(":id/stock")
	updateStock(@Param("id") id: string, @Body("quantity") quantity: number) {
		return this.productsService.updateStock(id, quantity);
	}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
	@Patch(":id/stock/increment")
	incrementStock(@Param("id") id: string, @Body("quantity") quantity: number) {
		return this.productsService.incrementStock(id, quantity);
	}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
	@Patch(":id/stock/decrement")
	decrementStock(@Param("id") id: string, @Body("quantity") quantity: number) {
		return this.productsService.decrementStock(id, quantity);
	}

	@Roles(ROLE.ADMIN, ROLE.SELLER)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.productsService.remove(id);
	}
}
