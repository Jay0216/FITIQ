package com.fitiq.fitiqbackend.Services;

import org.springframework.stereotype.Service;

import com.fitiq.fitiqbackend.Models.Member;
import com.fitiq.fitiqbackend.Repository.MemberRepository;

@Service
public class MemberFingerprintEnrollService {

    private final MemberRepository memberRepository;

    public MemberFingerprintEnrollService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public Member enrollFingerprint(String membershipId, Integer fingerprintId) {

        Member member = memberRepository
                .findByMembershipId(membershipId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        member.setFingerprintId(fingerprintId);

        return memberRepository.save(member);
    }
}