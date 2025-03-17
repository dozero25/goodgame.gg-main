package fourjo.idle.goodgame.gg.web.dto.record.matches;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PerkStatsDto {
    private int defense;
    private int flex;
    private int offense;
}
