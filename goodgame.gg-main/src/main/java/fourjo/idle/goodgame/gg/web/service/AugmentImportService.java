package fourjo.idle.goodgame.gg.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fourjo.idle.goodgame.gg.entity.Augment;
import fourjo.idle.goodgame.gg.mongoRepository.AugmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AugmentImportService {

    private final AugmentRepository augmentRepository;
    private final String CDN_PREFIX = "https://raw.communitydragon.org/latest/game/";

    public void importFromJson(String filePath){
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(new File(filePath));
            JsonNode augments = root.get("augments");

            for(JsonNode node : augments){
                Augment a = new Augment();
                a.setId(node.get("id").asInt());
                a.setApiName(node.get("apiName").asText());
                a.setName(node.get("name").asText());
                a.setDesc(node.get("desc").asText());

                a.setIconSmallUrl(CDN_PREFIX + node.get("iconSmall").asText());
                a.setIconLargeUrl(CDN_PREFIX + node.get("iconLarge").asText());

                augmentRepository.save(a);
            }

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
