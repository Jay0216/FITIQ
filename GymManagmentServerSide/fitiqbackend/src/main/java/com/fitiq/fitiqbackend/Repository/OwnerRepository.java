package com.fitiq.fitiqbackend.Repository;

import com.fitiq.fitiqbackend.Models.Owner;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerRepository extends MongoRepository<Owner, String> {

    Optional<Owner> findByEmail(String email);

    boolean existsByEmail(String email);

    Owner findTopByOrderByIdAsc();
}
