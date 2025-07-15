package fourjo.idle.goodgame.gg.web.api;

import fourjo.idle.goodgame.gg.entity.MatchRecord;
import fourjo.idle.goodgame.gg.entity.UserInfo;
import fourjo.idle.goodgame.gg.mongoRepository.RiotInfoRepository;
import fourjo.idle.goodgame.gg.web.dto.CMRespDto;
import fourjo.idle.goodgame.gg.web.dto.record.AccountDto;
import fourjo.idle.goodgame.gg.web.dto.record.champions.ChampionMasteryDto;
import fourjo.idle.goodgame.gg.web.dto.record.league.LeagueEntryDto;
import fourjo.idle.goodgame.gg.web.dto.record.SummonerDto;
import fourjo.idle.goodgame.gg.web.service.RecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/record")
@Tag(name = "Record Api", description = "Record Api 입니다. 전적을 검색하면 해당 소환사의 정보가 나옵니다.")
public class RecordApi {


    private final RecordService recordService;
    private final RiotInfoRepository riotInfoRepository;

    private AccountDto accountDto = new AccountDto();
    private SummonerDto summonerDto = new SummonerDto();
    private List<String> matchesList = new ArrayList<>();

    @GetMapping("/auto/users")
    public ResponseEntity<CMRespDto<List<UserInfo>>> autocomplete(@RequestParam String input){
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", recordService.getAutoCompleteResults(input)));
    }

    @PostMapping("/user/store")
    @Operation(summary ="MongoDB 저장", description = "MongoDB에 직접 입력해서 저장할 수 있습니다.")
    public ResponseEntity<CMRespDto<?>> storeUser(@RequestParam String gameName, @RequestParam String tagLine){
        recordService.saveOrUpdateAutoCompleteUser(gameName, tagLine);
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", null));
    }

    @PostMapping("/search/summoner/{gameNameAndTagLine}")
    @Operation(summary ="Summoner 검색", description = "gameName(String)과 tagLine(String)으로 검색합니다.")
    public ResponseEntity<CMRespDto<?>> searchSummonerInfoByGameNameAndTagLine(@PathVariable("gameNameAndTagLine") String gameNameAndTagLine){
        String[] strArr = gameNameAndTagLine.split("~");
        String gameName = strArr[0];
        String tagLine = (strArr.length > 1) ? strArr[1] : "";

        gameName = gameName.replaceAll(" ", "%20");
        tagLine = tagLine.replaceAll(" ", "%20");

        if ("kr1".equalsIgnoreCase(tagLine)) {
            tagLine = "KR1";
        }

        accountDto = recordService.searchSummonerInfoByGameNameAndTagLine(gameName, tagLine);
        recordService.saveOrUpdateAutoCompleteUser(gameName, tagLine);
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", accountDto));
    }

    @GetMapping("/get/account/info")
    @Operation(summary ="accountInfo 가져오기", description = "puuid로 account의 정보를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchAccountInfoByPuuid(){

        accountDto = recordService.searchAccountInfoByPuuid(accountDto.getPuuid());

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", accountDto));
    }

    @GetMapping("/get/summoner/info")
    @Operation(summary ="SummonerInfo 가져오기", description = "puuid로 Summoner의 정보를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchSummonerInfoByEncryptedPUUID(){

        summonerDto =  recordService.searchSummonerInfoByEncryptedPUUID(accountDto.getPuuid());
        List<LeagueEntryDto> leagueEntryDTO = recordService.searchLeagueByEncryptedPUUID(accountDto.getPuuid());
        List<ChampionMasteryDto> championMasteryList = recordService.searchChampionMasteryByPuuid(accountDto.getPuuid(), null, null, null);
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", summonerDto));
    }

    @GetMapping("/get/matches")
    @Operation(summary ="Matches List 가져오기", description = "puuid로 Matches 리스트를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchMatchesByPuuid(@RequestParam int start, String puuid) throws IOException {

        matchesList = recordService.searchMatchesByPuuid(puuid, start);

        Optional<UserInfo> optionalUserInfo = riotInfoRepository.findByPuuid(puuid);
        if (optionalUserInfo.isEmpty()) {
            // 유저 없으면 저장할 수 없으니 그냥 반환
            return ResponseEntity.ok(new CMRespDto<>(HttpStatus.OK.value(), "No user info found", matchesList));
        }
        UserInfo userInfo = optionalUserInfo.get();
        List<MatchRecord> storedRecords = userInfo.getMatchRecordsList();

        boolean anyMatchExists = storedRecords != null && storedRecords.stream()
                .anyMatch(record -> matchesList.contains(record.getMatchId()));

        if (anyMatchExists) {
            // 하나라도 있으면 10개 모두 저장/업데이트
            recordService.updateAllMatchRecordsForUser(matchesList, puuid);
        } else {
            System.out.println("No existing match records found, skipping update.");
        }
        
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", matchesList));
    }

    @GetMapping("/get/matches/info")
    @Operation(summary ="Matches Info 가져오기", description = "matchesList에서 각각 api에 정보를 가져와서 matchDtoList에 저장합니다.")
    public ResponseEntity<CMRespDto<?>> searchMatchInfoByMatchId(String puuid) throws IOException {

        List<MatchRecord> matchRecordList = new ArrayList<>();
        recordService.updateAllMatchRecordsForUser(matchesList, puuid);

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", matchRecordList));
    }

    @GetMapping("/get/league")
    @Operation(summary ="Summoner League List 가져오기", description = "puuid로 League 리스트를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchLeagueBySummonerName(@RequestParam String puuid){
        List<LeagueEntryDto> leagueEntryDTO = recordService.searchLeagueByEncryptedPUUID(puuid);

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", leagueEntryDTO));
    }

    @GetMapping("/get/championMastery")
    @Operation(summary ="championMastery List 가져오기", description = "puuid로 championMastery 리스트를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchChampionMasteryByPuuid(@RequestParam(required = false) String sortBy, @RequestParam(required = false) String order, @RequestParam(required = false) String search){

        List<ChampionMasteryDto> championMasteryList = recordService.searchChampionMasteryByPuuid(summonerDto.getPuuid(), sortBy, order, search);

        if (search != null && !search.isEmpty()) {
            championMasteryList = recordService.filterChampionMasteryBySearchTerm(championMasteryList, search);
        }

        if(sortBy != null){
            Comparator<ChampionMasteryDto> comparator = null;

            switch (sortBy) {
                case "level":
                    comparator = Comparator.comparing(ChampionMasteryDto::getChampionLevel);
                    break;
                case "points":
                    comparator = Comparator.comparing(ChampionMasteryDto::getChampionPoints);
                    break;
            }

            if(comparator != null){
                if(order.equals("desc")){
                    comparator = comparator.reversed();
                }
                championMasteryList.sort(comparator);
            }
        }
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", championMasteryList));
    }
}
