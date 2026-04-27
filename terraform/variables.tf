variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Instance type for the unified Build/Deploy server"
  type        = string
  default     = "m7i-flex.large"
}

variable "ami" {
  description = "Ubuntu AMI ID"
  type        = string
  default     = "ami-0ec10929233384c7f"
}

variable "key_name" {
  description = "Name of the existing EC2 key pair"
  type        = string
  default     = "Jenkins"
}