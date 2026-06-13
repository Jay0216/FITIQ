package com.fitiq.fitiqbackend.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.fitiq.fitiqbackend.Models.Member;

import java.util.Optional;

@Repository
public interface MemberRepository extends MongoRepository<Member, String> {
    Optional<Member> findByMembershipId(String membershipId);

    Optional<Member> findByEmail(String email);

    Optional<Member> findByFingerprintId(Integer fingerprintId);

}

