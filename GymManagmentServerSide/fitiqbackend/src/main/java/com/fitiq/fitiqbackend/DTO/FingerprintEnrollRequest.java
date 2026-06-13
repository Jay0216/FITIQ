package com.fitiq.fitiqbackend.DTO;

public class FingerprintEnrollRequest {

    private String membershipId;
    private Integer fingerprintId;

    public String getMembershipId() {
        return membershipId;
    }

    public void setMembershipId(String membershipId) {
        this.membershipId = membershipId;
    }

    public Integer getFingerprintId() {
        return fingerprintId;
    }

    public void setFingerprintId(Integer fingerprintId) {
        this.fingerprintId = fingerprintId;
    }
}