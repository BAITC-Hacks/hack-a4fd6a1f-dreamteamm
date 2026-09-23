package com.workflow.taskcard.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String owner;

    @Column(nullable = false)
    private String status = "Draft";

    @Column(nullable = false)
    private String priority = "Medium";

    @Column(nullable = false)
    private String tags = "";

    @Column(name = "readiness_score", nullable = false)
    private int readinessScore = 0;

    @Column(name = "last_updated", nullable = false)
    private LocalDate lastUpdated = LocalDate.now();

    @Column(nullable = false, columnDefinition = "TEXT")
    private String notes;

    @Column(name = "attachment_key")
    private String attachmentKey;

    @Column(name = "attachment_name")
    private String attachmentName;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Proposal> proposals = new ArrayList<>();

    public Task() {}

    // Getters and Setters
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

    public List<Proposal> getProposals() { return proposals; }
    public void setProposals(List<Proposal> proposals) { this.proposals = proposals; }

    public int getProposalsCount() {
        return proposals != null ? proposals.size() : 0;
    }
}
