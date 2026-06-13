package com.fitiq.fitiqbackend.Services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fitiq.fitiqbackend.Models.Trainer;
import com.fitiq.fitiqbackend.Repository.TrainerRepository;

@Service
public class TrainerService {

    private final TrainerRepository trainerRepository;

    public TrainerService(TrainerRepository trainerRepository) {
        this.trainerRepository = trainerRepository;
    }

    // Create trainer (Owner action)
    public Trainer createTrainer(Trainer trainer) {
        return trainerRepository.save(trainer);
    }

    public Trainer findByEmail(String email) {
        return trainerRepository.findByEmail(email);
    }

    public Trainer getTrainerById(String trainerId) {
      return trainerRepository.findById(trainerId).orElse(null);
    }

    public List<Trainer> getAllTrainers() {
       return trainerRepository.findAll();
    }

    public long countTrainers() {
      return trainerRepository.count();
    }
}