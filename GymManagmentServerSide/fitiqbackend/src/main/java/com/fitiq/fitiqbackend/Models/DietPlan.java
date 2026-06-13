package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "dietplan")
public class DietPlan {

    @Id
    private String id;

    private String memberId; // The member this diet plan belongs to
    private String fitnessAssessmentId; // Link to the member's assessment
    private String trainerId; // Link to the trainer who created this plan

    private String title;
    private String description;
    private String goal;
    private String startDate;
    private String endDate;
    private String dailyCalorieTarget;
    private String proteinTarget;
    private String carbTarget;
    private String fatTarget;

    public DietPlan() {}

    // ── Getters and Setters ──
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getFitnessAssessmentId() {
        return fitnessAssessmentId;
    }

    public void setFitnessAssessmentId(String fitnessAssessmentId) {
        this.fitnessAssessmentId = fitnessAssessmentId;
    }

    public String getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(String trainerId) {
        this.trainerId = trainerId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getDailyCalorieTarget() {
        return dailyCalorieTarget;
    }

    public void setDailyCalorieTarget(String dailyCalorieTarget) {
        this.dailyCalorieTarget = dailyCalorieTarget;
    }

    public String getProteinTarget() {
        return proteinTarget;
    }

    public void setProteinTarget(String proteinTarget) {
        this.proteinTarget = proteinTarget;
    }

    public String getCarbTarget() {
        return carbTarget;
    }

    public void setCarbTarget(String carbTarget) {
        this.carbTarget = carbTarget;
    }

    public String getFatTarget() {
        return fatTarget;
    }

    public void setFatTarget(String fatTarget) {
        this.fatTarget = fatTarget;
    }
}