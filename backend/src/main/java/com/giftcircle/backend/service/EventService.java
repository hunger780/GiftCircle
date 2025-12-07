package com.giftcircle.backend.service;

import com.giftcircle.backend.model.Event;
import com.giftcircle.backend.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> getEventById(String id) {
        return eventRepository.findById(id);
    }
    
    public List<Event> getEventsByCreator(String userId) {
        return eventRepository.findByUserId(userId);
    }
    
    public List<Event> getEventsForUser(String userId) {
        return eventRepository.findByInviteeIdsContains(userId);
    }

    public Event updateEvent(String id, Event event) {
         if (eventRepository.existsById(id)) {
            event.setId(id);
            return eventRepository.save(event);
        }
        return null;
    }

    public void deleteEvent(String id) {
        eventRepository.deleteById(id);
    }
}
