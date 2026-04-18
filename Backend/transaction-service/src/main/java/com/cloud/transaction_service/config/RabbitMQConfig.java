package com.cloud.transaction_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "transaction.events";
    public static final String NOTIF_QUEUE = "notification.queue";
    public static final String AUDIT_QUEUE = "audit.queue";
    public static final String NOTIF_ROUTING_KEY = "txn.completed";
    public static final String AUDIT_ROUTING_KEY = "txn.#";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIF_QUEUE, true);
    }

    @Bean
    public Queue auditQueue() {
        return new Queue(AUDIT_QUEUE, true);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange exchange) {
        return BindingBuilder.bind(notificationQueue).to(exchange).with(NOTIF_ROUTING_KEY);
    }

    @Bean
    public Binding auditBinding(Queue auditQueue, TopicExchange exchange) {
        return BindingBuilder.bind(auditQueue).to(exchange).with(AUDIT_ROUTING_KEY);
    }

    @Bean
    public JacksonJsonMessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}
