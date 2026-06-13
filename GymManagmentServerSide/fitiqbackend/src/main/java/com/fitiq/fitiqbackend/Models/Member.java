package com.fitiq.fitiqbackend.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Document(collection = "member")
public class Member {

    @Id
    private String id;
    private String fullname;
    private String phonenumber;
    private String email;
    private String dateofbirth;
    private String password;
    private String membershipId; // This will be encoded into QR
    private String qrCode;       // Permanent QR code (base64)
    // Fingerprint ID stored in sensor
    private Integer fingerprintId;
    private String active;       // Membership status: "active", "inactive", etc.

    public Member() {}

    public Member(String fullname, String phonenumber, String email, String dateofbirth, String password, String membershipId, Integer fingerprintId, String qrCode, String active) {
        this.fullname = fullname;
        this.phonenumber = phonenumber;
        this.email = email;
        this.dateofbirth = dateofbirth;
        this.password = password;
        this.membershipId = membershipId;
        this.qrCode = qrCode;
        this.fingerprintId = fingerprintId;
        this.active = active;
    }

    // Getters and Setters
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

    public String getDateofbirth() {
        return dateofbirth;
    }

    public void setDateofbirth(String dateofbirth) {
        this.dateofbirth = dateofbirth;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getMembershipId() {
        return membershipId;
    }

    public void setMembershipId(String membershipId) {
        this.membershipId = membershipId;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public Integer getFingerprintId() {
        return fingerprintId;
    }

    // Setter
    public void setFingerprintId(Integer fingerprintId) {
        this.fingerprintId = fingerprintId;
    }

    public String getActive() {
        return active;
    }

    public void setActive(String active) {
        this.active = active;
    }
}