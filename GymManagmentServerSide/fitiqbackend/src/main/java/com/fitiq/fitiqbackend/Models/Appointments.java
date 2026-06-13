package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "appointments")
public class Appointments {

    @Id
    private String id;

    private String trainerId;
    private String trainerName;
    private String memberId;   // Added memberId

    private String date;       // e.g. "Tuesday, March 24, 2026"
    private String timeSlot;   // e.g. "9:00 AM"

    private String venue = "FITIQ"; // default fixed venue

    private String status; // "In-person", "Completed"

    // Constructors
    public Appointments() {}

    // Constructor including memberId
    public Appointments(String trainerId, String trainerName, String memberId,
                        String date, String timeSlot, String status) {
        this.trainerId = trainerId;
        this.trainerName = trainerName;
        this.memberId = memberId;
        this.date = date;
        this.timeSlot = timeSlot;
        this.status = status;
        this.venue = "FITIQ";
    }

    // Getters & Setters

    public String getId() {
        return id;
    }

    public String getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(String trainerId) {
        this.trainerId = trainerId;
    }

    public String getTrainerName() {
        return trainerName;
    }

    public void setTrainerName(String trainerName) {
        this.trainerName = trainerName;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public String getVenue() {
        return venue;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}