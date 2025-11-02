// import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { Product } from "../products/entities/product.entity";
// import { CreateCartDto } from "./dto/create-cart.dto";
// import { AddItemToCartDto } from "./dto/items/add-item-cart.dto";
// import { UpdateCartItemDto } from "./dto/items/update-cart-item";
// import { CartItem } from "./entities/cart-item.entity";
// import { Cart } from "./entities/cart.entity";

// @Injectable()
// export class CartsService {
// 	constructor(
// 		@InjectRepository(Cart)
// 		private readonly cartRepository: Repository<Cart>,
// 		@InjectRepository(CartItem)
// 		private readonly cartItemRepository: Repository<CartItem>,
// 		@InjectRepository(Product)
// 		private readonly productRepository: Repository<Product>,
// 	) {}

// 	async create(createCartDto: CreateCartDto): Promise<Cart> {
// 		const cart = this.cartRepository.create(createCartDto);
// 		return await this.cartRepository.save(cart);
// 	}

// 	async findAll(): Promise<Cart[]> {
// 		return await this.cartRepository.find({
// 			where: { active: true },
// 			order: { updatedAt: "DESC" },
// 		});
// 	}

// 	async findOne(id: string): Promise<Cart> {
// 		const cart = await this.cartRepository.findOne({
// 			where: { id },
// 			relations: ["items", "items.product"],
// 		});

// 		if (!cart) {
// 			throw new NotFoundException(`Carrito con ID ${id} no encontrado`);
// 		}

// 		return cart;
// 	}

// 	// ⭐ CAMBIADO: userId → profileId
// 	async findByProfile(profileId: string): Promise<Cart | null> {
// 		return await this.cartRepository.findOne({
// 			where: { profileId, active: true },
// 			relations: ["items", "items.product"],
// 		});
// 	}

// 	async findBySession(sessionId: string): Promise<Cart | null> {
// 		return await this.cartRepository.findOne({
// 			where: { sessionId, active: true },
// 			relations: ["items", "items.product"],
// 		});
// 	}

// 	// ⭐ CAMBIADO: userId → profileId
// 	async getOrCreateCart(profileId?: string, sessionId?: string): Promise<Cart> {
// 		let cart: Cart | null = null;

// 		if (profileId) {
// 			cart = await this.findByProfile(profileId);
// 		} else if (sessionId) {
// 			cart = await this.findBySession(sessionId);
// 		}

// 		if (!cart) {
// 			cart = await this.create({ profileId, sessionId });
// 		}

// 		return cart;
// 	}

// 	async addItem(cartId: string, addItemDto: AddItemToCartDto): Promise<Cart> {
// 		const cart = await this.findOne(cartId);
// 		const product = await this.productRepository.findOne({
// 			where: { id: addItemDto.productId },
// 		});

// 		if (!product) {
// 			throw new NotFoundException(`Producto con ID ${addItemDto.productId} no encontrado`);
// 		}

// 		if (!product.active) {
// 			throw new BadRequestException(`El producto "${product.title}" no está disponible`);
// 		}

// 		if (product.stock < addItemDto.quantity) {
// 			throw new BadRequestException(`Stock insuficiente. Disponible: ${product.stock}`);
// 		}

// 		// Verificar si el producto ya está en el carrito
// 		const existingItem = cart.items.find((item) => item.productId === addItemDto.productId);

// 		if (existingItem) {
// 			// Actualizar cantidad
// 			existingItem.quantity += addItemDto.quantity;
// 			existingItem.subtotal = existingItem.quantity * existingItem.price;
// 			await this.cartItemRepository.save(existingItem);
// 		} else {
// 			// Agregar nuevo item
// 			const cartItem = this.cartItemRepository.create({
// 				cart,
// 				productId: product.id,
// 				quantity: addItemDto.quantity,
// 				price: product.price,
// 				subtotal: product.price * addItemDto.quantity,
// 			});
// 			await this.cartItemRepository.save(cartItem);
// 		}

// 		return await this.recalculateCart(cartId);
// 	}

// 	async updateItem(cartId: string, itemId: string, updateDto: UpdateCartItemDto): Promise<Cart> {
// 		const cart = await this.findOne(cartId);
// 		const cartItem = cart.items.find((item) => item.id === itemId);

// 		if (!cartItem) {
// 			throw new NotFoundException(`Item con ID ${itemId} no encontrado en el carrito`);
// 		}

// 		const product = await this.productRepository.findOne({
// 			where: { id: cartItem.productId },
// 		});

// 		if (!product) {
// 			throw new NotFoundException(`Producto asociado no encontrado`);
// 		}

// 		if (product.stock < updateDto.quantity) {
// 			throw new BadRequestException(`Stock insuficiente. Disponible: ${product.stock}`);
// 		}

// 		cartItem.quantity = updateDto.quantity;
// 		cartItem.subtotal = cartItem.price * updateDto.quantity;
// 		await this.cartItemRepository.save(cartItem);

// 		return await this.recalculateCart(cartId);
// 	}

// 	async removeItem(cartId: string, itemId: string): Promise<Cart> {
// 		const cart = await this.findOne(cartId);
// 		const cartItem = cart.items.find((item) => item.id === itemId);

// 		if (!cartItem) {
// 			throw new NotFoundException(`Item con ID ${itemId} no encontrado en el carrito`);
// 		}

// 		await this.cartItemRepository.remove(cartItem);
// 		return await this.recalculateCart(cartId);
// 	}

// 	async clearCart(cartId: string): Promise<Cart> {
// 		const cart = await this.findOne(cartId);

// 		if (cart.items.length > 0) {
// 			await this.cartItemRepository.remove(cart.items);
// 		}

// 		return await this.recalculateCart(cartId);
// 	}

// 	async remove(id: string): Promise<void> {
// 		const cart = await this.findOne(id);
// 		await this.cartRepository.remove(cart);
// 	}

// 	async mergeGuestCart(guestSessionId: string, profileId: string): Promise<Cart> {
// 		const guestCart = await this.findBySession(guestSessionId);
// 		if (!guestCart || guestCart.items.length === 0) {
// 			return await this.getOrCreateCart(profileId);
// 		}

// 		const userCart = await this.findByProfile(profileId);
// 		if (!userCart) {
// 			// Convertir carrito de invitado a carrito de usuario
// 			guestCart.profileId = profileId;
// 			return await this.cartRepository.save(guestCart);
// 		}

// 		// Fusionar items del carrito de invitado al carrito del usuario
// 		for (const guestItem of guestCart.items) {
// 			const existingItem = userCart.items.find((item) => item.productId === guestItem.productId);

// 			if (existingItem) {
// 				existingItem.quantity += guestItem.quantity;
// 				existingItem.subtotal = existingItem.quantity * existingItem.price;
// 				await this.cartItemRepository.save(existingItem);
// 			} else {
// 				guestItem.cart = userCart;
// 				await this.cartItemRepository.save(guestItem);
// 			}
// 		}

// 		// Eliminar carrito de invitado
// 		await this.cartRepository.remove(guestCart);

// 		return await this.recalculateCart(userCart.id);
// 	}

// 	private async recalculateCart(cartId: string): Promise<Cart> {
// 		const cart = await this.findOne(cartId);

// 		cart.subtotal = cart.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
// 		cart.tax = Number((cart.subtotal * 0.21).toFixed(2)); // IVA 21%
// 		cart.shipping = 0; // Sin costo de envío
// 		cart.total = cart.subtotal + cart.tax;

// 		return await this.cartRepository.save(cart);
// 	}
// }
