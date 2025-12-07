package com.giftcircle.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Data
@Document(collection = "events")
public class Event {
    @Id
    private String id;
    private String userId;
    private String title;
    private String date;
    private String description;
    private EventType type;
    private List<String> inviteeIds = new ArrayList<>();
    private String status;
    private String visibility;
    
    public enum EventType {
        BIRTHDAY, WEDDING, HOUSEWARMING, BABY_SHOWER, OTHER
    }
}
