package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "dailySessions")
public class DailySessions {

    @Id
    private String id;

    // ── Foreign keys
    private String memberId;  // Links to the Member
    private String planId;    // Links to the WorkoutPlan

    // ── Session details
    private String sessionTitle;
    private String focusArea; // e.g., "Chest & Triceps"
    private int weekNumber;   // 1, 2, 3
    private String day;
    private String warmup;
    private String cooldown;
    private String duration;  // e.g., "45 min"

    // ── Exercises array
    private List<Exercise> exercises;

    // ── Constructors
    public DailySessions() {}

    public DailySessions(String memberId, String planId, String sessionTitle, String focusArea,
                         int weekNumber, String day, String warmup, String cooldown, String duration, List<Exercise> exercises) {
        this.memberId = memberId;
        this.planId = planId;
        this.sessionTitle = sessionTitle;
        this.focusArea = focusArea;
        this.weekNumber = weekNumber;
        this.day = day;
        this.warmup = warmup;
        this.cooldown = cooldown;
        this.duration = duration;
        this.exercises = exercises;
    }

    // ── Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }

    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }

    public String getFocusArea() { return focusArea; }
    public void setFocusArea(String focusArea) { this.focusArea = focusArea; }

    public int getWeekNumber() { return weekNumber; }
    public void setWeekNumber(int weekNumber) { this.weekNumber = weekNumber; }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public String getWarmup() { return warmup; }
    public void setWarmup(String warmup) { this.warmup = warmup; }

    public String getCooldown() { return cooldown; }
    public void setCooldown(String cooldown) { this.cooldown = cooldown; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public List<Exercise> getExercises() { return exercises; }
    public void setExercises(List<Exercise> exercises) { this.exercises = exercises; }

    // ── Inner Exercise class
    public static class Exercise {
        private String name;
        private String sets;
        private String reps;
        private String rest;
        private String notes;

        public Exercise() {}

        public Exercise(String name, String sets, String reps, String rest, String notes) {
            this.name = name;
            this.sets = sets;
            this.reps = reps;
            this.rest = rest;
            this.notes = notes;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getSets() { return sets; }
        public void setSets(String sets) { this.sets = sets; }

        public String getReps() { return reps; }
        public void setReps(String reps) { this.reps = reps; }

        public String getRest() { return rest; }
        public void setRest(String rest) { this.rest = rest; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}