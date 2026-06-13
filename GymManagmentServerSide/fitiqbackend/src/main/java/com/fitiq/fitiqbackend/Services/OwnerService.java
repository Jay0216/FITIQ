package com.fitiq.fitiqbackend.Services;

import com.fitiq.fitiqbackend.Models.Owner;
import com.fitiq.fitiqbackend.Repository.OwnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Optional;

@Service
public class OwnerService {

    @Autowired
    private OwnerRepository ownerRepository;

    // Create Owner (internal / seeding only)
    public Owner createOwner(Owner owner) {
        if (ownerRepository.existsByEmail(owner.getEmail())) {
            throw new RuntimeException("Owner already exists with this email");
        }

        // Hash password using jBCrypt
        String hashed = BCrypt.hashpw(owner.getPassword(), BCrypt.gensalt());
        owner.setPassword(hashed);

        return ownerRepository.save(owner);
    }

    // Login
    public Owner login(String email, String password) {
        Optional<Owner> ownerOptional = ownerRepository.findByEmail(email);

        if (ownerOptional.isEmpty()) {
            throw new RuntimeException("Owner not found");
        }

        Owner owner = ownerOptional.get();

        // Check password using jBCrypt
        if (!BCrypt.checkpw(password, owner.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return owner;
    }

    // Get Owner by Email
    public Owner getByEmail(String email) {
        return ownerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
    }
}