package com.workflow.taskcard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public class FeedbackDto {

    public static class CreateRequest {
        @NotBlank(message = "Name is required")
        private String userName;

        private String feedbackType = "platform";
        private Long taskId;

        @NotBlank(message = "Feedback text is required")
        @Size(min = 5, message = "Feedback must be at least 5 characters")
        private String content;

        public CreateRequest() {}

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public String getFeedbackType() { return feedbackType; }
        public void setFeedbackType(String feedbackType) { this.feedbackType = feedbackType; }

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class Response {
        private Long id;
        private Long taskId;
        private String userName;
        private String feedbackType;
        private String content;
        private Instant createdAt;
        private String taskTitle;

        public Response() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public String getFeedbackType() { return feedbackType; }
        public void setFeedbackType(String feedbackType) { this.feedbackType = feedbackType; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

        public String getTaskTitle() { return taskTitle; }
        public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }
    }
}
