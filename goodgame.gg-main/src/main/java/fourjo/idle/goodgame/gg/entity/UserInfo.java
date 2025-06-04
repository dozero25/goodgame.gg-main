package fourjo.idle.goodgame.gg.entity;

import lombok.Data;
import nonapi.io.github.classgraph.json.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "autocomplete_users")
public class UserInfo {

    @Id
    private String id;

    private String gameName;
    private String tagLine;
    private String puuid;
    private long lastSearchedAt;

}
