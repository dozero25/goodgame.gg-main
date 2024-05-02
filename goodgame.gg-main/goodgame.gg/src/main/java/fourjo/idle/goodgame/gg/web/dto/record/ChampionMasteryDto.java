package fourjo.idle.goodgame.gg.web.dto.record;

import lombok.Data;

@Data
public class ChampionMasteryDto {
    private String puuid;
    private long championPointsUntilNextLevel;
    private boolean chestGranted;
    private long championId;
    private long lastPlayTime;
    private int championLevel;
    private String summonerId;
    private int championPoints;
    private long championPointsSinceLastLevel;
    private int tokensEarned;

}
