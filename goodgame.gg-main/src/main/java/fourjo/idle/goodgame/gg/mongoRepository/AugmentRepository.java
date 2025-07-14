package fourjo.idle.goodgame.gg.mongoRepository;

import fourjo.idle.goodgame.gg.entity.Augment;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AugmentRepository extends MongoRepository<Augment, Integer> {

}
