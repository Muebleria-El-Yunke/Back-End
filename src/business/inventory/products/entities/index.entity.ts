import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { Dimension } from "./dimension.entity";
import { Product } from "./product.entity";
import { Tag } from "./tag.entity";

export const EntitySchemaProduct: EntityClassOrSchema[] = [Product, Tag, Dimension];

export { Tag, Dimension, Product };
