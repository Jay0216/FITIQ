package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "fitnessAssessments")
public class FitnessAssessment {

    @Id
    private String id;

    private String memberId;        
    private String assessmentName;  
    private Integer age;
    private Double height;          
    private Double weight;          
    private String fitnessGoal;     
    private String fitnessLevel;    
    private String limitations;     

    private Boolean active = false;

    private Date createdAt;

    // ✅ NEW FIELD: List of Days (Mon, Tue, Wed...)
    private List<String> workoutDays;

    // Constructors
    public FitnessAssessment() {
        this.createdAt = new Date();
    }

    public FitnessAssessment(String memberId, String assessmentName, Integer age, Double height, Double weight,
                             String fitnessGoal, String fitnessLevel, String limitations,
                             List<String> workoutDays) {
        this.memberId = memberId;
        this.assessmentName = assessmentName;
        this.age = age;
        this.height = height;
        this.weight = weight;
        this.fitnessGoal = fitnessGoal;
        this.fitnessLevel = fitnessLevel;
        this.limitations = limitations;
        this.workoutDays = workoutDays;
        this.createdAt = new Date();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getAssessmentName() { return assessmentName; }
    public void setAssessmentName(String assessmentName) { this.assessmentName = assessmentName; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getFitnessGoal() { return fitnessGoal; }
    public void setFitnessGoal(String fitnessGoal) { this.fitnessGoal = fitnessGoal; }

    public String getFitnessLevel() { return fitnessLevel; }
    public void setFitnessLevel(String fitnessLevel) { this.fitnessLevel = fitnessLevel; }

    public String getLimitations() { return limitations; }
    public void setLimitations(String limitations) { this.limitations = limitations; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    // ✅ Getter & Setter for workoutDays
    public List<String> getWorkoutDays() { return workoutDays; }
    public void setWorkoutDays(List<String> workoutDays) { this.workoutDays = workoutDays; }
}