variable "aws_region" {
  description = "AWS region for the Route 53 API (any region works)."
  type        = string
  default     = "us-east-1"
}

variable "route53_zone_id" {
  description = "Hosted zone ID for your domain."
  type        = string
}

variable "zone_root_domain" {
  description = "The root domain hosted in Route 53 (e.g. yourdomain.com)."
  type        = string
}

variable "subdomain" {
  description = "Subdomain to create under the hosted zone."
  type        = string
  default     = "word-game"
}

variable "target_ipv4" {
  description = "Public IPv4 address of your server."
  type        = string
}

variable "ttl" {
  description = "DNS TTL in seconds."
  type        = number
  default     = 300
}


