package com.workflow.taskcard.service;

import com.workflow.taskcard.domain.Proposal;
import com.workflow.taskcard.domain.Task;
import com.workflow.taskcard.dto.ProposalDto;
import com.workflow.taskcard.exception.ResourceNotFoundException;
import com.workflow.taskcard.repository.ProposalRepository;
import com.workflow.taskcard.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final TaskRepository taskRepository;

    public ProposalService(ProposalRepository proposalRepository, TaskRepository taskRepository) {
        this.proposalRepository = proposalRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<ProposalDto.Response> getProposalsByTaskId(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task not found with id: " + taskId);
        }
        return proposalRepository.findByTaskIdOrderByIdDesc(taskId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProposalDto.Response submitProposal(Long taskId, ProposalDto.CreateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        Proposal proposal = new Proposal();
        proposal.setTask(task);
        proposal.setStudentName(request.getStudentName());
        proposal.setStudentContact(request.getStudentContact());
        proposal.setPitch(request.getPitch());
        proposal.setStatus("Submitted");
        proposal.setCreatedAt(Instant.now());
        proposal.setAttachmentKey(request.getAttachmentKey());
        proposal.setAttachmentName(request.getAttachmentName());

        Proposal saved = proposalRepository.save(proposal);
        return mapToResponse(saved);
    }

    @Transactional
    public ProposalDto.Response updateProposalStatus(Long proposalId, String newStatus) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found with id: " + proposalId));
        proposal.setStatus(newStatus);
        Proposal saved = proposalRepository.save(proposal);
        return mapToResponse(saved);
    }

    private ProposalDto.Response mapToResponse(Proposal p) {
        ProposalDto.Response resp = new ProposalDto.Response();
        resp.setId(p.getId());
        resp.setTaskId(p.getTask().getId());
        resp.setStudentName(p.getStudentName());
        resp.setStudentContact(p.getStudentContact());
        resp.setPitch(p.getPitch());
        resp.setStatus(p.getStatus());
        resp.setCreatedAt(p.getCreatedAt());
        resp.setAttachmentKey(p.getAttachmentKey());
        resp.setAttachmentName(p.getAttachmentName());
        return resp;
    }
}
