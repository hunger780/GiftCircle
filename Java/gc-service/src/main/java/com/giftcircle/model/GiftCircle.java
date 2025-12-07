package com.giftcircle.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Data
@Document(collection = "circles")
public class GiftCircle {
    @Id
    private String id;
    private String name;
    private String description;
    private List<String> adminIds = new ArrayList<>();
    private List<String> memberIds = new ArrayList<>();
    private long createdTimestamp;
}
