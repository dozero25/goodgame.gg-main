package fourjo.idle.goodgame.gg.web.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fourjo.idle.goodgame.gg.repository.RankingRepository;
import fourjo.idle.goodgame.gg.web.dto.ranking.*;
import fourjo.idle.goodgame.gg.web.dto.riotKey.RiotApiKeyDto;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class RankingService {

    @Autowired
    RankingRepository rankingRepository;

    private ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient client = HttpClientBuilder.create().build();

    private final RiotApiKeyDto riotApiKeyDto = new RiotApiKeyDto();

    private final String solo = "RANKED_SOLO_5x5";
    private final String flex = "RANKED_FLEX_SR";

    public LeagueListDto challengerLeaguesByQueue(String queue) {
        LeagueListDto leagueListDto = new LeagueListDto();

        if (queue.equals("solo")) {
            queue = solo;
        } else if (queue.equals("flex")) {
            queue = flex;
        }

        try {
            HttpGet request = new HttpGet(riotApiKeyDto.getServerUrl() + "/lol/league/v4/challengerleagues/by-queue/" + queue + "?api_key=" + riotApiKeyDto.getMykey());
            HttpResponse response = client.execute(request);


            HttpEntity entity = response.getEntity();
            leagueListDto = objectMapper.readValue(entity.getContent(), new TypeReference<>() {});
            Collections.sort(leagueListDto.getEntries());

        } catch (IOException e) {
            e.printStackTrace();
        }
        return leagueListDto;
    }

    public LeagueListDto grandmasterLeaguesByQueue(String queue){
            LeagueListDto leagueListDto = new LeagueListDto();

            if (queue.equals("solo")) {
                queue = solo;
            } else if (queue.equals("flex")) {
                queue = flex;
            }

            try {
                HttpGet request = new HttpGet(riotApiKeyDto.getServerUrl() + "/lol/league/v4/grandmasterleagues/by-queue/" + queue + "?api_key=" + riotApiKeyDto.getMykey());
                HttpResponse response = client.execute(request);

                HttpEntity entity = response.getEntity();
                leagueListDto = objectMapper.readValue(entity.getContent(), new TypeReference<>() {});
                Collections.sort(leagueListDto.getEntries());

            } catch (IOException e){
                e.printStackTrace();
            }
            return leagueListDto;
    }

    public LeagueListDto masterLeaguesByQueue(String queue){
        LeagueListDto leagueListDto = new LeagueListDto();

        if (queue.equals("solo")) {
            queue = solo;
        } else if (queue.equals("flex")) {
            queue = flex;
        }

        try {
            HttpGet request = new HttpGet(riotApiKeyDto.getServerUrl() + "/lol/league/v4/masterleagues/by-queue/" + queue + "?api_key=" + riotApiKeyDto.getMykey());
            HttpResponse response = client.execute(request);

            HttpEntity entity = response.getEntity();
            leagueListDto = objectMapper.readValue(entity.getContent(), new TypeReference<>() {});

            Collections.sort(leagueListDto.getEntries());

        } catch (IOException e){
            e.printStackTrace();
        }
        return leagueListDto;
    }

    public SummonerDto summonerV4BySummonerId(String summonerId) {
        SummonerDto summonerDto = new SummonerDto();

        try {
            HttpGet request = new HttpGet(riotApiKeyDto.getServerUrl() + "/lol/summoner/v4/summoners/" + summonerId + "?api_key=" + riotApiKeyDto.getMykey());
            HttpResponse response = client.execute(request);

            HttpEntity entity = response.getEntity();
            summonerDto = objectMapper.readValue(entity.getContent(), SummonerDto.class);


        } catch (IOException e) {
            e.printStackTrace();
        }
        return summonerDto;
    }

    public AccountDto accountV1ByPuuid(String puuid) {
        AccountDto accountDto = new AccountDto();

        try {
            HttpGet request = new HttpGet(riotApiKeyDto.getSeverUrlAsia() + "/riot/account/v1/accounts/by-puuid/" + puuid + "?api_key=" + riotApiKeyDto.getMykey());
            HttpResponse response = client.execute(request);

            HttpEntity entity = response.getEntity();
            accountDto = objectMapper.readValue(entity.getContent(), AccountDto.class);


        } catch (IOException e) {
            e.printStackTrace();
        }
        return accountDto;
    }

    public List<LeagueEntryDto> entriesLeaguesBy4param(String tier, String division, String queue, int page){
        List<LeagueEntryDto> listLeagueEntryDto = new ArrayList<>();

        if (queue.equals("solo")) {
            queue = solo;
        } else if (queue.equals("flex")) {
            queue = flex;
        }

        try {
            HttpGet request = new HttpGet(riotApiKeyDto.getServerUrl() + "/lol/league/v4/entries/" + queue +"/"+ tier +"/"+ division + "?page=" + page +"&api_key=" + riotApiKeyDto.getMykey());
            HttpResponse response = client.execute(request);

//            riotResponseCodeError(response);

            HttpEntity entity = response.getEntity();
            listLeagueEntryDto = objectMapper.readValue(entity.getContent(), new TypeReference<>() {});

        } catch (IOException e){
            e.printStackTrace();
        }
        return listLeagueEntryDto;
    }

    public int insertRankingLeagueV4(RankingDto insert) {
        return rankingRepository.insertRankingLeagueV4(insert);
    }

    public int updateRankingSummonerV4(RankingDto update) {
        return rankingRepository.updateRankingSummonerV4(update);
    }

    public int updateRankingAccountV1(RankingDto update) {
        return rankingRepository.updateRankingAccountV1(update);
    }

    public List<String> pullSummonerIdList() {
        return rankingRepository.pullSummonerIdList();
    }

    public List<String> pullPuudList() {
        return rankingRepository.pullPuuidList();
    }

    public int truncateTable(){
        return rankingRepository.truncateTable();
    }

    public int insertLowRankingLeagueV4(RankingDto insert) {
        return rankingRepository.insertRankingLeagueV4(insert);
    }

    public int updateLowRankingSummonerV4(RankingDto update) {return rankingRepository.updateRankingSummonerV4(update);}

    public int updateLowRankingAccountV1(RankingDto update) {return rankingRepository.updateRankingAccountV1(update);}

    public List<String> pullLowSummonerIdList() {
        return rankingRepository.pullSummonerIdList();
    }

    public List<String> pullLowPuuidList() {
        return rankingRepository.pullPuuidList();
    }

    public int truncateLowTable(){
        return rankingRepository.truncateTable();
    }

    public List<RankingDto> getRankingList (RankingSearchDto rankingSearchDto) {
        rankingSearchDto.setIndex();
        return rankingRepository.getRankingList(rankingSearchDto);
    }

    public int getRankingTotalCount(RankingSearchDto rankingSearchDto) {
        return rankingRepository.getRankingTotalCount(rankingSearchDto);
    }

    public int checkNick (String summoner){

        int flag = rankingRepository.checkNick (summoner);
        if (flag==0){
            return 0;
        }else {
            return 1;
        }
    }
}