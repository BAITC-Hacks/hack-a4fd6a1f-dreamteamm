package com.workflow.taskcard.controller;

import com.workflow.taskcard.dto.PageResponse;
import com.workflow.taskcard.dto.ReadinessScoreResult;
import com.workflow.taskcard.dto.TaskDto;
import com.workflow.taskcard.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<TaskDto.Response>> listTasks(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String priority,
        @RequestParam(required = false) String tag,
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<TaskDto.Response> response = taskService.listTasks(status, category, priority, tag, q, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDto.Response> getTask(@PathVariable Long id) {
        TaskDto.Response task = taskService.getTask(id);
        return ResponseEntity.ok(task);
    }

    @GetMapping("/{id}/readiness")
    public ResponseEntity<ReadinessScoreResult> getTaskReadiness(@PathVariable Long id) {
        ReadinessScoreResult readiness = taskService.getTaskReadiness(id);
        return ResponseEntity.ok(readiness);
    }

    @PostMapping
    public ResponseEntity<TaskDto.Response> createTask(@Valid @RequestBody TaskDto.CreateRequest request) {
        TaskDto.Response created = taskService.createTask(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto.Response> updateTask(
        @PathVariable Long id,
        @Valid @RequestBody TaskDto.UpdateRequest request
    ) {
        TaskDto.Response updated = taskService.updateTask(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto.Response> updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody TaskDto.StatusUpdateRequest request
    ) {
        TaskDto.Response updated = taskService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Task deleted with id: " + id);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<Map<String, Object>> uploadAttachment(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file
    ) {
        // Storage simulation returning key and metadata
        String storageKey = "att_" + UUID.randomUUID().toString().substring(0, 8) + "_" + file.getOriginalFilename();
        
        TaskDto.UpdateRequest updateRequest = new TaskDto.UpdateRequest();
        TaskDto.Response existing = taskService.getTask(id);
        updateRequest.setTitle(existing.getTitle());
        updateRequest.setCategory(existing.getCategory());
        updateRequest.setOwner(existing.getOwner());
        updateRequest.setStatus(existing.getStatus());
        updateRequest.setPriority(existing.getPriority());
        updateRequest.setTags(existing.getTags());
        updateRequest.setNotes(existing.getNotes());
        updateRequest.setAttachmentKey(storageKey);
        updateRequest.setAttachmentName(file.getOriginalFilename());
        
        TaskDto.Response updated = taskService.updateTask(id, updateRequest);

        Map<String, Object> resp = new HashMap<>();
        resp.put("storage_key", storageKey);
        resp.put("filename", file.getOriginalFilename());
        resp.put("size_bytes", file.getSize());
        resp.put("readiness_score", updated.getReadinessScore());
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }
}
