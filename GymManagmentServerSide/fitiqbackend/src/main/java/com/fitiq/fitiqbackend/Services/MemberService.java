package com.fitiq.fitiqbackend.Services;

import java.util.Base64;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fitiq.fitiqbackend.Models.Member;
import com.fitiq.fitiqbackend.Repository.MemberRepository;
import java.io.ByteArrayOutputStream;
import net.glxn.qrgen.QRCode;

@Service
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }


public Member registerMember(String fullname, String phonenumber, String email, String dateofbirth, String password) {

    if (memberRepository.findByEmail(email).isPresent()) {
        throw new RuntimeException("Email already registered");
    }

    Member member = new Member();
    member.setFullname(fullname);
    member.setPhonenumber(phonenumber);
    member.setEmail(email);
    member.setDateofbirth(dateofbirth);
    member.setPassword(password);
    member.setMembershipId(UUID.randomUUID().toString());
    member.setActive("active"); // Set as active on registration

    // Generate permanent QR
    ByteArrayOutputStream out = QRCode.from(member.getMembershipId())
            .withSize(250, 250)
            .stream();
    String qrBase64 = Base64.getEncoder().encodeToString(out.toByteArray());
    member.setQrCode("data:image/png;base64," + qrBase64);

    return memberRepository.save(member);
}

    // Find member by Membership ID (used for QR scanning)
    public Member findByMembershipId(String membershipId) {
        return memberRepository.findByMembershipId(membershipId).orElse(null);
    }

    // Find member by Email (used for login)
    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email).orElse(null);
    }

    // Optional: Get member by ID
    public Member findById(String id) {
        return memberRepository.findById(id).orElse(null);
    }

    // Optional: Save member (for updates later)
    public Member save(Member member) {
        return memberRepository.save(member);
    }

    public long countMembers() {
      return memberRepository.count();
    }
}