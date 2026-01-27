variable "route53_zone_id" {
	description = "Route53 Hosted Zone ID for peoplepolly.com."
	type        = string
	default		= "Z0023181XPA9OI3U6RAU"
}
variable "create_rds" {
	description = "Whether to create a new RDS instance. Set to false to use an existing one."
	type        = bool
	default     = true
}

variable "existing_rds_identifier" {
  type    = string
  default = ""
}

variable "rds_db_name" {
	description = "RDS database name."
	type        = string
	default     = "production_newsdb"
}

variable "rds_identifier" {
	description = "RDS instance identifier."
	type        = string
	default     = "production-newsdb"
}

variable "rds_username" {
	description = "RDS master username."
	type        = string
	default     = "newsuser"
}

variable "rds_password" {
  description = "RDS master password. Should be set via environment variable (e.g., TF_VAR_rds_password)."
  type        = string
}
variable "aws_region" { default = "ap-south-1" }
variable "aws_access_key_id" { type = string }
variable "aws_secret_access_key" { type = string }
variable "key_name" { default = "ec2-key" }

variable "environment" {
	description = "Deployment environment name (e.g. production, staging)"
	type        = string
	default     = "production"
}

variable "public_key" {
	description = "SSH public key for EC2 access. Paste the contents of your id_rsa.pub file."
	type        = string
}
variable "rds_endpoint" {
	description = "RDS endpoint for the app."
	type        = string
	default     = ""
}

variable "secret_key" {
	description = "App secret key for JWT or other secrets."
	type        = string
	default     = "ShtjbXloSkhp"
}

variable "database_url" {
	description = "Database connection URL for the app."
	type        = string
	default     = ""
}

variable "redis_url" {
	description = "Redis connection URL for the app."
	type        = string
	default     = ""
}

variable "cors_origins" {
	description = "CORS origins allowed for the app."
	type        = string
	default     = "*"
}

variable "enable_rds" {
  type    = bool
  default = true
  description = "Whether to create/manage the RDS instance. Set to false to skip RDS."
}
