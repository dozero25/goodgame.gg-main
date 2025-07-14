package fourjo.idle.goodgame.gg.web.api;

import fourjo.idle.goodgame.gg.entity.Augment;
import fourjo.idle.goodgame.gg.mongoRepository.AugmentRepository;
import fourjo.idle.goodgame.gg.web.dto.CMRespDto;
import fourjo.idle.goodgame.gg.web.service.AugmentImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class AugmentApi {

    private final AugmentImportService augmentImportService;
    private final AugmentRepository augmentRepository;

    @PostMapping("/import")
    public ResponseEntity<CMRespDto<?>> importAugments() {
        augmentImportService.importFromJson("src/main/resources/json/communitydragon_augments.json");
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully", null));
    }

    @GetMapping("/api/augments/{id}")
    public ResponseEntity<CMRespDto<?>> getAllAugments(@PathVariable int id){
        Optional<Augment> augmentOpt = augmentRepository.findById(id);
        if (augmentOpt.isPresent()) {
            return ResponseEntity.ok(
                    new CMRespDto<>(HttpStatus.OK.value(), "Successfully", augmentOpt.get()));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new CMRespDto<>(HttpStatus.NOT_FOUND.value(), "Not found", null));
        }
    }
}
