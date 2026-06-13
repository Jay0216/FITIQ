package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "subscription")
public class Subscription {

    @Id
    private String id;
    private String memberId;      // Link to the member
    private String type;          // e.g., "Free Trial", "Monthly", "Annual"
    private Date startDate;
    private Date endDate;
    private boolean active;

    public Subscription() {}

    public Subscription(String memberId, String type, Date startDate, Date endDate, boolean active) {
        this.memberId = memberId;
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.active = active;
    }

    // getters & setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }
    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
