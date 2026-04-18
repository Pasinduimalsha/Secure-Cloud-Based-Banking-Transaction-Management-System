package com.cloud.transaction_service.repository;

import com.cloud.transaction_service.entity.Outbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutboxRepository extends JpaRepository<Outbox, Long> {
    List<Outbox> findByProcessedFalseOrderByCreatedAtAsc();
}
