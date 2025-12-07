package com.giftcircle.backend.repository;

import com.giftcircle.backend.model.GiftCircle;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface GiftCircleRepository extends MongoRepository<GiftCircle, String> {
    List<GiftCircle> findByMemberIdsContains(String userId);
}
