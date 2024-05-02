package fourjo.idle.goodgame.gg.web.dto.record.matches;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TeamDto {
    private List<BanDto> bans;
    private ObjectivesDto objectivesDto;
    private int teamId;
    private boolean win;
}
