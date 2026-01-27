resource "aws_route53_record" "legaldoji" {
  zone_id = var.route53_zone_id
  name    = "shivdarshan.space"
  type    = "A"
  ttl     = 300
  records = [aws_instance.app_server.public_ip]
}

output "legaldoji_dns" {
  value = aws_route53_record.legaldoji.fqdn
}
resource "aws_route53_record" "api_legaldoji" {
  zone_id = var.route53_zone_id
  name    = "api.shivdarshan.space"
  type    = "A"
  ttl     = 300
  records = [aws_instance.app_server.public_ip]
}

output "api_legaldoji_dns" {
  value = aws_route53_record.api_legaldoji.fqdn
}

resource "random_id" "suffix" {
  byte_length = 4
}
# Terraform configuration for minimal-cost AWS EC2 deployment with PostgreSQL setup
# IAM credentials will be provided via GitHub Actions environment variables


provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key_id
  secret_key = var.aws_secret_access_key
}

resource "aws_key_pair" "deployer" {
  key_name   = "${var.environment}-${var.key_name}"
  public_key = var.public_key
}

resource "aws_security_group" "allow_ssh_web" {
  name        = "${var.environment}-allow_ssh_web"
  description = "Allow SSH and HTTP/HTTPS"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro" # Free tier eligible
  key_name      = aws_key_pair.deployer.key_name
  vpc_security_group_ids = [aws_security_group.allow_ssh_web.id]

  user_data = templatefile("${path.module}/setup_app.sh", {
    rds_endpoint = local.rds_endpoint
    rds_username = local.rds_username
    rds_password = var.rds_password
    rds_db_name  = var.rds_db_name
  })

  tags = {
    Name = "${var.environment}-pp-backend-app-server"
    Environment = var.environment
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
}

output "ec2_public_ip" {
  value = aws_instance.app_server.public_ip
}


locals {
  rds_exists = can(aws_db_instance.legaldb[0])
  rds_endpoint = try(aws_db_instance.legaldb[0].address, "")
  rds_username = try(aws_db_instance.legaldb[0].username, "")
}