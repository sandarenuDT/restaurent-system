-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'WAITER', 'KITCHEN');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('EMPTY', 'OCCUPIED', 'WAITING', 'BILL_REQUESTED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'BILLED');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'SERVED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'ONLINE');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantTable" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "TableStatus" NOT NULL DEFAULT 'EMPTY',
    "qrCode" TEXT NOT NULL,
    "qrCodeUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RestaurantTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "waiterId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "waiterId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "specialInstructions" TEXT,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod",
    "status" "BillStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantTable_number_key" ON "RestaurantTable"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_orderId_key" ON "Bill"("orderId");

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RestaurantTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_waiterId_fkey" FOREIGN KEY ("waiterId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RestaurantTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_waiterId_fkey" FOREIGN KEY ("waiterId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
