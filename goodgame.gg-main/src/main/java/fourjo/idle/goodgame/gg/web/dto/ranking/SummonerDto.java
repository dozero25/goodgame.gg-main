package fourjo.idle.goodgame.gg.web.dto.ranking;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SummonerDto {

    private String id;
    private String puuid;
    private long summonerLevel;
    private int profileIconId;
    private String name;


}
