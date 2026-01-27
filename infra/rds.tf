# Create RDS only if explicitly asked
resource "aws_db_instance" "newsdb" {
  count                = var.enable_rds ? 1 : 0
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = "db.t3.micro"
  db_name              = var.rds_db_name
  identifier           = "${var.environment}-legalDB"
  username             = var.rds_username
  password             = var.rds_password
  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
  publicly_accessible  = true
  vpc_security_group_ids = [aws_security_group.rds_db.id]

  lifecycle {
    prevent_destroy = true
  }
}

# Lookup existing RDS if not creating
data "aws_db_instance" "existing" {
  count      = var.create_rds ? 0 : 1
  db_instance_identifier = var.existing_rds_identifier
}

resource "aws_security_group" "rds_db" {
  name        = "${var.environment}-rds-db"
  description = "Allow PostgreSQL access from EC2 app server"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    security_groups = [aws_security_group.allow_ssh_web.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
