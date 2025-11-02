import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "business/photos/images/images.module";
import { EntitySchemaProduct } from "./entities/index.entity";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
	imports: [TypeOrmModule.forFeature(EntitySchemaProduct), ImagesModule],
	controllers: [ProductsController],
	providers: [ProductsService],
})
export class ProductsModule {}
