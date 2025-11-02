// import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { CartsService } from "../carts/carts.service";
// import { Product } from "../products/entities/product.entity";
// import { CreateOrderDto } from "./dto/create-order.dto";
// import { UpdateOrderDto } from "./dto/update-order.dto";
// import { OrderItem } from "./entities/order-item.entity";
// import { Order } from "./entities/order.entity";
// import { OrderStatus } from "./enum/order-status";

// @Injectable()
// export class OrdersService {
// 	constructor(
// 		@InjectRepository(Order)
// 		private readonly orderRepository: Repository<Order>,
// 		@InjectRepository(OrderItem)
// 		private readonly orderItemRepository: Repository<OrderItem>,
// 		@InjectRepository(Product)
// 		private readonly productRepository: Repository<Product>,
// 		private readonly cartsService: CartsService,
// 	) {}

// 	/**
// 	 * Crea una orden desde un carrito
// 	 */
// 	async create(profileId: string, createOrderDto: CreateOrderDto): Promise<Order> {
// 		const { cartId, ...shippingInfo } = createOrderDto;

// 		// Obtener el carrito con sus items
// 		const cart = await this.cartsService.findOne(cartId);

// 		if (!cart || cart.items.length === 0) {
// 			throw new BadRequestException("El carrito está vacío");
// 		}

// 		// Verificar que el carrito pertenece al usuario
// 		if (cart.profileId !== profileId) {
// 			throw new BadRequestException("El carrito no pertenece a este usuario");
// 		}

// 		// Verificar stock de todos los productos antes de crear la orden
// 		for (const item of cart.items) {
// 			const product = await this.productRepository.findOne({
// 				where: { id: item.productId },
// 			});

// 			if (!product) {
// 				throw new NotFoundException(`Producto ${item.productId} no encontrado`);
// 			}

// 			if (!product.active) {
// 				throw new BadRequestException(`El producto "${product.title}" ya no está disponible`);
// 			}

// 			if (product.stock < item.quantity) {
// 				throw new BadRequestException(
// 					`Stock insuficiente para "${product.title}". Disponible: ${product.stock}`,
// 				);
// 			}
// 		}

// 		// Generar número de orden único
// 		const orderNumber = await this.generateOrderNumber();

// 		// Crear la orden
// 		const order = this.orderRepository.create({
// 			orderNumber,
// 			profileId,
// 			status: OrderStatus.PENDING,
// 			subtotal: cart.subtotal,
// 			tax: cart.tax,
// 			shipping: cart.shipping,
// 			total: cart.total,
// 			...shippingInfo,
// 		});

// 		const savedOrder = await this.orderRepository.save(order);

// 		// Crear los items de la orden (copia del carrito)
// 		const orderItems = cart.items.map((cartItem) => {
// 			return this.orderItemRepository.create({
// 				orderId: savedOrder.id,
// 				productId: cartItem.productId,
// 				productTitle: cartItem.product.title,
// 				quantity: cartItem.quantity,
// 				price: cartItem.price,
// 				subtotal: cartItem.subtotal,
// 			});
// 		});

// 		await this.orderItemRepository.save(orderItems);

// 		// Reducir stock de productos
// 		for (const item of cart.items) {
// 			await this.productRepository.decrement({ id: item.productId }, "stock", item.quantity);
// 		}

// 		// Vaciar el carrito
// 		await this.cartsService.clearCart(cartId);

// 		// Retornar orden completa con items
// 		return await this.findOne(savedOrder.id);
// 	}

// 	/**
// 	 * Encuentra todas las órdenes
// 	 */
// 	async findAll(): Promise<Order[]> {
// 		return await this.orderRepository.find({
// 			order: { createdAt: "DESC" },
// 		});
// 	}

// 	/**
// 	 * Encuentra órdenes por usuario
// 	 */
// 	async findByProfile(profileId: string): Promise<Order[]> {
// 		return await this.orderRepository.find({
// 			where: { profileId },
// 			order: { createdAt: "DESC" },
// 		});
// 	}

// 	/**
// 	 * Encuentra una orden por ID
// 	 */
// 	async findOne(id: string): Promise<Order> {
// 		const order = await this.orderRepository.findOne({
// 			where: { id },
// 			relations: ["items", "items.product", "payment"],
// 		});

// 		if (!order) {
// 			throw new NotFoundException(`Orden con ID ${id} no encontrada`);
// 		}

// 		return order;
// 	}

// 	/**
// 	 * Encuentra una orden por número de orden
// 	 */
// 	async findByOrderNumber(orderNumber: string): Promise<Order> {
// 		const order = await this.orderRepository.findOne({
// 			where: { orderNumber },
// 			relations: ["items", "items.product", "payment"],
// 		});

// 		if (!order) {
// 			throw new NotFoundException(`Orden con número ${orderNumber} no encontrada`);
// 		}

// 		return order;
// 	}

// 	/**
// 	 * Actualiza el estado de una orden
// 	 */
// 	async updateStatus(id: string, status: OrderStatus): Promise<Order> {
// 		const order = await this.findOne(id);

// 		order.status = status;
// 		await this.orderRepository.save(order);

// 		return order;
// 	}

// 	/**
// 	 * Actualiza información de la orden
// 	 */
// 	async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
// 		const order = await this.findOne(id);

// 		Object.assign(order, updateOrderDto);
// 		await this.orderRepository.save(order);

// 		return order;
// 	}

// 	/**
// 	 * Cancela una orden (solo si está pendiente o procesando)
// 	 */
// 	async cancel(id: string): Promise<Order> {
// 		const order = await this.findOne(id);

// 		if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
// 			throw new BadRequestException("Solo se pueden cancelar órdenes pendientes o en proceso");
// 		}

// 		// Devolver stock
// 		for (const item of order.items) {
// 			await this.productRepository.increment({ id: item.productId }, "stock", item.quantity);
// 		}

// 		order.status = OrderStatus.CANCELLED;
// 		await this.orderRepository.save(order);

// 		return order;
// 	}

// 	/**
// 	 * Elimina una orden (soft delete podría ser mejor)
// 	 */
// 	async remove(id: string): Promise<void> {
// 		const order = await this.findOne(id);
// 		await this.orderRepository.remove(order);
// 	}

// 	/**
// 	 * Genera un número de orden único
// 	 */
// 	private async generateOrderNumber(): Promise<string> {
// 		const year = new Date().getFullYear();
// 		const count = await this.orderRepository.count();
// 		const orderNumber = `ORD-${year}-${String(count + 1).padStart(6, "0")}`;

// 		// Verificar que no exista (por si acaso)
// 		const exists = await this.orderRepository.findOne({
// 			where: { orderNumber },
// 		});

// 		if (exists) {
// 			// Recursivo en caso de colisión (muy improbable)
// 			return this.generateOrderNumber();
// 		}

// 		return orderNumber;
// 	}
// }
