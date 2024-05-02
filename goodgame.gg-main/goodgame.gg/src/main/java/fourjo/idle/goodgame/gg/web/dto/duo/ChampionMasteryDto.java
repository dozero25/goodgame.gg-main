package fourjo.idle.goodgame.gg.web.dto.duo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ChampionMasteryDto {

    private long championId;


}
