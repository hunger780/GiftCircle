package com.giftcircle.backend.repository;

import com.giftcircle.backend.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByUserId(String userId);
    List<Event> findByInviteeIdsContains(String userId);
}
