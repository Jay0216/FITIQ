package com.fitiq.fitiqbackend.DTO;

public class DietPlanAIResponse {

    private String title;
    private String description;
    private String goal;
    private String dailyCalorieTarget;
    private String proteinTarget;
    private String carbTarget;
    private String fatTarget;

    public DietPlanAIResponse() {
    }

    public DietPlanAIResponse(String title, String description, String goal,
                              String dailyCalorieTarget, String proteinTarget,
                              String carbTarget, String fatTarget) {
        this.title = title;
        this.description = description;
        this.goal = goal;
        this.dailyCalorieTarget = dailyCalorieTarget;
        this.proteinTarget = proteinTarget;
        this.carbTarget = carbTarget;
        this.fatTarget = fatTarget;
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
