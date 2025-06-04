package fourjo.idle.goodgame.gg.mongoRepository;

import fourjo.idle.goodgame.gg.entity.UserInfo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RiotInfoRepository extends MongoRepository<UserInfo, String> {
    Optional<UserInfo> findUserByGameNameAndTagLine(String gameName, String tagLine);
    List<UserInfo> findByGameNameStartingWithOrderByLastSearchedAtDesc(String input);
}
