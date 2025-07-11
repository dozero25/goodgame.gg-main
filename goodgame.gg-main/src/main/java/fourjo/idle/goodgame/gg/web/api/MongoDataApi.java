package fourjo.idle.goodgame.gg.web.api;

import fourjo.idle.goodgame.gg.entity.UserInfo;
import fourjo.idle.goodgame.gg.mongoRepository.RiotInfoRepository;
import fourjo.idle.goodgame.gg.web.dto.CMRespDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/data")
@Tag(name = "MongoData Api", description = "MongoData Api 입니다. 몽고 DB의 데이터를 조회하기 위해 만들었습니다.")
public class MongoDataApi {

    private final RiotInfoRepository riotInfoRepository;

    @PostMapping("/user")
    public ResponseEntity<?> getUserInfoByPuuid(@RequestBody Map<String, String> body){
        Optional<UserInfo> optionalUser = riotInfoRepository.findByPuuid(body.get("puuid"));

        if(optionalUser.isEmpty()){
            return ResponseEntity.badRequest()
                    .body(new CMRespDto<>(HttpStatus.BAD_REQUEST.value(), "failed", null));
        }
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", optionalUser));
    }

}
