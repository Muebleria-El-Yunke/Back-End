import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WsException,
} from "@nestjs/websockets";
import { Logger, OnModuleDestroy } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { PREFIX } from "core/constants/prefix-url.constants";
import { LOCAL_FRONTEND_URL } from "core/config/envs/constants";

interface HealthCheckPayload {
	status: string;
	timestamp: string;
	connections: number;
}

interface PingPayload {
	timestamp?: string;
	[key: string]: unknown;
}

interface StatusResponse {
	status: string;
	uptime: number;
	memory: NodeJS.MemoryUsage;
	connections: number;
	timestamp: string;
}

interface ConnectionMetrics {
	totalConnections: number;
	totalDisconnections: number;
	totalPings: number;
	totalErrors: number;
	lastResetTime: Date;
}

@WebSocketGateway({
	namespace: `${PREFIX}/health`,
	cors: {
		origin: process.env.ALLOWED_ORIGINS?.split(",").filter(Boolean) || [LOCAL_FRONTEND_URL],
		credentials: true,
		methods: ["GET"],
	},
	transports: ["websocket", "polling"],
	pingTimeout: 60000,
	pingInterval: 25000,
})
export class HealthGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
	@WebSocketServer()
	server: Server;

	readonly #logger = new Logger(HealthGateway.name);
	readonly #connectedClients = new Set<string>();
	#healthCheckInterval?: NodeJS.Timeout;
	#metricsInterval?: NodeJS.Timeout;

	readonly #HEALTH_CHECK_INTERVAL = Number(process.env.HEALTH_CHECK_INTERVAL) || 30000;
	readonly #METRICS_REPORT_INTERVAL = Number(process.env.METRICS_REPORT_INTERVAL) || 300000;

	#metrics: ConnectionMetrics = {
		totalConnections: 0,
		totalDisconnections: 0,
		totalPings: 0,
		totalErrors: 0,
		lastResetTime: new Date(),
	};

	afterInit(_server: Server): void {
		this.#logger.log("🔌 WebSocket Health Gateway initialized");
		this.#startHealthCheck();
		this.#startMetricsReporting();
	}

	handleConnection(client: Socket): void {
		try {
			this.#connectedClients.add(client.id);
			this.#metrics.totalConnections++;

			client.emit("connected", {
				message: "Connected to Health Gateway",
				clientId: client.id,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			this.#metrics.totalErrors++;
			this.#logError("Connection error", error);
		}
	}

	handleDisconnect(client: Socket): void {
		this.#connectedClients.delete(client.id);
		this.#metrics.totalDisconnections++;
	}

	onModuleDestroy(): void {
		this.#stopHealthCheck();
		this.#stopMetricsReporting();
		this.#connectedClients.clear();
		this.#logger.log("🛑 Health Gateway destroyed");
	}

	@SubscribeMessage("ping")
	handlePing(_client: Socket, data: PingPayload): { event: string; data: object } {
		try {
			this.#metrics.totalPings++;
			return {
				event: "pong",
				data: {
					message: "pong",
					timestamp: new Date().toISOString(),
					receivedData: data,
				},
			};
		} catch (error) {
			this.#metrics.totalErrors++;
			this.#logError("Ping error", error);
			throw new WsException("Failed to process ping");
		}
	}

	@SubscribeMessage("get-status")
	handleGetStatus(_client: Socket): { event: string; data: StatusResponse } {
		try {
			return {
				event: "status",
				data: {
					status: "healthy",
					uptime: process.uptime(),
					memory: process.memoryUsage(),
					connections: this.#connectedClients.size,
					timestamp: new Date().toISOString(),
				},
			};
		} catch (error) {
			this.#metrics.totalErrors++;
			this.#logError("Status error", error);
			throw new WsException("Failed to retrieve status");
		}
	}

	broadcastHealthStatus(): void {
		try {
			const payload: HealthCheckPayload = {
				status: "ok",
				connections: this.#connectedClients.size,
				timestamp: new Date().toISOString(),
			};
			this.server.emit("health-update", payload);
		} catch (error) {
			this.#metrics.totalErrors++;
			this.#logError("Broadcast error", error);
		}
	}

	getMetrics(): ConnectionMetrics & { currentConnections: number } {
		return {
			...this.#metrics,
			currentConnections: this.#connectedClients.size,
		};
	}

	#startHealthCheck(): void {
		this.#healthCheckInterval = setInterval(() => {
			try {
				const payload: HealthCheckPayload = {
					status: "ok",
					timestamp: new Date().toISOString(),
					connections: this.#connectedClients.size,
				};
				this.server.emit("health-check", payload);
			} catch (error) {
				this.#metrics.totalErrors++;
				this.#logError("Health check failed", error);
			}
		}, this.#HEALTH_CHECK_INTERVAL);
	}

	#stopHealthCheck(): void {
		if (this.#healthCheckInterval) {
			clearInterval(this.#healthCheckInterval);
			this.#healthCheckInterval = undefined;
		}
	}

	#startMetricsReporting(): void {
		this.#metricsInterval = setInterval(() => {
			const uptimeMinutes = Math.floor(
				(Date.now() - this.#metrics.lastResetTime.getTime()) / 60000,
			);

			this.#logger.log(
				`📊 Metrics (last ${uptimeMinutes}m): ` +
					`Connections=${this.#metrics.totalConnections}, ` +
					`Disconnections=${this.#metrics.totalDisconnections}, ` +
					`Pings=${this.#metrics.totalPings}, ` +
					`Errors=${this.#metrics.totalErrors}, ` +
					`Active=${this.#connectedClients.size}`,
			);

			this.#resetMetrics();
		}, this.#METRICS_REPORT_INTERVAL);
	}

	#stopMetricsReporting(): void {
		if (this.#metricsInterval) {
			clearInterval(this.#metricsInterval);
			this.#metricsInterval = undefined;
		}
	}

	#resetMetrics(): void {
		this.#metrics.totalConnections = 0;
		this.#metrics.totalDisconnections = 0;
		this.#metrics.totalPings = 0;
		this.#metrics.totalErrors = 0;
		this.#metrics.lastResetTime = new Date();
	}

	#logError(message: string, error: unknown): void {
		const errorMessage = error instanceof Error ? error.message : String(error);
		const stack = error instanceof Error ? error.stack : undefined;
		this.#logger.error(`${message}: ${errorMessage}`, stack);
	}
}
