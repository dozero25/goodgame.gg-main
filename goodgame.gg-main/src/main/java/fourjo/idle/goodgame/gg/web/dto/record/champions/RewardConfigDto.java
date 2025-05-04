package fourjo.idle.goodgame.gg.web.dto.record.champions;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RewardConfigDto {
    private String rewardValue;
    private String rewardType;
    private int maximumReward;
}
