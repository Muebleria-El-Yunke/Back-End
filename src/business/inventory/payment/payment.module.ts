import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

@Module({
	imports: [TypeOrmModule.forFeature([PaymentModule])],
	controllers: [PaymentController],
	providers: [PaymentService],
})
export class PaymentModule {}
