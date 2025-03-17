package fourjo.idle.goodgame.gg.web.dto.ranking;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LeagueListDto {
    private String tier;
    private String name;
    private String queue;
    private List<LeagueItemDto> entries;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LeagueItemDto implements Comparable<LeagueItemDto> {
        private String summonerId;
        private String rank;
        private int leaguePoints;
        private int wins;
        private int losses;

        @Override
        public int compareTo(LeagueItemDto o) {
            return (o.leaguePoints - leaguePoints);
        }
    }
}
