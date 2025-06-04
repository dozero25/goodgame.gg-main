package fourjo.idle.goodgame.gg.web.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.DuplicateKeyException;
import fourjo.idle.goodgame.gg.entity.UserInfo;
import fourjo.idle.goodgame.gg.exception.CustomRiotResponseCodeException;
import fourjo.idle.goodgame.gg.mongoRepository.RiotInfoRepository;
import fourjo.idle.goodgame.gg.web.dto.record.AccountDto;
import fourjo.idle.goodgame.gg.web.dto.record.champions.ChampionMasteryDto;
import fourjo.idle.goodgame.gg.web.dto.record.LeagueDto;
import fourjo.idle.goodgame.gg.web.dto.record.matches.MatchDto;
import fourjo.idle.goodgame.gg.web.dto.record.SummonerDto;
import fourjo.idle.goodgame.gg.web.dto.riotKey.RiotApiKeyDto;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecordService {

    private ObjectMapper objectMapper;
    private final RiotApiKeyDto riotApiKeyDto;
    private final HttpClient httpClient;

    private final RiotInfoRepository riotInfoRepository;

    public RecordService(RiotApiKeyDto riotApiKeyDto, RiotInfoRepository riotInfoRepository) {
        this.riotApiKeyDto = riotApiKeyDto;
        this.riotInfoRepository = riotInfoRepository;
        this.objectMapper = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false);
        this.httpClient = HttpClientBuilder.create().build();
    }
    public List<UserInfo> getAutoCompleteResults(String input){
        return riotInfoRepository.findByGameNameStartingWithOrderByLastSearchedAtDesc(input);
    }

    public void saveOrUpdateAutoCompleteUser(String gameName, String tagLine){
        Optional<UserInfo> searchUsers = riotInfoRepository.findUserByGameNameAndTagLine(gameName, tagLine);

        if (searchUsers.isEmpty()) {
            UserInfo user = new UserInfo();
            user.setGameName(gameName);
            user.setTagLine(tagLine);
            user.setLastSearchedAt(System.currentTimeMillis());
            riotInfoRepository.save(user);
        } else {
            UserInfo user = searchUsers.get();
            user.setLastSearchedAt(System.currentTimeMillis());
            riotInfoRepository.save(user);
        }
    }

    public AccountDto searchSummonerInfoByGameNameAndTagLine(String gameName, String tagLine){
        AccountDto accountDto = new AccountDto();
        String apiKey = riotApiKeyDto.getMyKey();
        String url = riotApiKeyDto.getSeverUrlAsia() + "/riot/account/v1/accounts/by-riot-id/" + gameName+"/"+tagLine+ "?api_key=" + apiKey;

        try {
            HttpGet request = new HttpGet(url);
            HttpResponse response = httpClient.execute(request);

            riotResponseCodeError(response);

            HttpEntity entity = response.getEntity();
            accountDto = objectMapper.readValue(entity.getContent(), AccountDto.class);

        } catch (IOException e){
            logError(e);
            return null;
        }
        return accountDto;
    }

    public AccountDto searchAccountInfoByPuuid(String puuid){
        AccountDto accountDto = new AccountDto();
        String apiKey = riotApiKeyDto.getMyKey();
        String url = riotApiKeyDto.getSeverUrlAsia() + "/riot/account/v1/accounts/by-puuid/" + puuid+ "?api_key=" + apiKey;

        try {
            HttpGet request = new HttpGet(url);
            HttpResponse response = httpClient.execute(request);

            riotResponseCodeError(response);

            HttpEntity entity = response.getEntity();
            accountDto = objectMapper.readValue(entity.getContent(), AccountDto.class);

        } catch (IOException e){
            e.printStackTrace();
            return null;
        }
        return accountDto;
    }

    public SummonerDto searchSummonerInfoByEncryptedPUUID(String encryptedPUUID){
        SummonerDto summonerDto = new SummonerDto();
        String apiKey = riotApiKeyDto.getMyKey();
        String url = riotApiKeyDto.getServerUrl() + "/lol/summoner/v4/summoners/by-puuid/" + encryptedPUUID + "?api_key=" + apiKey;

        try {
            HttpGet request = new HttpGet(url);
            HttpResponse response = httpClient.execute(request);

            riotResponseCodeError(response);

            HttpEntity entity = response.getEntity();
            summonerDto = objectMapper.readValue(entity.getContent(), SummonerDto.class);

        } catch (IOException e){
            e.printStackTrace();
            return null;
        }
        return summonerDto;
    }

    public List<String> searchMatchesByPuuid (String puuid, int minCount){
        List<String> matchesList = new ArrayList<>();
        String apiKey = riotApiKeyDto.getMyKey();
        String url = riotApiKeyDto.getSeverUrlAsia() + "/lol/match/v5/matches/by-puuid/"+puuid+"/ids?start="+minCount+"&count="+(minCount+9)+"&api_key=" + apiKey;

        try {
            HttpGet request = new HttpGet(url);
            HttpResponse response = httpClient.execute(request);

            riotResponseCodeError(response);

            HttpEntity entity = response.getEntity();

            matchesList = objectMapper.readValue(entity.getContent(), new TypeReference<>() {});

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
        return matchesList;
    }

    public MatchDto searchMatchInfoByMatchId (String matchId){
        MatchDto matchDto = new MatchDto();
        String apiKey = riotApiKeyDto.getMyKey();
        String url = riotApiKeyDto.getSeverUrlAsia() + "/lol/match/v5/matches/"+matchId+"?api_key=" + apiKey;

        try {
            HttpGet request = new HttpGet(url);
            HttpResponse response = httpClient.execute(request);

            riotResponseCodeError(response);

            HttpEntity entity = response.getEntity();

            matchDto = objectMapper.readValue(entity.getContent(), new TypeReference<>() {});

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
        return matchDto;
    }

    public List<LeagueDto> searchLeagueBySummonerName(String enCodeSummonerName){
        List<LeagueDto> leagueList = new ArrayList<LeagueDto>();
        String apiKey = riotApiKeyDto.getMyKey();
        String url = riotApiKeyDto.getServerUrl() + "/lol/league/v4/entries/by-summoner/" + enCodeSummonerName + "?api_key=" + apiKey;

        try {
            HttpGet request = new HttpGet(url);
            HttpResponse response = httpClient.execute(request);

            riotResponseCodeError(response);

            HttpEntity entity = response.getEntity();
            leagueList = objectMapper.readValue(entity.getContent(), new TypeReference<>() {});
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
        return leagueList;
    }

    public List<ChampionMasteryDto> searchChampionMasteryByPuuid(String puuid, String sortBy, String order, String search){
        List<ChampionMasteryDto> championMasteryList = new ArrayList<>();
        String apiKey = riotApiKeyDto.getMyKey();
        String url = riotApiKeyDto.getServerUrl() + "/lol/champion-mastery/v4/champion-masteries/by-puuid/" + puuid + "?api_key=" + apiKey;

        try {
            HttpGet request = new HttpGet(url);
            HttpResponse response = httpClient.execute(request);

            riotResponseCodeError(response);

            HttpEntity entity = response.getEntity();
            championMasteryList = objectMapper.readValue(entity.getContent(), new TypeReference<>() {});
        } catch (IOException e){
            e.printStackTrace();
            return null;
        }
        return championMasteryList;
    }

    public List<ChampionMasteryDto> filterChampionMasteryBySearchTerm(List<ChampionMasteryDto> masteryList, String searchTerm) {
        if (searchTerm == null || searchTerm.isEmpty()) {
            return masteryList;
        }

        try {
            int searchId = Integer.parseInt(searchTerm);
            return masteryList.stream()
                    .filter(mastery -> mastery.getChampionId() == searchId)
                    .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            return masteryList;
        }
    }

    public void riotResponseCodeError(HttpResponse response){
        int code = response.getStatusLine().getStatusCode();
        if(code != 200){
            Map<String, Integer> errorMap = new HashMap<>();
            errorMap.put("Riot Response Code", code);

            throw new CustomRiotResponseCodeException(errorMap);
        }
    }
    private void logError(Exception e) {
    }

}
