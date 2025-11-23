output "word_game_fqdn" {
  description = "Fully qualified domain name for the word game."
  value       = aws_route53_record.word_game.fqdn
}


