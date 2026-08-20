ALTER TABLE `properties` ADD `isDemo` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `properties` ADD `sourceLabel` varchar(180);--> statement-breakpoint
ALTER TABLE `properties` ADD `verificationStatus` enum('unverified','under_review','verified') DEFAULT 'unverified' NOT NULL;