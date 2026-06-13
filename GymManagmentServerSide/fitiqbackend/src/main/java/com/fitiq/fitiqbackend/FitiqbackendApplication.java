package com.fitiq.fitiqbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableMongoRepositories(basePackages = "com.fitiq.fitiqbackend.Repository")
@SpringBootApplication
@EnableScheduling
public class FitiqbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FitiqbackendApplication.class, args);
	}

}
