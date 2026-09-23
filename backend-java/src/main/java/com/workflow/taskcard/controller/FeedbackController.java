package com.workflow.taskcard.controller;

import com.workflow.taskcard.domain.Feedback;
import com.workflow.taskcard.dto.FeedbackDto;
import com.workflow.taskcard.repository.FeedbackRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    public FeedbackController(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @GetMapping
    public ResponseEntity<List<FeedbackDto.Response>> listFeedback() {
        List<FeedbackDto.Response> responses = feedbackRepository.findAllByOrderByIdDesc().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<FeedbackDto.Response> submitFeedback(@Valid @RequestBody FeedbackDto.CreateRequest request) {
        Feedback feedback = new Feedback();
        feedback.setUserName(request.getUserName());
        feedback.setFeedbackType(request.getFeedbackType());
        feedback.setTaskId(request.getTaskId());
        feedback.setContent(request.getContent());
        feedback.setCreatedAt(Instant.now());

        Feedback saved = feedbackRepository.save(feedback);
        return new ResponseEntity<>(mapToResponse(saved), HttpStatus.CREATED);
    }

    private FeedbackDto.Response mapToResponse(Feedback f) {
        FeedbackDto.Response resp = new FeedbackDto.Response();
        resp.setId(f.getId());
        resp.setTaskId(f.getTaskId());
        resp.setUserName(f.getUserName());
        resp.setFeedbackType(f.getFeedbackType());
        resp.setContent(f.getContent());
        resp.setCreatedAt(f.getCreatedAt());
        return resp;
    }
}
