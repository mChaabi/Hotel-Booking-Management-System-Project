package hotel.hotel_booking.module.room.repository;

import hotel.hotel_booking.module.room.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoomImageRepository extends JpaRepository<RoomImage, UUID> {

    List<RoomImage> findByRoomIdOrderByDisplayOrderAsc(UUID roomId);

    @Modifying
    @Query("UPDATE RoomImage ri SET ri.isPrimary = false WHERE ri.room.id = :roomId")
    void resetPrimaryForRoom(@Param("roomId") UUID roomId);
}