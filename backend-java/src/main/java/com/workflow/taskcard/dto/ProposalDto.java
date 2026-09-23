package com.workflow.taskcard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public class ProposalDto {

    public static class CreateRequest {
        @NotBlank(message = "Your full name is required")
        private String studentName;

        @NotBlank(message = "Contact email or Telegram handle is required")
        private String studentContact;

        @NotBlank(message = "Proposal pitch and approach description is required")
        @Size(min = 20, message = "Please provide a more detailed pitch (at least 20 characters)")
        private String pitch;

        private String attachmentKey;
        private String attachmentName;

        public CreateRequest() {}

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getStudentContact() { return studentContact; }
        public void setStudentContact(String studentContact) { this.studentContact = studentContact; }

        public String getPitch() { return pitch; }
        public void setPitch(String pitch) { this.pitch = pitch; }

        public String getAttachmentKey() { return attachmentKey; }
        public void setAttachmentKey(String attachmentKey) { this.attachmentKey = attachmentKey; }

        public String getAttachmentName() { return attachmentName; }
        public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }
    }

    public static class StatusUpdateRequest {
        @NotBlank(message = "Status must not be blank")
        @Pattern(regexp = "Submitted|Shortlisted|Selected|Rejected", message = "Status must be one of: Submitted, Shortlisted, Selected, Rejected")
        private String status;

        public StatusUpdateRequest() {}
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class Response {
        private Long id;
        private Long taskId;
        private String studentName;
        private String studentContact;
        private String pitch;
        private String status;
        private Instant createdAt;
        private String attachmentKey;
        private String attachmentName;

        public Response() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getStudentContact() { return studentContact; }
        public void setStudentContact(String studentContact) { this.studentContact = studentContact; }

        public String getPitch() { return pitch; }
        public void setPitch(String pitch) { this.pitch = pitch; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

        public String getAttachmentKey() { return attachmentKey; }
        public void setAttachmentKey(String attachmentKey) { this.attachmentKey = attachmentKey; }

        public String getAttachmentName() { return attachmentName; }
        public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }
    }
}
