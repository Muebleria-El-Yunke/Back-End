export enum OrderStatus {
	PENDING = "pending", // Orden creada, esperando pago
	PROCESSING = "processing", // Pago confirmado, procesando
	SHIPPED = "shipped", // Orden enviada
	DELIVERED = "delivered", // Orden entregada
	CANCELLED = "cancelled", // Orden cancelada
	REFUNDED = "refunded", // Orden reembolsada
}
