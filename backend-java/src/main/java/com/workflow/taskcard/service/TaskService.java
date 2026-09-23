package com.workflow.taskcard.service;

import com.workflow.taskcard.domain.Task;
import com.workflow.taskcard.dto.PageResponse;
import com.workflow.taskcard.dto.ReadinessScoreResult;
import com.workflow.taskcard.dto.TaskDto;
import com.workflow.taskcard.exception.ResourceNotFoundException;
import com.workflow.taskcard.repository.ProposalRepository;
import com.workflow.taskcard.repository.TaskRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProposalRepository proposalRepository;
    private final ReadinessScoreService readinessScoreService;

    public TaskService(
        TaskRepository taskRepository,
        ProposalRepository proposalRepository,
        ReadinessScoreService readinessScoreService
    ) {
        this.taskRepository = taskRepository;
        this.proposalRepository = proposalRepository;
        this.readinessScoreService = readinessScoreService;
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskDto.Response> listTasks(
        String status,
        String category,
        String priority,
        String tag,
        String q,
        int page,
        int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Task> taskPage = taskRepository.searchTasks(status, category, priority, tag, q, pageRequest);

        List<TaskDto.Response> responses = taskPage.getContent().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());

        return new PageResponse<>(
            responses,
            taskPage.getNumber(),
            taskPage.getSize(),
            taskPage.getTotalElements(),
            taskPage.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public TaskDto.Response getTask(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return mapToResponse(task);
    }

    @Transactional(readOnly = true)
    public ReadinessScoreResult getTaskReadiness(Long id) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return readinessScoreService.computeReadinessScore(
            task.getTitle(),
            task.getCategory(),
            task.getPriority(),
            task.getTags(),
            task.getOwner(),
            task.getNotes(),
            task.getAttachmentKey()
        );
    }

    @Transactional
    public TaskDto.Response createTask(TaskDto.CreateRequest request) {
        // Server-side readiness scoring
        ReadinessScoreResult scoreResult = readinessScoreService.computeReadinessScore(
            request.getTitle(),
            request.getCategory(),
            request.getPriority(),
            request.getTags(),
            request.getOwner(),
            request.getNotes(),
            request.getAttachmentKey()
        );

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setCategory(request.getCategory());
        task.setOwner(request.getOwner());
        task.setStatus(request.getStatus() != null ? request.getStatus() : "Draft");
        task.setPriority(request.getPriority() != null ? request.getPriority() : "Medium");
        task.setTags(request.getTags() != null ? request.getTags() : "");
        task.setNotes(request.getNotes());
        task.setAttachmentKey(request.getAttachmentKey());
        task.setAttachmentName(request.getAttachmentName());
        task.setReadinessScore(scoreResult.getScore());
        task.setLastUpdated(LocalDate.now());

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    @Transactional
    public TaskDto.Response updateTask(Long id, TaskDto.UpdateRequest request) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        // Recompute readiness score
        ReadinessScoreResult scoreResult = readinessScoreService.computeReadinessScore(
            request.getTitle(),
            request.getCategory(),
            request.getPriority() != null ? request.getPriority() : task.getPriority(),
            request.getTags() != null ? request.getTags() : task.getTags(),
            request.getOwner(),
            request.getNotes(),
            request.getAttachmentKey() != null ? request.getAttachmentKey() : task.getAttachmentKey()
        );

        task.setTitle(request.getTitle());
        task.setCategory(request.getCategory());
        task.setOwner(request.getOwner());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getTags() != null) task.setTags(request.getTags());
        task.setNotes(request.getNotes());
        if (request.getAttachmentKey() != null) task.setAttachmentKey(request.getAttachmentKey());
        if (request.getAttachmentName() != null) task.setAttachmentName(request.getAttachmentName());
        task.setReadinessScore(scoreResult.getScore());
        task.setLastUpdated(LocalDate.now());

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    @Transactional
    public TaskDto.Response updateStatus(Long id, String newStatus) {
        Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        task.setStatus(newStatus);
        task.setLastUpdated(LocalDate.now());
        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    private TaskDto.Response mapToResponse(Task task) {
        TaskDto.Response resp = new TaskDto.Response();
        resp.setId(task.getId());
        resp.setTitle(task.getTitle());
        resp.setCategory(task.getCategory());
        resp.setOwner(task.getOwner());
        resp.setStatus(task.getStatus());
        resp.setPriority(task.getPriority());
        resp.setTags(task.getTags());
        resp.setReadinessScore(task.getReadinessScore());
        resp.setLastUpdated(task.getLastUpdated());
        resp.setNotes(task.getNotes());
        resp.setAttachmentKey(task.getAttachmentKey());
        resp.setAttachmentName(task.getAttachmentName());
        resp.setProposalsCount((int) proposalRepository.countByTaskId(task.getId()));
        return resp;
    }
}
