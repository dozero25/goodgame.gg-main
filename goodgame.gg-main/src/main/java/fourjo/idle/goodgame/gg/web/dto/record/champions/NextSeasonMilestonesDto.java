package fourjo.idle.goodgame.gg.web.dto.record.champions;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NextSeasonMilestonesDto {
    private Object requireGradeCounts;
    private int rewardMarks;
    private boolean bonus;
    private RewardConfigDto rewardConfig;

}
