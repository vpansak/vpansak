CREATE TABLE `addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`label` text DEFAULT 'Home' NOT NULL,
	`full_name` text NOT NULL,
	`mobile` text NOT NULL,
	`line1` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`pin_code` text NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`code` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text DEFAULT 'percentage' NOT NULL,
	`value` integer NOT NULL,
	`min_order` integer DEFAULT 0 NOT NULL,
	`max_discount` integer,
	`active` integer DEFAULT true NOT NULL,
	`expires_at` text
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`donation_id` text NOT NULL,
	`donor_name` text NOT NULL,
	`email` text NOT NULL,
	`mobile` text NOT NULL,
	`amount` integer NOT NULL,
	`payment_method` text DEFAULT 'Manual' NOT NULL,
	`payment_status` text DEFAULT 'Pending Verification' NOT NULL,
	`certificate_id` text NOT NULL,
	`appreciation_message` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `donations_donation_id_unique` ON `donations` (`donation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `donations_certificate_id_unique` ON `donations` (`certificate_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`type` text DEFAULT 'info' NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `officers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`officer_id` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`department` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`assigned_count` integer DEFAULT 0 NOT NULL,
	`resolved_count` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `officers_officer_id_unique` ON `officers` (`officer_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `officers_email_unique` ON `officers` (`email`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`price` integer NOT NULL,
	`quantity` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand` text DEFAULT 'VPANSAK Select' NOT NULL,
	`category` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`specifications` text DEFAULT '{}' NOT NULL,
	`image_url` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`price` integer NOT NULL,
	`mrp` integer NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`sku` text NOT NULL,
	`rating` integer DEFAULT 0 NOT NULL,
	`review_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Approved' NOT NULL,
	`seller_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`email` text PRIMARY KEY NOT NULL,
	`full_name` text DEFAULT '' NOT NULL,
	`mobile` text DEFAULT '' NOT NULL,
	`avatar_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` text NOT NULL,
	`owner_email` text NOT NULL,
	`display_name` text NOT NULL,
	`rating` integer NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ticket_replies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_id` text NOT NULL,
	`author_type` text NOT NULL,
	`author_name` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticket_id` text NOT NULL,
	`customer_name` text NOT NULL,
	`email` text NOT NULL,
	`mobile` text DEFAULT '' NOT NULL,
	`category` text NOT NULL,
	`subject` text NOT NULL,
	`description` text NOT NULL,
	`priority` text DEFAULT 'Normal' NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`assigned_officer` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tickets_ticket_id_unique` ON `tickets` (`ticket_id`);--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`product_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `owner_email` text;