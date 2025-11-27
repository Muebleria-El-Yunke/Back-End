import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UploadedFiles,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { SellerOrAdmin } from "business/accounts/auth/decorators/index.decorator";
import { JwtAuthGuard } from "business/accounts/auth/guard/jwt-auth.guard";
import { RolesGuard } from "business/accounts/auth/guard/role.guard";
import { PaginationDto } from "core/dto/pagination.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Category } from "./enum/category.enum";
import { ProductsService } from "./products.service";
import { ImageOrderDto } from "./dto/image-order.dto";

@Controller("products")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags("Products")
@ApiBearerAuth()
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	// ========== Public Endpoints ==========

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get all products" })
	@ApiResponse({ status: 200, description: "Return all products." })
	findAll(@Query() paginationDto?: PaginationDto) {
		return this.productsService.findAll(paginationDto);
	}

	@Get("active")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get active products" })
	@ApiResponse({ status: 200, description: "Return active products." })
	findActive(@Query() paginationDto?: PaginationDto) {
		return this.productsService.findActive(paginationDto);
	}

	@Get("featured")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get featured products" })
	@ApiResponse({ status: 200, description: "Return featured products." })
	findFeatured(@Query() paginationDto?: PaginationDto) {
		return this.productsService.findFeatured(paginationDto);
	}

	@Get("in-stock")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get products in stock" })
	@ApiResponse({ status: 200, description: "Return products in stock." })
	findInStock(@Query() paginationDto?: PaginationDto) {
		return this.productsService.findInStock(paginationDto);
	}

	@Get("category/:category")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get products by category" })
	@ApiResponse({ status: 200, description: "Return products by category." })
	findByCategory(@Param("category") category: Category, @Query() paginationDto?: PaginationDto) {
		return this.productsService.findByCategory(category, paginationDto);
	}

	@Get(":id")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get product by ID" })
	@ApiResponse({ status: 200, description: "Return product by ID." })
	@ApiResponse({ status: 404, description: "Product not found." })
	findOne(@Param("id", ParseUUIDPipe) id: string) {
		return this.productsService.findOne(id);
	}

	// ========== Protected Endpoints (Seller/Admin only) ==========

	@SellerOrAdmin()
	@Post()
	@HttpCode(HttpStatus.CREATED)
	@UseInterceptors(FilesInterceptor("photos", 10))
	@ApiOperation({ summary: "Create a new product (Seller/Admin)" })
	@ApiConsumes("multipart/form-data")
	@ApiResponse({ status: 201, description: "Product created successfully." })
	create(
		@Body() createProductDto: CreateProductDto,
		@UploadedFiles() photos?: Express.Multer.File[],
	) {
		return this.productsService.create(createProductDto, photos);
	}

	@SellerOrAdmin()
	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FilesInterceptor("photos", 10))
	@ApiOperation({ summary: "Update product by ID (Seller/Admin)" })
	@ApiConsumes("multipart/form-data")
	@ApiResponse({ status: 200, description: "Product updated successfully." })
	update(
		@Param("id", ParseUUIDPipe) id: string,
		@Body() updateProductDto: UpdateProductDto,
		@UploadedFiles() photos?: Express.Multer.File[],
	) {
		return this.productsService.update(id, updateProductDto, photos);
	}

	@SellerOrAdmin()
	@Patch(":id/toggle-active")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Toggle product active status (Seller/Admin)" })
	@ApiResponse({ status: 200, description: "Product active status toggled." })
	toggleActive(@Param("id", ParseUUIDPipe) id: string) {
		return this.productsService.toggleActive(id);
	}

	@SellerOrAdmin()
	@Patch(":id/toggle-featured")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Toggle product featured status (Seller/Admin)" })
	@ApiResponse({ status: 200, description: "Product featured status toggled." })
	toggleFeatured(@Param("id", ParseUUIDPipe) id: string) {
		return this.productsService.toggleFeatured(id);
	}

	@SellerOrAdmin()
	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete product by ID (Seller/Admin)" })
	@ApiResponse({ status: 204, description: "Product deleted successfully." })
	remove(@Param("id", ParseUUIDPipe) id: string) {
		return this.productsService.remove(id);
	}

	// ========== Image Management Endpoints ==========

	@SellerOrAdmin()
	@Get(":id/images")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Get product images (Seller/Admin)" })
	@ApiResponse({ status: 200, description: "Return product images." })
	getImages(@Param("id", ParseUUIDPipe) id: string) {
		return this.productsService.getProductImages(id);
	}

	@SellerOrAdmin()
	@Post(":id/images")
	@HttpCode(HttpStatus.CREATED)
	@UseInterceptors(FilesInterceptor("photos", 10))
	@ApiOperation({ summary: "Add images to product (Seller/Admin)" })
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				photos: {
					type: "array",
					items: {
						type: "string",
						format: "binary",
					},
				},
			},
		},
	})
	@ApiResponse({ status: 201, description: "Images added successfully." })
	addImages(
		@Param("id", ParseUUIDPipe) id: string,
		@UploadedFiles() photos: Express.Multer.File[],
	) {
		return this.productsService.addProductImages(id, photos);
	}

	@SellerOrAdmin()
	@Patch(":id/images/reorder")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Reorder product images (Seller/Admin)" })
	@ApiBody({
		schema: {
			type: "object",
			properties: {
				imageOrders: {
					type: "array",
					items: {
						type: "object",
						properties: {
							id: { type: "string" },
							order: { type: "number" },
						},
					},
				},
			},
		},
	})
	@ApiResponse({ status: 200, description: "Images reordered successfully." })
	reorderImages(
		@Param("id", ParseUUIDPipe) id: string,
		@Body("imageOrders") imageOrders: ImageOrderDto[],
	) {
		return this.productsService.reorderProductImages(id, imageOrders);
	}

	@SellerOrAdmin()
	@Delete(":id/images/:imageId")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete product image (Seller/Admin)" })
	@ApiResponse({ status: 204, description: "Image deleted successfully." })
	deleteImage(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("imageId", ParseUUIDPipe) imageId: string,
	) {
		return this.productsService.deleteProductImage(id, imageId);
	}
}
