CREATE TABLE `dashboards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`route` varchar(255) NOT NULL,
	`isActive` enum('Y','N') NOT NULL DEFAULT 'Y',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboards_id` PRIMARY KEY(`id`),
	CONSTRAINT `dashboards_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role` enum('user','admin','manager','viewer') NOT NULL,
	`dashboardId` int NOT NULL,
	`canView` enum('Y','N') NOT NULL DEFAULT 'Y',
	`canEdit` enum('Y','N') NOT NULL DEFAULT 'N',
	`canDelete` enum('Y','N') NOT NULL DEFAULT 'N',
	`canExport` enum('Y','N') NOT NULL DEFAULT 'N',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `role_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dashboardId` int NOT NULL,
	`canView` enum('Y','N') NOT NULL DEFAULT 'Y',
	`canEdit` enum('Y','N') NOT NULL DEFAULT 'N',
	`canDelete` enum('Y','N') NOT NULL DEFAULT 'N',
	`canExport` enum('Y','N') NOT NULL DEFAULT 'N',
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	`grantedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_permissions_id` PRIMARY KEY(`id`)
);
