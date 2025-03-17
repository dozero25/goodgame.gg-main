package fourjo.idle.goodgame.gg.web.api;

import fourjo.idle.goodgame.gg.web.dto.CMRespDto;
import fourjo.idle.goodgame.gg.web.dto.duo.DuoDto;
import fourjo.idle.goodgame.gg.web.dto.duo.DuoSearchDto;
import fourjo.idle.goodgame.gg.web.service.DuoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/duo")
@Tag(name = "DuoApi", description = "듀오찾기 관리 및 출력하는 Api 입니다.")
public class DuoApi {

    @Autowired
    private DuoService duoService;

    @PostMapping("/insert")
    @Operation(summary="듀오 입력",description="듀오 입력에 필요한 데이터를 입력받아 insert합니다")
    public ResponseEntity<CMRespDto<?>> duoInsert(DuoDto duoDto) {


        duoService.duoInsert(duoDto);

        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", true));
    }
    @GetMapping("/search")
    @Operation(summary="듀오 찾기",description="게임타입,티어,포지션으로 듀오 리스트를 검색 가능합니다")
    public ResponseEntity<CMRespDto<?>> duoSearchByQueAndTierAndPosition(DuoSearchDto duoSearchDto) {
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", duoService.duoSearchByQueAndTierAndPosition(duoSearchDto)));
    }
    @GetMapping("/totalCount")
    @Operation(summary="모든 페이지 수 가져오기",description="페이징에 필요한 전체 페이지 수를 가져옵니다")
    public ResponseEntity<CMRespDto<?>> getDuoTotalCount(DuoSearchDto duoSearchDto) {



        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", duoService.getDuoTotalCount(duoSearchDto)));
    }
    @GetMapping("/checkNick")
    @Operation(summary="닉네임 확인",description="듀오 입력할 떄 아이디가 실제로 존재하는지 확인하고 존재하면 0, 없으면 1을 반환합니다")
    public ResponseEntity<CMRespDto<?>> checkNick(DuoDto duoDto) {
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", duoService.checkNick(duoDto)));
    }
}
