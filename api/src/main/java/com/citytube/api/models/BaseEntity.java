package com.citytube.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@MappedSuperclass
public class BaseEntity {

    @Column(updatable = false)
    @CreationTimestamp
    //@Schema(description = "Entity creation time")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    //@Schema(description = "Entity update time")
    private LocalDateTime updatedAt;


    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

}