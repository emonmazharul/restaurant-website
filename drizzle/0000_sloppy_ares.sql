CREATE TABLE "menus" (
	"id" serial NOT NULL,
	"category" varchar(150) NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" numeric NOT NULL,
	"variant" json,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial NOT NULL,
	"orderId" text NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" text NOT NULL,
	"cart" json NOT NULL,
	"fullAddress" text,
	"postCode" text,
	"orderType" varchar(50) NOT NULL,
	"paymentMethod" varchar(50) NOT NULL,
	"checkoutId" text,
	"deliveryTime" text DEFAULT 'ASAP' NOT NULL,
	"totalPrice" numeric NOT NULL,
	"orderCanceled" boolean DEFAULT false,
	"checkedByAdmin" boolean DEFAULT false,
	"checkoutCompleted" boolean DEFAULT false,
	"specialRequest" text,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "orders_orderId_unique" UNIQUE("orderId")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" text NOT NULL,
	"guests" integer NOT NULL,
	"booking_date" date NOT NULL,
	"booking_time" time NOT NULL,
	"special_request" text,
	"confirmed" boolean DEFAULT false,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial NOT NULL,
	"totalSale" numeric NOT NULL,
	"saleDate" text NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"fullAddress" text NOT NULL,
	"postCode" text NOT NULL,
	"password" text NOT NULL,
	"phone" text NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
