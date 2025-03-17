package fourjo.idle.goodgame.gg.web.api;

import fourjo.idle.goodgame.gg.web.dto.CMRespDto;
import fourjo.idle.goodgame.gg.web.dto.record.AccountDto;
import fourjo.idle.goodgame.gg.web.dto.record.ChampionMasteryDto;
import fourjo.idle.goodgame.gg.web.dto.record.LeagueDto;
import fourjo.idle.goodgame.gg.web.dto.record.matches.MatchDto;
import fourjo.idle.goodgame.gg.web.dto.record.SummonerDto;
import fourjo.idle.goodgame.gg.web.service.RecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/record")
@Tag(name = "Record Api", description = "Record Api 입니다. 전적을 검색하면 해당 소환사의 정보가 나옵니다.")
public class RecordApi {

    @Autowired
    private RecordService recordService;

    private AccountDto accountDto = new AccountDto();
    private SummonerDto summonerDto = new SummonerDto();
    private List<String> matchesList = new ArrayList<>();

    @PostMapping("/search/summoner/{gameNameAndTagLine}")
    @Operation(summary ="Summoner 검색", description = "gameName(String)과 tagLine(String)으로 검색합니다.")
    public ResponseEntity<CMRespDto<?>> searchSummonerInfoByGameNameAndTagLine(@PathVariable("gameNameAndTagLine") String gameNameAndTagLine){

        String[] strArr = gameNameAndTagLine.split("-");

        String gameName = strArr[0];
        String tagLine = "";

        if(strArr.length != 1){
            tagLine = strArr[1];
        }

        gameName = gameName.replaceAll(" ", "%20");
        tagLine = tagLine.replaceAll(" ", "%20");

        accountDto = recordService.searchSummonerInfoByGameNameAndTagLine(gameName, tagLine);

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", accountDto));
    }

    @GetMapping("/get/account/info")
    @Operation(summary ="accountInfo 가져오기", description = "puuid로 account의 정보를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchAccountInfoByPuuid(){

        recordService.searchAccountInfoByPuuid(accountDto.getPuuid());

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", accountDto));
    }

    @GetMapping("/get/summoner/info")
    @Operation(summary ="SummonerInfo 가져오기", description = "puuid로 Summoner의 정보를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchSummonerInfoByEncryptedPUUID(){

        summonerDto =  recordService.searchSummonerInfoByEncryptedPUUID(accountDto.getPuuid());

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", summonerDto));
    }

    @GetMapping("/get/matches")
    @Operation(summary ="Matches List 가져오기", description = "puuid로 Matches 리스트를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchMatchesByPuuid(){

        matchesList = recordService.searchMatchesByPuuid(summonerDto.getPuuid(),0);
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", matchesList));
    }

    @GetMapping("/get/matches/info")
    @Operation(summary ="Matches Info 가져오기", description = "matchesList에서 각각 api에 정보를 가져와서 matchDtoList에 저장합니다.")
    public ResponseEntity<CMRespDto<?>> searchMatchInfoByMatchId(){
        List<MatchDto> matchDtoList = new ArrayList<>();

        for (String index : matchesList){
            matchDtoList.add(recordService.searchMatchInfoByMatchId(index));
        }

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", matchDtoList));
    }

    @GetMapping("/get/league")
    @Operation(summary ="Summoner League List 가져오기", description = "id로 League 리스트를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchLeagueBySummonerName(){


        List<LeagueDto> leagueList = recordService.searchLeagueBySummonerName(summonerDto.getId());

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", leagueList));
    }

    @GetMapping("/get/championMastery")
    @Operation(summary ="championMastery List 가져오기", description = "puuid로 championMastery 리스트를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> searchChampionMasteryByPuuid(){

        List<ChampionMasteryDto> championMasteryList = recordService.searchChampionMasteryByPuuid(summonerDto.getPuuid());

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", championMasteryList));
    }



}
