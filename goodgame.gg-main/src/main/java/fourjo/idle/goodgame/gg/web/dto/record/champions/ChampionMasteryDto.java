package fourjo.idle.goodgame.gg.web.dto.record.champions;

import lombok.Data;

import java.util.List;

@Data
public class ChampionMasteryDto {
    private String puuid;
    private long championPointsUntilNextLevel;
    private boolean chestGranted;
    private long championId;
    private long lastPlayTime;
    private int championLevel;
    private int championPoints;
    private long championPointsSinceLastLevel;
    private int markRequiredForNextLevel;
    private int championSeasonMilestone;
    private NextSeasonMilestonesDto nextSeasonMilestone;
    private int tokensEarned;
    private List<String> milestoneGrades;

}
