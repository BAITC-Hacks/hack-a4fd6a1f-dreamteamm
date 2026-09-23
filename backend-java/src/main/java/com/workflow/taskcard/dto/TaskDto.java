package com.workflow.taskcard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class TaskDto {

    public static class CreateRequest {
        @NotBlank(message = "Title is required and must not be blank")
        @Size(min = 5, message = "Title must be at least 5 characters long")
        private String title;

        @NotBlank(message = "Category is required")
        @Pattern(regexp = "Design|Engineering|Data|Business", message = "Category must be one of: Design, Engineering, Data, Business")
        private String category;

        @NotBlank(message = "Owner is required")
        private String owner;

        private String status = "Draft";
        private String priority = "Medium";
        private String tags = "";

        @NotBlank(message = "Notes / description is required")
        private String notes;

        private String attachmentKey;
        private String attachmentName;

        public CreateRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getOwner() { return owner; }
        public void setOwner(String owner) { this.owner = owner; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public String getTags() { return tags; }
        public void setTags(String tags) { this.tags = tags; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public String getAttachmentKey() { return attachmentKey; }
        public void setAttachmentKey(String attachmentKey) { this.attachmentKey = attachmentKey; }

        public String getAttachmentName() { return attachmentName; }
        public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }
    }

    public static class UpdateRequest {
        @NotBlank(message = "Title is required and must not be blank")
        private String title;

        @NotBlank(message = "Category is required")
        @Pattern(regexp = "Design|Engineering|Data|Business", message = "Category must be one of: Design, Engineering, Data, Business")
        private String category;

        @NotBlank(message = "Owner is required")
        private String owner;

        private String status;
        private String priority;
        private String tags;

        @NotBlank(message = "Notes / description is required")
        private String notes;

        private String attachmentKey;
        private String attachmentName;

        public UpdateRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getOwner() { return owner; }
        public void setOwner(String owner) { this.owner = owner; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public String getTags() { return tags; }
        public void setTags(String tags) { this.tags = tags; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public String getAttachmentKey() { return attachmentKey; }
        public void setAttachmentKey(String attachmentKey) { this.attachmentKey = attachmentKey; }

        public String getAttachmentName() { return attachmentName; }
        public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }
    }

    public static class StatusUpdateRequest {
        @NotBlank(message = "Status must not be blank")
        @Pattern(regexp = "Draft|Needs Info|Published|In Progress|Closed", message = "Status must be one of: Draft, Needs Info, Published, In Progress, Closed")
        private String status;

        public StatusUpdateRequest() {}
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class Response {
        private Long id;
        private String title;
        private String category;
        private String owner;
        private String status;
        private String priority;
        private String tags;
        private int readinessScore;
        private LocalDate lastUpdated;
        private String notes;
        private String attachmentKey;
        private String attachmentName;
        private int proposalsCount;

        public Response() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getOwner() { return owner; }
        public void setOwner(String owner) { this.owner = owner; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public String getTags() { return tags; }
        public void setTags(String tags) { this.tags = tags; }

        public int getReadinessScore() { return readinessScore; }
        public void setReadinessScore(int readinessScore) { this.readinessScore = readinessScore; }

        public LocalDate getLastUpdated() { return lastUpdated; }
        public void setLastUpdated(LocalDate lastUpdated) { this.lastUpdated = lastUpdated; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public String getAttachmentKey() { return attachmentKey; }
        public void setAttachmentKey(String attachmentKey) { this.attachmentKey = attachmentKey; }

        public String getAttachmentName() { return attachmentName; }
        public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }

        public int getProposalsCount() { return proposalsCount; }
        public void setProposalsCount(int proposalsCount) { this.proposalsCount = proposalsCount; }
    }
}
