CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`interest_range` text,
	`message` text,
	`source` text DEFAULT 'website',
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `deals` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`purchase_price_ngn` integer NOT NULL,
	`renovation_costs_ngn` integer NOT NULL,
	`legal_fees_ngn` integer DEFAULT 0 NOT NULL,
	`total_investment_ngn` integer NOT NULL,
	`projected_resale_ngn` integer NOT NULL,
	`gross_profit_ngn` integer NOT NULL,
	`return_percentage` real,
	`investor_share_min` integer,
	`investor_share_max` integer,
	`deal_cycle_months` integer,
	`description` text,
	`highlights` text,
	`risk_notes` text,
	`target_close_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deals_slug_unique` ON `deals` (`slug`);--> statement-breakpoint
CREATE TABLE `investor_interests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`deal_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`amount_indicative` text,
	`reviewed_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`country` text DEFAULT 'Nigeria' NOT NULL,
	`latitude` real,
	`longitude` real,
	`bedrooms` integer,
	`bathrooms` integer,
	`plot_size_sqm` integer,
	`building_size_sqm` integer,
	`property_type` text,
	`price_ngn` integer NOT NULL,
	`price_note` text,
	`hero_image` text,
	`gallery_images` text,
	`featured` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `properties_slug_unique` ON `properties` (`slug`);--> statement-breakpoint
CREATE TABLE `site_content` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`section` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`role` text DEFAULT 'investor' NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);