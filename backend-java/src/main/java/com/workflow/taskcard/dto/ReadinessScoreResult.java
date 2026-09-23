package com.workflow.taskcard.dto;

import java.util.ArrayList;
import java.util.List;

public class ReadinessScoreResult {
    private int score;
    private List<QualityCriteria> breakdown = new ArrayList<>();
    private List<String> suggestions = new ArrayList<>();

    public ReadinessScoreResult() {}

    public ReadinessScoreResult(int score, List<QualityCriteria> breakdown, List<String> suggestions) {
        this.score = score;
        this.breakdown = breakdown;
        this.suggestions = suggestions;
    }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public List<QualityCriteria> getBreakdown() { return breakdown; }
    public void setBreakdown(List<QualityCriteria> breakdown) { this.breakdown = breakdown; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public static class QualityCriteria {
        private String category;
        private int points;
        private int maxPoints;
        private boolean passed;
        private String suggestion;

        public QualityCriteria() {}

        public QualityCriteria(String category, int points, int maxPoints, boolean passed, String suggestion) {
            this.category = category;
            this.points = points;
            this.maxPoints = maxPoints;
            this.passed = passed;
            this.suggestion = suggestion;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public int getPoints() { return points; }
        public void setPoints(int points) { this.points = points; }

        public int getMaxPoints() { return maxPoints; }
        public void setMaxPoints(int maxPoints) { this.maxPoints = maxPoints; }

        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }

        public String getSuggestion() { return suggestion; }
        public void setSuggestion(String suggestion) { this.suggestion = suggestion; }
    }
}
