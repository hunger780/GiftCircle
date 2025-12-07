package com.giftcircle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.giftcircle.backend.repository")
public class GiftCircleApplication {

	public static void main(String[] args) {
		SpringApplication.run(GiftCircleApplication.class, args);
	}

}
