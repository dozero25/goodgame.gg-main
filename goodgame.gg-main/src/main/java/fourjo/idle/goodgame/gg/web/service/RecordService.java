package fourjo.idle.goodgame.gg.web.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.DuplicateKeyException;
import com.mongodb.ErrorCategory;
import com.mongodb.MongoWriteException;
import fourjo.idle.goodgame.gg.entity.MatchRecord;
import fourjo.idle.goodgame.gg.entity.UserInfo;
import fourjo.idle.goodgame.gg.exception.CustomRiotResponseCodeException;
import fourjo.idle.goodgame.gg.mongoRepository.RiotInfoRepository;
import fourjo.idle.goodgame.gg.web.dto.record.AccountDto;
import fourjo.idle.goodgame.gg.web.dto.record.champions.ChampionMasteryDto;
import fourjo.idle.goodgame.gg.web.dto.record.league.LeagueEntryDto;
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
        AccountDto dto = this.searchSummonerInfoByGameNameAndTagLine(gameName, tagLine);
        if (dto == null) {
            System.out.println("유저 정보 없음");
            return;
        }

        String decodedGameName = gameName.replaceAll("%20", " ");
        String decodedTagLine = tagLine.replaceAll("%20", " ");

        Optional<UserInfo> optionalUser = riotInfoRepository.findUserByGameNameAndTagLine(gameName, tagLine);
        Optional<UserInfo> duplicatePuuidUser = riotInfoRepository.findByPuuid(dto.getPuuid());

        if (duplicatePuuidUser.isPresent() && optionalUser.isEmpty()) {
            System.out.println("동일 puuid가 이미 존재하므로 저장하지 않음");
            return;
        }

        try {
            UserInfo user = optionalUser.orElseGet(UserInfo::new);
            user.setGameName(decodedGameName);
            user.setTagLine(decodedTagLine);
            user.setPuuid(dto.getPuuid());
            user.setLastSearchedAt(System.currentTimeMillis());
            riotInfoRepository.save(user);
        } catch (DuplicateKeyException e) {
            System.out.println("중복 키 오류 발생 - 다른 요청이 먼저 저장함");
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

            Optional<UserInfo> optionalUserInfo = riotInfoRepository.findByPuuid(summonerDto.getPuuid());

            UserInfo userInfo = optionalUserInfo.orElseGet(UserInfo::new);

            userInfo.setPuuid(summonerDto.getPuuid());
            userInfo.setSummonerDto(summonerDto);
            userInfo.setLastSearchedAt(System.currentTimeMillis());

            riotInfoRepository.save(userInfo);

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

            Optional<UserInfo> optionalUserInfo = riotInfoRepository.findByPuuid(puuid);
            UserInfo userInfo = optionalUserInfo.orElseGet(() -> {
                UserInfo newUser = new UserInfo();
                newUser.setPuuid(puuid);
                return newUser;
            });

            List<String> existingList = userInfo.getMatchDtoList();
            if (existingList == null) {
                existingList = new ArrayList<>();
            }

            Set<String> mergedSet = new LinkedHashSet<>(existingList);
            mergedSet.addAll(matchesList);

            userInfo.setMatchDtoList(new ArrayList<>(mergedSet));

            userInfo.setLastSearchedAt(System.currentTimeMillis());

            riotInfoRepository.save(userInfo);

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
        return matchesList;
    }

    public void updateAllMatchRecordsForUser(List<String> matchesList, String puuid) throws IOException {
        Optional<UserInfo> optionalUserInfo = riotInfoRepository.findByPuuid(puuid);
        if (optionalUserInfo.isEmpty()) {
            System.out.println("No user found with puuid: " + puuid);
            return;
        }
        UserInfo userInfo = optionalUserInfo.get();

        List<MatchRecord> existingList = userInfo.getMatchRecordsList();
        if (existingList == null) {
            existingList = new ArrayList<>();
        }

        Map<String, MatchRecord> recordMap = new HashMap<>();
        for (MatchRecord record : existingList) {
            recordMap.put(record.getMatchId(), record);
        }

        for (String matchId : matchesList) {
            MatchDto matchDto = searchMatchDtoFromApi(matchId);
            recordMap.put(matchId, new MatchRecord(matchId, matchDto));
        }

        List<MatchRecord> mergedList = new ArrayList<>(recordMap.values());
        userInfo.setMatchRecordsList(mergedList);
        userInfo.setLastSearchedAt(System.currentTimeMillis());
        riotInfoRepository.save(userInfo);
    }

    private MatchDto searchMatchDtoFromApi(String matchId) throws IOException {
        String apiKey = riotApiKeyDto.getMyKey();
        String url = riotApiKeyDto.getSeverUrlAsia() + "/lol/match/v5/matches/" + matchId + "?api_key=" + apiKey;

        HttpGet request = new HttpGet(url);
        HttpResponse response = httpClient.execute(request);
        riotResponseCodeError(response);

        HttpEntity entity = response.getEntity();
        return objectMapper.readValue(entity.getContent(), new TypeReference<MatchDto>() {});
    }


    public List<LeagueEntryDto> searchLeagueByEncryptedPUUID(String encryptedPUUID){
        List<LeagueEntryDto> leagueEntryList = new ArrayList<>();
        String apiKey = riotApiKeyDto.getMyKey();
        String url = riotApiKeyDto.getServerUrl() + "/lol/league/v4/entries/by-puuid/" + encryptedPUUID + "?api_key=" + apiKey;
        try {
            HttpGet request = new HttpGet(url);
            HttpResponse response = httpClient.execute(request);

            riotResponseCodeError(response);

            HttpEntity entity = response.getEntity();
            leagueEntryList = objectMapper.readValue(entity.getContent(), new TypeReference<>() {});

            Optional<UserInfo> optionalUserInfo = riotInfoRepository.findByPuuid(encryptedPUUID);

            UserInfo userInfo = optionalUserInfo.orElseGet(UserInfo::new);

            userInfo.setLeagueEntryDto(leagueEntryList);
            userInfo.setLastSearchedAt(System.currentTimeMillis());

            riotInfoRepository.save(userInfo);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
        return leagueEntryList;
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

    public List<ChampionMasteryDto> filterChampionMasteryBySearchTerm(List<ChampionMasteryDto> masteryList, String searchInput) {
        if (searchInput == null || searchInput.isEmpty()) {
            return masteryList;
        }

        try {
            int searchId = Integer.parseInt(searchInput);
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
