package fourjo.idle.goodgame.gg.repository;

import fourjo.idle.goodgame.gg.web.dto.ranking.RankingDto;
import fourjo.idle.goodgame.gg.web.dto.ranking.RankingSearchDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface RankingRepository {

    public int insertRankingLeagueV4(RankingDto insert);

    public int updateRankingSummonerV4(RankingDto update);

    public int updateRankingAccountV1(RankingDto update);

    public List<String> pullSummonerIdList();

    public List<String> pullPuuidList();

    public int truncateTable();


    public int insertLowRankingLeagueV4(RankingDto insert);

    public int updateLowRankingSummonerV4(RankingDto update);

    public int updateLowRankingAccountV1(RankingDto update);

    public List<String> pullLowSummonerIdList();

    public List<String> pullLowPuuidList();

    public int truncateLowTable();



    public List<RankingDto> getRankingList(RankingSearchDto rankingSearchDto);


    public int getRankingTotalCount(RankingSearchDto rankingSearchDto);

    public int checkNick (String checkSummoner);




}