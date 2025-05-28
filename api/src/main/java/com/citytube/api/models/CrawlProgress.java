package com.citytube.api.models;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "crawl_progress")
public class CrawlProgress extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id = 1L; // Fixed primary key (singleton row)

    @Column(nullable = false)
    private Long lastMessageId;

    @Column(nullable = false,name = "album_parsed")
    private Long albumParsed;


}

