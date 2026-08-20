CREATE TABLE `email_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`to_email` text NOT NULL,
	`from_email` text DEFAULT 'admin@edgespark.com' NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`related_type` text,
	`related_id` text,
	`status` text DEFAULT 'sent' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `partner_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`company` text,
	`investment_range` text,
	`experience` text,
	`message` text,
	`source` text DEFAULT 'website',
	`status` text DEFAULT 'new' NOT NULL,
	`admin_notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `property_media` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`media_type` text NOT NULL,
	`s3_uri` text NOT NULL,
	`file_name` text,
	`file_size` integer,
	`mime_type` text,
	`caption` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_hero` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON UPDATE no action ON DELETE no action
);
