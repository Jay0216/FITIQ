package com.fitiq.fitiqbackend.DTO;

public class DietLogAIResponse {
    private String calories;
    private String protein;
    private String carbs;
    private String fats;

    public String getCalories() { return calories; }
    public void setCalories(String calories) { this.calories = calories; }

    public String getProtein() { return protein; }
    public void setProtein(String protein) { this.protein = protein; }

    public String getCarbs() { return carbs; }
    public void setCarbs(String carbs) { this.carbs = carbs; }

    public String getFats() { return fats; }
    public void setFats(String fats) { this.fats = fats; }
}