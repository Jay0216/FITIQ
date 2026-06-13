package com.fitiq.fitiqbackend.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.fitiq.fitiqbackend.Models.Trainer;


@Repository
public interface TrainerRepository extends MongoRepository<Trainer, String> {

    Trainer findByEmail(String email);

}