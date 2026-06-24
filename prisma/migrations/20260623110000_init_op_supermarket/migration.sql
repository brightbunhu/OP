CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'DELETED');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK');
CREATE TYPE "InventoryStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED');
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'CONVERTED', 'EXPIRED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING');
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'READ', 'FAILED', 'CANCELLED');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT', 'DAMAGE', 'EXPIRED');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'ROLE_ASSIGN', 'PERMISSION_DENIED', 'EXPORT');
CREATE TYPE "AIConversationStatus" AS ENUM ('OPEN', 'RESOLVED', 'ESCALATED', 'ARCHIVED');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(320) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "password_hash" VARCHAR(255),
  "phone" VARCHAR(32),
  "image" VARCHAR(2048),
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "email_verified" TIMESTAMPTZ(6),
  "last_login_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(64) NOT NULL,
  "description" VARCHAR(255),
  "permissions" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(120) NOT NULL,
  "slug" VARCHAR(160) NOT NULL,
  "description" TEXT,
  "image_url" VARCHAR(2048),
  "parent_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "suppliers" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(180) NOT NULL,
  "contact_name" VARCHAR(160),
  "email" VARCHAR(320),
  "phone" VARCHAR(32),
  "address_line_1" VARCHAR(180),
  "address_line_2" VARCHAR(180),
  "city" VARCHAR(100),
  "country" VARCHAR(100),
  "tax_id" VARCHAR(80),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "category_id" UUID NOT NULL,
  "supplier_id" UUID,
  "name" VARCHAR(180) NOT NULL,
  "slug" VARCHAR(220) NOT NULL,
  "sku" VARCHAR(80) NOT NULL,
  "barcode" VARCHAR(80),
  "description" TEXT,
  "image_url" VARCHAR(2048),
  "price" DECIMAL(12,2) NOT NULL,
  "compare_at_price" DECIMAL(12,2),
  "cost_price" DECIMAL(12,2),
  "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "weight_grams" INTEGER,
  "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
  "is_featured" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inventories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL,
  "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
  "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
  "reorder_level" INTEGER NOT NULL DEFAULT 10,
  "reorder_quantity" INTEGER NOT NULL DEFAULT 50,
  "warehouse_location" VARCHAR(120),
  "status" "InventoryStatus" NOT NULL DEFAULT 'IN_STOCK',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "carts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',
  "currency" CHAR(3) NOT NULL DEFAULT 'USD',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cart_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "cart_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" DECIMAL(12,2) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "order_number" VARCHAR(40) NOT NULL,
  "user_id" UUID NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "fulfillment_status" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
  "currency" CHAR(3) NOT NULL DEFAULT 'USD',
  "subtotal" DECIMAL(12,2) NOT NULL,
  "discount_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "tax_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "shipping_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "grand_total" DECIMAL(12,2) NOT NULL,
  "shipping_address" JSONB NOT NULL,
  "billing_address" JSONB,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "product_name" VARCHAR(180) NOT NULL,
  "sku" VARCHAR(80) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" DECIMAL(12,2) NOT NULL,
  "discount_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "tax_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "line_total" DECIMAL(12,2) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "promotions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(160) NOT NULL,
  "code" VARCHAR(64),
  "description" TEXT,
  "type" "PromotionType" NOT NULL,
  "value" DECIMAL(12,2) NOT NULL,
  "starts_at" TIMESTAMPTZ(6) NOT NULL,
  "ends_at" TIMESTAMPTZ(6) NOT NULL,
  "usage_limit" INTEGER,
  "usage_count" INTEGER NOT NULL DEFAULT 0,
  "minimum_spend" DECIMAL(12,2),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "title" VARCHAR(180) NOT NULL,
  "body" TEXT NOT NULL,
  "metadata" JSONB,
  "sent_at" TIMESTAMPTZ(6),
  "read_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_reviews" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "rating" INTEGER NOT NULL,
  "title" VARCHAR(160),
  "body" TEXT,
  "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "customer_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stock_movements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL,
  "inventory_id" UUID NOT NULL,
  "supplier_id" UUID,
  "type" "StockMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_cost" DECIMAL(12,2),
  "reference" VARCHAR(120),
  "reason" VARCHAR(255),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_conversations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "status" "AIConversationStatus" NOT NULL DEFAULT 'OPEN',
  "provider" VARCHAR(80) NOT NULL DEFAULT 'openrouter',
  "model" VARCHAR(120) NOT NULL,
  "title" VARCHAR(180),
  "messages" JSONB NOT NULL,
  "summary" TEXT,
  "prompt_tokens" INTEGER,
  "completion_tokens" INTEGER,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor_id" UUID,
  "action" "AuditAction" NOT NULL,
  "entity_name" VARCHAR(120) NOT NULL,
  "entity_id" UUID,
  "old_values" JSONB,
  "new_values" JSONB,
  "ip_address" INET,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "deleted_at" TIMESTAMPTZ(6),
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "_RoleToUser" (
  "A" UUID NOT NULL,
  "B" UUID NOT NULL
);

CREATE TABLE "_CategoryToPromotion" (
  "A" UUID NOT NULL,
  "B" UUID NOT NULL
);

CREATE TABLE "_ProductToPromotion" (
  "A" UUID NOT NULL,
  "B" UUID NOT NULL
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE INDEX "roles_deleted_at_idx" ON "roles"("deleted_at");

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");
CREATE INDEX "categories_deleted_at_idx" ON "categories"("deleted_at");

CREATE UNIQUE INDEX "suppliers_name_email_key" ON "suppliers"("name", "email");
CREATE INDEX "suppliers_deleted_at_idx" ON "suppliers"("deleted_at");

CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");
CREATE INDEX "products_category_id_status_idx" ON "products"("category_id", "status");
CREATE INDEX "products_supplier_id_idx" ON "products"("supplier_id");
CREATE INDEX "products_status_deleted_at_idx" ON "products"("status", "deleted_at");
CREATE INDEX "products_is_featured_idx" ON "products"("is_featured");

CREATE UNIQUE INDEX "inventories_product_id_key" ON "inventories"("product_id");
CREATE INDEX "inventories_status_idx" ON "inventories"("status");
CREATE INDEX "inventories_deleted_at_idx" ON "inventories"("deleted_at");

CREATE INDEX "carts_user_id_status_idx" ON "carts"("user_id", "status");
CREATE INDEX "carts_deleted_at_idx" ON "carts"("deleted_at");

CREATE UNIQUE INDEX "cart_items_cart_id_product_id_key" ON "cart_items"("cart_id", "product_id");
CREATE INDEX "cart_items_product_id_idx" ON "cart_items"("product_id");
CREATE INDEX "cart_items_deleted_at_idx" ON "cart_items"("deleted_at");

CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");
CREATE INDEX "orders_status_payment_status_idx" ON "orders"("status", "payment_status");
CREATE INDEX "orders_deleted_at_idx" ON "orders"("deleted_at");

CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");
CREATE INDEX "order_items_deleted_at_idx" ON "order_items"("deleted_at");

CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");
CREATE INDEX "promotions_is_active_starts_at_ends_at_idx" ON "promotions"("is_active", "starts_at", "ends_at");
CREATE INDEX "promotions_deleted_at_idx" ON "promotions"("deleted_at");

CREATE INDEX "notifications_user_id_status_idx" ON "notifications"("user_id", "status");
CREATE INDEX "notifications_channel_status_idx" ON "notifications"("channel", "status");
CREATE INDEX "notifications_deleted_at_idx" ON "notifications"("deleted_at");

CREATE UNIQUE INDEX "customer_reviews_user_id_product_id_key" ON "customer_reviews"("user_id", "product_id");
CREATE INDEX "customer_reviews_product_id_status_idx" ON "customer_reviews"("product_id", "status");
CREATE INDEX "customer_reviews_rating_idx" ON "customer_reviews"("rating");
CREATE INDEX "customer_reviews_deleted_at_idx" ON "customer_reviews"("deleted_at");

CREATE INDEX "stock_movements_product_id_created_at_idx" ON "stock_movements"("product_id", "created_at");
CREATE INDEX "stock_movements_inventory_id_idx" ON "stock_movements"("inventory_id");
CREATE INDEX "stock_movements_supplier_id_idx" ON "stock_movements"("supplier_id");
CREATE INDEX "stock_movements_type_idx" ON "stock_movements"("type");
CREATE INDEX "stock_movements_deleted_at_idx" ON "stock_movements"("deleted_at");

CREATE INDEX "ai_conversations_user_id_status_idx" ON "ai_conversations"("user_id", "status");
CREATE INDEX "ai_conversations_provider_model_idx" ON "ai_conversations"("provider", "model");
CREATE INDEX "ai_conversations_deleted_at_idx" ON "ai_conversations"("deleted_at");

CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");
CREATE INDEX "audit_logs_entity_name_entity_id_idx" ON "audit_logs"("entity_name", "entity_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_deleted_at_idx" ON "audit_logs"("deleted_at");

CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");
CREATE UNIQUE INDEX "_CategoryToPromotion_AB_unique" ON "_CategoryToPromotion"("A", "B");
CREATE INDEX "_CategoryToPromotion_B_index" ON "_CategoryToPromotion"("B");
CREATE UNIQUE INDEX "_ProductToPromotion_AB_unique" ON "_ProductToPromotion"("A", "B");
CREATE INDEX "_ProductToPromotion_B_index" ON "_ProductToPromotion"("B");

ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoryToPromotion" ADD CONSTRAINT "_CategoryToPromotion_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoryToPromotion" ADD CONSTRAINT "_CategoryToPromotion_B_fkey" FOREIGN KEY ("B") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ProductToPromotion" ADD CONSTRAINT "_ProductToPromotion_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ProductToPromotion" ADD CONSTRAINT "_ProductToPromotion_B_fkey" FOREIGN KEY ("B") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "products" ADD CONSTRAINT "products_price_non_negative_chk" CHECK ("price" >= 0);
ALTER TABLE "products" ADD CONSTRAINT "products_compare_at_price_non_negative_chk" CHECK ("compare_at_price" IS NULL OR "compare_at_price" >= 0);
ALTER TABLE "products" ADD CONSTRAINT "products_cost_price_non_negative_chk" CHECK ("cost_price" IS NULL OR "cost_price" >= 0);
ALTER TABLE "products" ADD CONSTRAINT "products_tax_rate_valid_chk" CHECK ("tax_rate" >= 0 AND "tax_rate" <= 100);
ALTER TABLE "products" ADD CONSTRAINT "products_weight_positive_chk" CHECK ("weight_grams" IS NULL OR "weight_grams" > 0);
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_quantities_non_negative_chk" CHECK ("quantity_on_hand" >= 0 AND "quantity_reserved" >= 0 AND "reorder_level" >= 0 AND "reorder_quantity" >= 0);
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_quantity_positive_chk" CHECK ("quantity" > 0);
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_unit_price_non_negative_chk" CHECK ("unit_price" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_totals_non_negative_chk" CHECK ("subtotal" >= 0 AND "discount_total" >= 0 AND "tax_total" >= 0 AND "shipping_total" >= 0 AND "grand_total" >= 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_values_valid_chk" CHECK ("quantity" > 0 AND "unit_price" >= 0 AND "discount_total" >= 0 AND "tax_total" >= 0 AND "line_total" >= 0);
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_dates_valid_chk" CHECK ("ends_at" > "starts_at");
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_usage_valid_chk" CHECK ("usage_limit" IS NULL OR "usage_limit" >= 0);
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_count_valid_chk" CHECK ("usage_count" >= 0);
ALTER TABLE "customer_reviews" ADD CONSTRAINT "customer_reviews_rating_range_chk" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_token_counts_valid_chk" CHECK (("prompt_tokens" IS NULL OR "prompt_tokens" >= 0) AND ("completion_tokens" IS NULL OR "completion_tokens" >= 0));
