package fourjo.idle.goodgame.gg.web.dto.rotation;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Map;


@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChampionInfoDto {
    private Map<String, ChampionData> data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ChampionData {
        private String name;
        private String title;
        private List<Spells> spells;
        private Passive passive;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Spells {
        private String id;
        private String name;
        private String description;
        private String tooltip;
        private String cooldownBurn;
        private String costBurn;
        private String rangeBurn;
        private SpellImage image;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SpellImage {
        private String full;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Passive {
        private String name;
        private String description;
        private PassiveImage image;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PassiveImage {
        private String full;
    }


}
