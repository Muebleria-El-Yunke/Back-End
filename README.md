# 🪑 Mueblería El Yunke – API Backend

API desarrollada con **NestJS + TypeScript**, centrada en escalabilidad, seguridad y una arquitectura modular orientada al dominio.
Incluye autenticación JWT, manejo de imágenes con Cloudinary, control de inventario, carrito, órdenes, pagos y blog.

---

<div align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo"/>
  <h3>Backend desarrollado por <strong>Franco Bottaro</strong></h3>
</div>

---

## 🚀 Tecnologías principales

* **NestJS 11** (arquitectura modular avanzada)
* **TypeScript**
* **TypeORM + MySQL**
* **Docker + Docker Compose**
* **Cloudinary** para imágenes
* **JWT + Passport + Guards**
* **Zod** para validación estricta
* **Helmet + CSRF** para seguridad adicional
* **Swagger** para documentación
* **RxJS** para flujos asíncronos

---

## 📁 Arquitectura del proyecto

El proyecto sigue un enfoque **Domain-Driven / Feature-Based**, cada módulo encapsula DTOs, entidades, servicios y lógica de negocio.

```
src
├── business
│   ├── accounts          → Usuarios, perfiles y autenticación
│   ├── blog              → Artículos y posteos
│   ├── inventory         → Productos, carrito, pedidos y pagos
│   └── photos            → Cloudinary e imágenes
└── core
    ├── config            → Env, DB, cookies, multer, swagger, seguridad
    ├── constants
    ├── init              → Seeding automático (admin, productos)
    └── utils
```

✔ Separación real entre **dominio**, **infraestructura** y **configuración**
✔ Módulos limpios y desacoplados
✔ Swappable providers

---

## 📦 Instalación

```bash
yarn install
```

---

## 🛠 Scripts útiles

### Desarrollo

```bash
yarn start:dev
```

### Producción

```bash
yarn build
yarn start:prod
```

### Linter

```bash
yarn lint
```
---

## 🐳 Docker + Makefile

Este proyecto incluye un **Makefile** para manejar rápidamente la base de datos y el entorno.

### Crear la base de datos con Docker

```bash
make create-db
```

### Resetear por completo la DB + dist

```bash
# Solo para desarrollo para evitar el exceso de migraciones
make reset-db
```

---

## 🔐 Seguridad

El proyecto implementa:

* **Helmet** para proteger cabeceras
* **CSRF doble cookie**
* **JWT Access + Refresh Tokens**
* **Rate limiting + Throttler**
* **Validación fuerte con Zod + class-validator**

---

## 🖼 Manejo de Imágenes

Cloudinary se utiliza para:

* Subida segura
* Transformaciones
* URLs optimizadas
* Guardado en DB del resultado

---

## 📄 Documentación API

Swagger está disponible en entorno de desarrollo:

```
http://localhost:3000/api/docs
```

---

## 📜 Variables de Entorno

La app utiliza `@nestjs/config` y un validador de esquemas.

Variables recomendadas:

```
-------------------------------------
🔥 Server
-------------------------------------
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_jwt_secret
REFRESH_JWT=tu_refresh_secret
SECRET_COOKIE=tu_secret_cookie

# Admin inicial (se genera al iniciar la app)
PASSWORD_ADMIN=Admin123!
NAME_ADMIN=AdminUser
EMAIL_ADMIN=admin@example.com

-------------------------------------
 📸 Cloudinary
-------------------------------------
CLOUDINARY_API_KEY=123456789012345678
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxx
CLOUDINARY_NAME=muebleria-yunke

-------------------------------------
 🗄 Base de Datos
-------------------------------------
USERNAME_DB=root
PASSWORD_DB=Password123!
NAME_DB=yunke
PORT_DB=3306
HOST_DB=localhost

 -------------------------------------
 🌐 Frontend
 -------------------------------------
FRONTEND_URL=http://localhost:4200

```

---
## 🚀 Despliegue
El backend ya fue configurado para producción:

* Build:

  ```bash
  yarn build
  ```
* Ejecutar:

  ```bash
  yarn start:prod
  ```

Por su estructura modular y uso de providers, se puede desplegar fácilmente en:

* AWS (EC2, ECS, RDS)
* Railway
* Render
* DigitalOcean
* Docker Swarm / K8s

---

## 👤 Autor
**Franco Bottaro**
Desarrollador Full Stack – TypeScript.<br/>
📧 francoabottaro@gmail.com <br/>
📍 Buenos Aires, Argentina

---

## 📄 Licencia
Este proyecto está bajo licencia **privada**.

