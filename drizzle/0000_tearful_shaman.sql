CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`mobile` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`pin_code` text NOT NULL,
	`payment_method` text NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'Order Confirmed' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_id_unique` ON `orders` (`order_id`);--> statement-breakpoint
CREATE TABLE `seller_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` text NOT NULL,
	`full_name` text NOT NULL,
	`mobile` text NOT NULL,
	`email` text NOT NULL,
	`business_name` text NOT NULL,
	`business_type` text NOT NULL,
	`gstin` text,
	`document_prefix` text NOT NULL,
	`status` text DEFAULT 'Pending Review' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seller_applications_application_id_unique` ON `seller_applications` (`application_id`);