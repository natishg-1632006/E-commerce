# Tech Product E-Commerce Microservices Backend

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)
![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-232F3E?style=for-the-badge&logo=amazonaws)
![REST API](https://img.shields.io/badge/API-REST%20Microservices-ff6b6b?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A scalable, production-ready backend for a tech product e-commerce platform built with Node.js, Express.js, AWS DynamoDB, and microservices architecture.

## 1. Project Overview

This project demonstrates a modern backend design where every core business capability is separated into its own independent service. Instead of building one large monolithic application, the platform is divided into specialized services for products, inventory, cart, orders, and payments.

### Why Microservices?

Microservices are used to make the platform:

- Easier to scale independently
- Simpler to maintain and debug
- Safer to evolve over time
- Better suited for future growth and team collaboration

### Benefits of This Architecture

- Independent deployment of each service
- Clear separation of business responsibilities
- Better fault isolation
- Easier integration with cloud services like AWS DynamoDB
- Great foundation for future API gateways, authentication, and event-driven systems

### Future Scalability

This architecture can grow into a large e-commerce platform by adding services such as authentication, user management, notifications, reviews, warehouse operations, and analytics.

---

## 2. Architecture Diagram

```text
                    Frontend (React / Next.js)

                           │
                           ▼

                    API Requests

                           │

────────────────────────────────────────────────────────────

      Product Service      :5001
              │
              ▼

     Inventory Service     :5005
              │
              ▼

        Cart Service       :5002
              │
              ▼

       Order Service       :5003
              │
              ▼

      Payment Service      :5004

────────────────────────────────────────────────────────────

                AWS DynamoDB
```

---

## 3. Technology Stack

### Backend

- Node.js
- Express.js
- REST APIs
- Axios for inter-service communication

### Database

- AWS DynamoDB
- DynamoDB Document Client
- AWS SDK v3

### Validation & Security

- Express Validator
- Helmet
- CORS

### Performance & Logging

- Compression
- Morgan
- dotenv

### Utilities

- UUID
- Environment-based configuration

---

## 4. Project Structure

```text
e-com_backend/
├── product-service/
├── inventory-service/
├── cart-service/
├── order-service/
├── payment-service/
└── README.md
```

### Service-Level Structure

Each service follows a clean layered structure:

```text
service-name/
├── server.js
├── package.json
├── src/
│   ├── app.js
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── validations/
│   ├── middleware/
│   └── utils/
```

This structure keeps the codebase organized using:

- MVC-style separation
- Service layer for business logic
- Route handlers for API endpoints
- Validation middleware
- Utility modules for AWS and inter-service calls

---

## 5. Microservices

### Product Service

- Port: 5001
- Purpose: Manages product catalog data.
- Responsibilities:
  - Create, read, update, and delete products
  - Search and filter products
  - Serve product information to other services
- Database Table: Products (configured via DynamoDB table environment variable)
- Features:
  - Product CRUD
  - Search and pagination
  - Category, brand, and price filtering
- REST APIs:
  - GET /api/products
  - GET /api/products/:id
  - GET /api/products/search
  - POST /api/products
  - PUT /api/products/:id
  - DELETE /api/products/:id
- Folder Structure:
  - controllers/productController.js
  - services/productService.js
  - routes/productRoutes.js
- Data Flow:
  - Admin creates a product
  - Product is stored in DynamoDB
  - Inventory and cart services can request product details

### Inventory Service

- Port: 5005
- Purpose: Manages stock and inventory operations.
- Responsibilities:
  - Track current stock
  - Reserve stock during checkout
  - Release stock on failure or refund
  - Report low-stock and out-of-stock items
- Database Table: Inventories (configured via DynamoDB table environment variable)
- Business Rules:
  - One inventory record per product
  - Stock cannot go negative
  - Reserve stock before payment confirmation
  - Reduce stock only after successful payment
- Stock Flow:
  - Initial stock is created
  - Stock can be increased or decreased
  - Orders reserve stock
  - Payment success reduces stock permanently
- REST APIs:
  - GET /api/inventory
  - GET /api/inventory/:productId
  - GET /api/inventory/low-stock
  - GET /api/inventory/check/:productId
  - POST /api/inventory
  - POST /api/inventory/increase
  - POST /api/inventory/decrease
  - POST /api/inventory/reserve
  - POST /api/inventory/release
  - PATCH /api/inventory/reduce-stock
  - PUT /api/inventory/:productId
  - DELETE /api/inventory/:productId
- Folder Structure:
  - services/inventoryService.js
  - utils/productApi.js
  - utils/createTables.js
- Communication:
  - Calls the Product Service to verify that a product exists before creating inventory

### Cart Service

- Port: 5002
- Purpose: Handles shopping cart behavior for users.
- Responsibilities:
  - Add items to cart
  - Update item quantities
  - Remove items
  - Clear cart
  - Retrieve cart contents
- REST APIs:
  - POST /api/cart/add
  - PUT /api/cart/update
  - DELETE /api/cart/remove/:userId/:productId
  - DELETE /api/cart/clear/:userId
  - GET /api/cart/:userId
- Communication:
  - Validates products from the Product Service
  - Checks stock availability using product data before adding items

### Order Service

- Port: 5003
- Purpose: Orchestrates order creation and order lifecycle management.
- Responsibilities:
  - Create orders from cart data
  - Validate stock before order confirmation
  - Track order status
  - Cancel orders
- REST APIs:
  - POST /api/orders
  - GET /api/orders
  - GET /api/orders/user/:userId
  - GET /api/orders/:id
  - PUT /api/orders/:id/status
  - PUT /api/orders/:id/cancel
- Communication:
  - Calls the Cart Service to retrieve cart details
  - Calls the Inventory Service to validate stock before placing orders

### Payment Service

- Port: 5004
- Purpose: Handles payment processing and payment lifecycle.
- Responsibilities:
  - Create payment records for an order
  - Update payment status
  - Confirm payment and reduce inventory
  - Release stock on failure or refund
- REST APIs:
  - POST /api/payment/create
  - GET /api/payment/order/:orderId
  - GET /api/payment/:id
  - PUT /api/payment/:id/status
- Communication:
  - Reads order information from the Order Service
  - Calls the Inventory Service to reduce or release stock

---

## 6. API Flow

```text
Admin creates Product
        ↓
Admin creates Inventory
        ↓
Customer views Products
        ↓
Customer adds Product to Cart
        ↓
Inventory Check
        ↓
Customer places Order
        ↓
Reserve Stock
        ↓
Payment
        ↓
Reduce Stock
        ↓
Order Completed
```

### End-to-End Flow

1. A product is created in the Product Service.
2. Inventory is registered for that product in the Inventory Service.
3. A customer browses products and adds items to the cart.
4. The Order Service validates stock and creates an order.
5. The Payment Service processes payment.
6. On successful payment, the Inventory Service reduces stock.
7. The order is marked complete and the transaction is recorded.

---

## 7. Database Design

The system uses AWS DynamoDB tables to store data independently per domain.

### Product Table

- Partition Key: productId
- Attributes:
  - productId
  - name
  - description
  - brand
  - category
  - price
  - images
  - specifications
  - createdAt
  - updatedAt

Example:

```json
{
  "productId": "prod-001",
  "name": "Laptop Pro 14",
  "brand": "TechBrand",
  "category": "Laptops",
  "price": 1299.99,
  "description": "High-performance laptop",
  "images": ["/images/laptop.png"],
  "specifications": {
    "processor": "Intel i7",
    "ram": "16GB"
  },
  "createdAt": "2026-06-29T10:00:00.000Z"
}
```

### Inventory Table

- Partition Key: Inventoryid
- Attributes:
  - Inventoryid
  - productId
  - currentStock
  - reservedStock
  - availableStock
  - lowStockThreshold
  - status
  - lastUpdated

Example:

```json
{
  "Inventoryid": "inv-001",
  "productId": "prod-001",
  "currentStock": 50,
  "reservedStock": 5,
  "availableStock": 45,
  "lowStockThreshold": 10,
  "status": "In Stock"
}
```

### Cart Table

- Partition Key: cartid
- Attributes:
  - cartid
  - userId
  - items
  - totalAmount

Example:

```json
{
  "cartid": "cart-001",
  "userId": "user-123",
  "items": [
    {
      "productId": "prod-001",
      "name": "Laptop Pro 14",
      "price": 1299.99,
      "quantity": 1,
      "subtotal": 1299.99
    }
  ],
  "totalAmount": 1299.99
}
```

### Order Table

- Partition Key: orderid
- Attributes:
  - orderid
  - userId
  - items
  - shippingAddress
  - paymentMethod
  - paymentStatus
  - orderStatus
  - inventoryUpdated
  - totalAmount
  - createdAt

Example:

```json
{
  "orderid": "order-001",
  "userId": "user-123",
  "items": [
    {
      "productId": "prod-001",
      "name": "Laptop Pro 14",
      "price": 1299.99,
      "quantity": 1,
      "subtotal": 1299.99
    }
  ],
  "paymentStatus": "Pending",
  "orderStatus": "Pending",
  "inventoryUpdated": false,
  "totalAmount": 1299.99
}
```

### Payment Table

- Partition Key: paymentid
- Attributes:
  - paymentid
  - orderId
  - userId
  - amount
  - paymentMethod
  - transactionId
  - status
  - createdAt

Example:

```json
{
  "paymentid": "pay-001",
  "orderId": "order-001",
  "userId": "user-123",
  "amount": 1299.99,
  "paymentMethod": "COD",
  "transactionId": "COD-ABC123",
  "status": "Pending"
}
```

---

## 8. REST API Documentation

Base URL for each service is typically:

- Product Service: http://localhost:5001
- Cart Service: http://localhost:5002
- Order Service: http://localhost:5003
- Payment Service: http://localhost:5004
- Inventory Service: http://localhost:5005

### Product APIs

#### POST /api/products

Create a new product.

Request body:

```json
{
  "name": "Laptop Pro 14",
  "description": "High-performance laptop",
  "brand": "TechBrand",
  "category": "Laptops",
  "price": 1299.99
}
```

Response:

```json
{
  "success": true,
  "data": {
    "productId": "prod-001",
    "message": "Product created successfully"
  }
}
```

#### GET /api/products

Get all products with optional query filters.

#### GET /api/products/:id

Get a single product by ID.

#### GET /api/products/search

Search products by keyword.

#### PUT /api/products/:id

Update an existing product.

#### DELETE /api/products/:id

Delete a product by ID.

### Inventory APIs

#### POST /api/inventory

Create inventory for a product.

Request body:

```json
{
  "productId": "prod-001",
  "currentStock": 50,
  "lowStockThreshold": 10
}
```

#### GET /api/inventory

Get all inventory records.

#### GET /api/inventory/:productId

Get inventory for a specific product.

#### GET /api/inventory/check/:productId

Check if stock is available for a requested quantity.

#### POST /api/inventory/increase

Increase stock.

#### POST /api/inventory/decrease

Decrease stock.

#### POST /api/inventory/reserve

Reserve stock for an order.

#### POST /api/inventory/release

Release reserved stock.

#### PATCH /api/inventory/reduce-stock

Reduce stock after successful payment.

### Cart APIs

#### POST /api/cart/add

Add an item to the cart.

Request body:

```json
{
  "userId": "user-123",
  "productId": "prod-001",
  "quantity": 1
}
```

#### PUT /api/cart/update

Update quantity of an item in the cart.

#### DELETE /api/cart/remove/:userId/:productId

Remove one item from the cart.

#### DELETE /api/cart/clear/:userId

Clear the user's cart.

#### GET /api/cart/:userId

Retrieve the cart for a specific user.

### Order APIs

#### POST /api/orders

Create a new order from the cart.

Request body:

```json
{
  "userId": "user-123",
  "shippingAddress": "123 Tech Street",
  "paymentMethod": "COD"
}
```

#### GET /api/orders

Get all orders.

#### GET /api/orders/user/:userId

Get orders for a specific user.

#### GET /api/orders/:id

Get a single order by ID.

#### PUT /api/orders/:id/status

Update the order status.

#### PUT /api/orders/:id/cancel

Cancel an existing order.

### Payment APIs

#### POST /api/payment/create

Create a payment for an order.

Request body:

```json
{
  "orderId": "order-001",
  "userId": "user-123",
  "paymentMethod": "COD"
}
```

#### GET /api/payment/order/:orderId

Get payment by order ID.

#### GET /api/payment/:id

Get payment by payment ID.

#### PUT /api/payment/:id/status

Update payment status.

---

## 9. Installation

### Clone the Repository

```bash
git clone <your-repository-url>
cd e-com_backend
```

### Install Dependencies

Run the following inside each service folder:

```bash
cd product-service && npm install
cd ../inventory-service && npm install
cd ../cart-service && npm install
cd ../order-service && npm install
cd ../payment-service && npm install
```

### Configure Environment Variables

Create a `.env` file in each service folder.

### Run the Services

```bash
cd product-service && npm run dev
cd ../inventory-service && npm run dev
cd ../cart-service && npm run dev
cd ../order-service && npm run dev
cd ../payment-service && npm run dev
```

---

## 10. Environment Variables

Example `.env` for each service:

```env
# Common AWS config
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Product Service
DYNAMODB_TABLE_NAME=Products
PORT=5001

# Inventory Service
DYNAMODB_TABLE_NAME=Inventories
DYNAMODB_MOVEMENTS_TABLE_NAME=InventoryMovements
PRODUCT_SERVICE_URL=http://localhost:5001
PORT=5005

# Cart Service
DYNAMODB_TABLE_NAME=Carts
PRODUCTS_TABLE_NAME=Products
PORT=5002

# Order Service
DYNAMODB_TABLE_NAME=Orders
CART_TABLE_NAME=Carts
PRODUCTS_TABLE_NAME=Products
INVENTORY_SERVICE_URL=http://localhost:5005
PORT=5003

# Payment Service
DYNAMODB_TABLE_NAME=Payments
ORDERS_TABLE_NAME=Orders
INVENTORY_SERVICE_URL=http://localhost:5005
PORT=5004
```

### Variable Explanation

- AWS_REGION: AWS region for DynamoDB
- AWS_ACCESS_KEY_ID: AWS access key
- AWS_SECRET_ACCESS_KEY: AWS secret key
- DYNAMODB_TABLE_NAME: Main table for each service
- DYNAMODB_MOVEMENTS_TABLE_NAME: Table for inventory movements
- PRODUCT_SERVICE_URL: Base URL for the Product Service
- INVENTORY_SERVICE_URL: Base URL for the Inventory Service
- PRODUCTS_TABLE_NAME: Product table name used by dependent services
- CART_TABLE_NAME: Cart table name used by Order Service
- ORDERS_TABLE_NAME: Orders table used by Payment Service

---

## 11. Features

✔ Product Management

✔ Inventory Management

✔ Cart Management

✔ Order Management

✔ Payment Management

✔ RESTful Microservices

✔ AWS DynamoDB Integration

✔ Inter-Service Communication with Axios

✔ Clean Architecture and MVC-style structure

✔ Service Layer Pattern

✔ Validation and Error Handling

✔ Scalable architecture for future growth

---

## 12. Future Enhancements

This project is a strong foundation for a much larger e-commerce platform. Planned enhancements include:

- JWT Authentication
- User Service
- Admin Service
- Notification Service
- Warehouse Service
- Review Service
- Wishlist Service
- Coupon Service
- API Gateway
- Dockerization
- Kubernetes deployment
- CI/CD pipeline
- AWS ECS / EKS
- Redis caching
- Elasticsearch search

---

## 13. Screenshots Section

### Architecture Diagram

- Placeholder: Add architecture image here.

### API Testing

- Placeholder: Add Postman or Insomnia screenshot here.

### AWS DynamoDB

- Placeholder: Add DynamoDB table screenshots here.

### Postman Collection

- Placeholder: Add Postman collection export here.

### Project Structure

- Placeholder: Add folder tree screenshot here.

---

## 14. License

This project is licensed under the MIT License.

---

## 15. Author

Name: Your Name

GitHub: https://github.com/your-username

LinkedIn: https://linkedin.com/in/your-profile

Portfolio: https://your-portfolio.com

---

## Contributing

Contributions are welcome. Feel free to open issues, suggest improvements, or submit pull requests.

## Contact

If you want to discuss this project or collaborate, feel free to reach out through GitHub or LinkedIn.
