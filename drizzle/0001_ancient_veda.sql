CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(60),
	`message` text NOT NULL,
	`status` enum('new','contacted','qualified','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnershipApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` enum('investor','owner','agent','developer','realtor') NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(60),
	`company` varchar(180),
	`investmentRange` varchar(120),
	`message` text NOT NULL,
	`status` enum('new','reviewed','contacted','approved','declined') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partnershipApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(180) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`description` text NOT NULL,
	`status` enum('draft','available','under_offer','sold','off_market') NOT NULL DEFAULT 'draft',
	`propertyType` enum('apartment','duplex','bungalow','land','commercial','other') NOT NULL DEFAULT 'other',
	`address` varchar(240) NOT NULL,
	`city` varchar(120) NOT NULL,
	`state` varchar(120) NOT NULL,
	`country` varchar(120) NOT NULL DEFAULT 'Nigeria',
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`price` int NOT NULL,
	`bedrooms` int,
	`bathrooms` int,
	`areaSqm` int,
	`projectedRoi` decimal(5,2),
	`projectedYield` decimal(5,2),
	`featured` int NOT NULL DEFAULT 0,
	`published` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`),
	CONSTRAINT `properties_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `propertyMedia` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`url` text NOT NULL,
	`storageKey` text NOT NULL,
	`fileName` varchar(255),
	`mimeType` varchar(120),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isHero` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `propertyMedia_id` PRIMARY KEY(`id`)
);
