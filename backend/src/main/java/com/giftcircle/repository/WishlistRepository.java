package com.giftcircle.backend.repository;

import com.giftcircle.backend.model.WishlistItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface WishlistRepository extends MongoRepository<WishlistItem, String> {
    List<WishlistItem> findByUserId(String userId);
    List<WishlistItem> findByCircleId(String circleId);
    List<WishlistItem> findByEventId(String eventId);
}
