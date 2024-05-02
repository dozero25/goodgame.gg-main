package fourjo.idle.goodgame.gg.web.api;


import fourjo.idle.goodgame.gg.web.dto.CMRespDto;
import fourjo.idle.goodgame.gg.web.dto.rotation.ChampionEnum;
import fourjo.idle.goodgame.gg.web.dto.rotation.ChampionInfoDto;
import fourjo.idle.goodgame.gg.web.service.RotationsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rotations")
@Tag(name ="Rotation Api", description = "로테이션 관련 Api 입니다.")
public class RotationsApi {

    @Autowired RotationsService rotationsService;

    @GetMapping("/rotationsChampion")
    @Operation(summary ="로테이션 챔프 출력", description = "현재 무료 챔프 로페티션을 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> rotationsChampion() {

        List<ChampionEnum> championEnumList = rotationsService.rotationsChampion();

        List<Map<String, ChampionInfoDto.ChampionData>> championDataList = new ArrayList<>();

        for (int i=0; i<championEnumList.size(); i++) {
            championDataList.add(rotationsService.ChampionInfo(championEnumList.get(i))); //Olaf
        }

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", championDataList));
    }



    @GetMapping("/ChampionInfo")
    @Operation(summary ="챔피언 정보 출력", description = "챔피언의 스킬 정보를 가져옵니다.")
    public ResponseEntity<CMRespDto<?>> ChampionInfo(ChampionEnum championEnum) {
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", rotationsService.ChampionInfo(championEnum)));
    }





}
