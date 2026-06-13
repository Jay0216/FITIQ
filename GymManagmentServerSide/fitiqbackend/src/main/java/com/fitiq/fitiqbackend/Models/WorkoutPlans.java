package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "workoutPlans")
public class WorkoutPlans {

    @Id
    private String id;

    private String memberId;            // Member who owns this plan
    private String fitnessAssessmentId; // The fitness profile used to create the plan
    private String trainerId;           // Trainer who created the plan

    private String planTitle;
    private String description;

    private Date startDate;
    private Date endDate;

    private List<String> trainingDays;  // ["MON","TUE","WED"]

    private Boolean active;             // Current active workout plan

    private Date createdAt;

    public WorkoutPlans() {
        this.createdAt = new Date();
        this.active = true;
    }

    public WorkoutPlans(String memberId, String fitnessAssessmentId, String trainerId,
                       String planTitle, String description,
                       Date startDate, Date endDate, List<String> trainingDays) {

        this.memberId = memberId;
        this.fitnessAssessmentId = fitnessAssessmentId;
        this.trainerId = trainerId;
        this.planTitle = planTitle;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.trainingDays = trainingDays;
        this.active = true;
        this.createdAt = new Date();
    }

    // Getters and Setters

    public String getId() { return id; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getFitnessAssessmentId() { return fitnessAssessmentId; }
    public void setFitnessAssessmentId(String fitnessAssessmentId) { this.fitnessAssessmentId = fitnessAssessmentId; }

    public String getTrainerId() { return trainerId; }
    public void setTrainerId(String trainerId) { this.trainerId = trainerId; }

    public String getPlanTitle() { return planTitle; }
    public void setPlanTitle(String planTitle) { this.planTitle = planTitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public List<String> getTrainingDays() { return trainingDays; }
    public void setTrainingDays(List<String> trainingDays) { this.trainingDays = trainingDays; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Date getCreatedAt() { return createdAt; }
}