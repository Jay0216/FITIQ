package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "dietlog")
public class DietLog {

    @Id
    private String id;

    private String memberId;     // Member who logs the meal
    private String dietPlanId;   // Linked diet plan

    private String mealName;
    private String mealItems;    // Comma-separated items or JSON string

    private int calories;
    private int protein;
    private int carbs;
    private int fats;

    private String date;         // e.g., "Thursday, Mar 19"

    public DietLog() {}

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

    public String getDietPlanId() {
        return dietPlanId;
    }

    public void setDietPlanId(String dietPlanId) {
        this.dietPlanId = dietPlanId;
    }

    public String getMealName() {
        return mealName;
    }

    public void setMealName(String mealName) {
        this.mealName = mealName;
    }

    public String getMealItems() {
        return mealItems;
    }

    public void setMealItems(String mealItems) {
        this.mealItems = mealItems;
    }

    public int getCalories() {
        return calories;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public int getProtein() {
        return protein;
    }

    public void setProtein(int protein) {
        this.protein = protein;
    }

    public int getCarbs() {
        return carbs;
    }

    public void setCarbs(int carbs) {
        this.carbs = carbs;
    }

    public int getFats() {
        return fats;
    }

    public void setFats(int fats) {
        this.fats = fats;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
