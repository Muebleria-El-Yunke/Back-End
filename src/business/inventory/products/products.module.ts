import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "business/photos/images/images.module";
import { EntitySchemaProduct } from "./entities/index.entity";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { ProductFactoryService } from "./helpers/product-factory.service";
import { ProductImagesManager } from "./helpers/product-images.manager";
import { ProductQueryBuilder } from "./helpers/product-query.builder";
import { ProductRelationsManager } from "./helpers/product-relations.manager";

@Module({
	imports: [TypeOrmModule.forFeature(EntitySchemaProduct), ImagesModule],
	controllers: [ProductsController],
	providers: [
		ProductsService,
		ProductFactoryService,
		ProductImagesManager,
		ProductQueryBuilder,
		ProductRelationsManager,
	],
})
export class ProductsModule {}
