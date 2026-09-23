package com.workflow.taskcard.controller;

import com.workflow.taskcard.dto.ProposalDto;
import com.workflow.taskcard.service.ProposalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProposalController {

    private final ProposalService proposalService;

    public ProposalController(ProposalService proposalService) {
        this.proposalService = proposalService;
    }

    @GetMapping("/tasks/{taskId}/proposals")
    public ResponseEntity<List<ProposalDto.Response>> getTaskProposals(@PathVariable Long taskId) {
        List<ProposalDto.Response> proposals = proposalService.getProposalsByTaskId(taskId);
        return ResponseEntity.ok(proposals);
    }

    @PostMapping("/tasks/{taskId}/proposals")
    public ResponseEntity<ProposalDto.Response> submitProposal(
        @PathVariable Long taskId,
        @Valid @RequestBody ProposalDto.CreateRequest request
    ) {
        ProposalDto.Response created = proposalService.submitProposal(taskId, request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/proposals/{id}/status")
    public ResponseEntity<ProposalDto.Response> updateProposalStatus(
        @PathVariable Long id,
        @Valid @RequestBody ProposalDto.StatusUpdateRequest request
    ) {
        ProposalDto.Response updated = proposalService.updateProposalStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}
