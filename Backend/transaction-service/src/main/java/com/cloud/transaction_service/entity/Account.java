package com.cloud.transaction_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Representing the Account entity in the Transaction Service.
 * Mapping to the 'accountService' schema for cross-schema consistency.
 */
@Entity
@Table(name = "accounts", catalog = "\"accountService\"")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_number", unique = true, nullable = false)
    private String accountNumber;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private BigDecimal balance;

    @Column(nullable = false)
    private String status; // ACTIVE, FROZEN, CLOSED
}
