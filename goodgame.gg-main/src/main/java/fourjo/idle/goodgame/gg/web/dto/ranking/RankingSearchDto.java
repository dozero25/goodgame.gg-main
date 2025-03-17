package fourjo.idle.goodgame.gg.web.dto.ranking;

import lombok.Data;

@Data
public class RankingSearchDto {

    private String queueType;

    private String tier;

    private String gameName;

    private String tagLine;

    private String limit;

    private int index;

    private int count;

    private int page;

    public void setIndex() {
        index = (page-1) * count;
    }

}
