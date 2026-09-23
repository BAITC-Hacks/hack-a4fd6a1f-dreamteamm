package com.workflow.taskcard.repository;

import com.workflow.taskcard.domain.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    List<Proposal> findByTaskIdOrderByIdDesc(Long taskId);
    long countByTaskId(Long taskId);
}
