resource "aws_security_group" "banking_sg" {
  name        = "banking_system_sg"
  description = "Security group for Banking System (Unified Build/Deploy)"
  vpc_id      = data.aws_vpc.default.id

  # SSH for Pipeline & Debugging
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Kubernetes API
  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # API Gateway NodePort
  ingress {
    from_port   = 30000
    to_port     = 30000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend NodePort
  ingress {
    from_port   = 30001
    to_port     = 30001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Banking System SG"
  }
}

resource "aws_instance" "banking_server" {
  ami                    = var.ami
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.banking_sg.id]
  subnet_id              = data.aws_subnets.default.ids[0]

  root_block_device {
    volume_size = 30 # 30GB is the Free Tier limit
  }

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y docker.io
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu

              # Install K3s (Lightweight Kubernetes)
              curl -sfL https://get.k3s.io | sh -
              
              # Wait for K3s to generate the config
              sleep 30
              
              # Make kubeconfig readable for ubuntu user
              sudo chmod 644 /etc/rancher/k3s/k3s.yaml
              EOF

  tags = {
    Name = "Banking-Unified-Server"
  }
}
