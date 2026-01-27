# Add an output for the RDS endpoint and credentials
output "rds_endpoint" {
  value       = local.rds_endpoint
  description = "RDS endpoint if exists"
}

output "rds_username" {
  value       = local.rds_username
  description = "RDS username if exists"
}

output "rds_password" {
  value       = var.rds_password
  sensitive   = true
}
