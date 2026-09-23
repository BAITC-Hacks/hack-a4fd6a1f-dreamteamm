package com.workflow.taskcard.repository;

import com.workflow.taskcard.domain.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:tag IS NULL OR LOWER(t.tags) LIKE LOWER(CONCAT('%', :tag, '%'))) AND " +
           "(:q IS NULL OR (" +
           "   LOWER(t.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "   LOWER(t.notes) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "   LOWER(t.tags) LIKE LOWER(CONCAT('%', :q, '%'))" +
           "))")
    Page<Task> searchTasks(
        @Param("status") String status,
        @Param("category") String category,
        @Param("priority") String priority,
        @Param("tag") String tag,
        @Param("q") String q,
        Pageable pageable
    );
}
