package fourjo.idle.goodgame.gg.entity;

import lombok.Data;
import nonapi.io.github.classgraph.json.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "augments")
public class Augment {

    @Id
    private int id;
    private String name;
    private String apiName;
    private String desc;
    private String iconLargeUrl;
    private String iconSmallUrl;
}
