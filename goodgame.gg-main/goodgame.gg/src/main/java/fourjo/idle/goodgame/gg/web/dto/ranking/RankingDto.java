package fourjo.idle.goodgame.gg.web.dto.ranking;

import lombok.Data;

@Data
public class RankingDto {
    private int rankingRowNum;
    private int rankingIndex;
    private String gameName;
    private String tagLine;
    private Long summonerLevel;
    private int profileIconId;
    private String queueType;
    private String tier;
    private String rankValue;
    private int leaguePoints;
    private int wins;
    private int losses;
    private String winRate;
    private String summonerId;
    private String puuid;
}

