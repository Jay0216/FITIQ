package com.fitiq.fitiqbackend.DTO;

public class DietPlanAIRequest {

    private String age;
    private String height;
    private String weight;
    private String goal;
    private String fitnessLevel;
    private String injuries;
    private String notes;

    public DietPlanAIRequest() {
    }

    public DietPlanAIRequest(String age, String height, String weight, String goal,
                             String fitnessLevel, String injuries, String notes) {
        this.age = age;
        this.height = height;
        this.weight = weight;
        this.goal = goal;
        this.fitnessLevel = fitnessLevel;
        this.injuries = injuries;
        this.notes = notes;
    }

    public String getAge() {
        return age;
    }

    public void setAge(String age) {
        this.age = age;
    }

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public String getFitnessLevel() {
        return fitnessLevel;
    }

    public void setFitnessLevel(String fitnessLevel) {
        this.fitnessLevel = fitnessLevel;
    }

    public String getInjuries() {
        return injuries;
    }

    public void setInjuries(String injuries) {
        this.injuries = injuries;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
