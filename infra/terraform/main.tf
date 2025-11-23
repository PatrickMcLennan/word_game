terraform {
  required_version = ">= 1.4.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_route53_record" "word_game" {
  zone_id = var.route53_zone_id
  name    = "${var.subdomain}.${var.zone_root_domain}"
  type    = "A"
  ttl     = var.ttl
  records = [var.target_ipv4]
}


