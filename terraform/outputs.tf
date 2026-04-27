output "server_public_ip" {
  value       = aws_instance.banking_server.public_ip
  description = "Public IP of the Banking System Server"
}

output "kubeconfig_command" {
  value       = "ssh ubuntu@${aws_instance.banking_server.public_ip} 'sudo cat /etc/rancher/k3s/k3s.yaml'"
  description = "Command to retrieve the kubeconfig"
}