package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "trainer")
public class Trainer {

    @Id
    private String id;

    private String fullname;
    private String phonenumber;
    private String email;
    private String password;

    // specialization
    private String type; 
    // examples: weight_loss, muscle_gain, endurance, general_fitness

    private boolean availableForAppointments;

    private String role = "TRAINER";

    public Trainer() {}

    public Trainer(String fullname, String phonenumber, String email,
                   String password, String type, boolean availableForAppointments) {
        this.fullname = fullname;
        this.phonenumber = phonenumber;
        this.email = email;
        this.password = password;
        this.type = type;
        this.availableForAppointments = availableForAppointments;
    }

    // Getters & Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getPhonenumber() {
        return phonenumber;
    }

    public void setPhonenumber(String phonenumber) {
        this.phonenumber = phonenumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isAvailableForAppointments() {
        return availableForAppointments;
    }

    public void setAvailableForAppointments(boolean availableForAppointments) {
        this.availableForAppointments = availableForAppointments;
    }

    public String getRole() {
        return role;
    }
}
