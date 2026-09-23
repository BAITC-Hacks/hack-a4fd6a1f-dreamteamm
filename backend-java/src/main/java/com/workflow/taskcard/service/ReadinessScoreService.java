package com.workflow.taskcard.service;

import com.workflow.taskcard.dto.ReadinessScoreResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ReadinessScoreService {

    private static final List<String> ACTION_VERBS = Arrays.asList(
        "build", "design", "develop", "implement", "create", "analyze",
        "optimize", "automate", "integrate", "launch", "generate", "establish",
        "prototype", "deploy", "refactor", "migrate", "audit", "evaluate"
    );

    private static final List<String> DELIVERABLE_KEYWORDS = Arrays.asList(
        "deliverable", "deliverables", "scope", "output", "goal", "milestone",
        "outcome", "target", "feature", "result", "expected"
    );

    private static final List<String> TECH_KEYWORDS = Arrays.asList(
        "requirement", "requirements", "stack", "technology", "tech", "skills",
        "tools", "python", "react", "sql", "api", "figma", "java", "database",
        "frontend", "backend", "cloud", "architecture", "framework", "library"
    );

    public ReadinessScoreResult computeReadinessScore(
        String title,
        String category,
        String priority,
        String tags,
        String owner,
        String notes,
        String attachmentKey
    ) {
        List<ReadinessScoreResult.QualityCriteria> breakdown = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        title = title != null ? title.trim() : "";
        category = category != null ? category.trim() : "";
        priority = priority != null ? priority.trim() : "";
        tags = tags != null ? tags.trim() : "";
        owner = owner != null ? owner.trim() : "";
        notes = notes != null ? notes.trim() : "";
        boolean hasAttachment = attachmentKey != null && !attachmentKey.isBlank();

        // 1. Title Clarity (max 15)
        int titlePoints = 0;
        if (title.length() >= 10) titlePoints += 8;
        String lowerTitle = title.toLowerCase();
        if (ACTION_VERBS.stream().anyMatch(lowerTitle::contains)) {
            titlePoints += 7;
        }
        breakdown.add(new ReadinessScoreResult.QualityCriteria(
            "Title Clarity",
            titlePoints,
            15,
            titlePoints >= 12,
            titlePoints >= 12 ? "Clear and actionable title." : "Use at least 10 chars and an action verb."
        ));
        if (titlePoints < 12) {
            suggestions.add("Improve title with action words (e.g. 'Build...', 'Analyze...')");
        }

        // 2. Category & Priority (max 15)
        int taxPoints = 0;
        if (Arrays.asList("Design", "Engineering", "Data", "Business").contains(category)) taxPoints += 10;
        if (Arrays.asList("Low", "Medium", "High").contains(priority)) taxPoints += 5;
        breakdown.add(new ReadinessScoreResult.QualityCriteria(
            "Category & Priority",
            taxPoints,
            15,
            taxPoints == 15,
            taxPoints == 15 ? "Properly categorized and prioritized." : "Select valid category and priority."
        ));
        if (taxPoints < 15) {
            suggestions.add("Assign a clear Category and Priority level.");
        }

        // 3. Tags (max 10)
        String[] tagArr = tags.split(",");
        long countTags = Arrays.stream(tagArr).map(String::trim).filter(s -> !s.isEmpty()).count();
        int tagPoints = 0;
        if (countTags >= 1) tagPoints += 5;
        if (countTags >= 2) tagPoints += 5;
        breakdown.add(new ReadinessScoreResult.QualityCriteria(
            "Tags & Keywords",
            tagPoints,
            10,
            tagPoints >= 10,
            tagPoints >= 10 ? "Good discoverability tags." : "Add 2+ descriptive tags."
        ));
        if (tagPoints < 10) {
            suggestions.add("Add 2+ descriptive tags to help students filter your task.");
        }

        // 4. Notes & Detailed Requirements (max 40)
        int notesPoints = 0;
        int notesLen = notes.length();
        if (notesLen >= 30) notesPoints += 8;
        if (notesLen >= 90) notesPoints += 10;
        if (notesLen >= 200) notesPoints += 12;

        String lowerNotes = notes.toLowerCase();
        if (DELIVERABLE_KEYWORDS.stream().anyMatch(lowerNotes::contains)) notesPoints += 5;
        if (TECH_KEYWORDS.stream().anyMatch(lowerNotes::contains)) notesPoints += 5;
        notesPoints = Math.min(40, notesPoints);

        breakdown.add(new ReadinessScoreResult.QualityCriteria(
            "Requirements & Scope Depth",
            notesPoints,
            40,
            notesPoints >= 30,
            notesPoints >= 30 ? "Rich description with deliverables and technical context." : "Elaborate on explicit deliverables and tech requirements."
        ));
        if (notesPoints < 30) {
            suggestions.add("Expand notes with concrete deliverables, goals, and technical requirements.");
        }

        // 5. Owner Contact (max 10)
        int ownerPoints = owner.length() >= 2 ? 10 : 0;
        breakdown.add(new ReadinessScoreResult.QualityCriteria(
            "Owner Contact & Accountability",
            ownerPoints,
            10,
            ownerPoints == 10,
            ownerPoints == 10 ? "Owner specified." : "Specify contact person or entity."
        ));
        if (ownerPoints < 10) {
            suggestions.add("Provide an owner name or contact entity.");
        }

        // 6. Attachments (max 10)
        int attachPoints = hasAttachment ? 10 : 0;
        breakdown.add(new ReadinessScoreResult.QualityCriteria(
            "Briefs & Supporting Materials",
            attachPoints,
            10,
            attachPoints == 10,
            attachPoints == 10 ? "Supporting documents/brief attached." : "Attach project brief or specification document."
        ));
        if (attachPoints < 10) {
            suggestions.add("Attach a project brief or reference document.");
        }

        int total = Math.max(0, Math.min(100, titlePoints + taxPoints + tagPoints + notesPoints + ownerPoints + attachPoints));

        if (suggestions.isEmpty()) {
            suggestions.add("This task card meets high quality standards! Ready to publish.");
        }

        return new ReadinessScoreResult(total, breakdown, suggestions);
    }
}
