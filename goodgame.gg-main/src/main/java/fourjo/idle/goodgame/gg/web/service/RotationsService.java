package fourjo.idle.goodgame.gg.web.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import fourjo.idle.goodgame.gg.web.dto.riotKey.RiotApiKeyDto;
import fourjo.idle.goodgame.gg.web.dto.rotation.ChampionEnum;
import fourjo.idle.goodgame.gg.web.dto.rotation.ChampionInfoDto;
import fourjo.idle.goodgame.gg.web.dto.rotation.RotationsChampionDto;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RotationsService {

    private ObjectMapper objectMapper;
    private final RiotApiKeyDto riotApiKeyDto;
    private final HttpClient httpClient;

    public RotationsService(RiotApiKeyDto riotApiKeyDto) {
        this.riotApiKeyDto = riotApiKeyDto;
        this.objectMapper = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false);
        this.httpClient = HttpClientBuilder.create().build();
    }

    public List<ChampionEnum> rotationsChampion() {
        RotationsChampionDto rotationsChampionDto = new RotationsChampionDto();
        String apiKey = riotApiKeyDto.getMyKey();
        String url = riotApiKeyDto.getServerUrl() + "/lol/platform/v3/champion-rotations/?api_key=" + apiKey;

        try {
            HttpGet request = new HttpGet(url);
            HttpResponse response = httpClient.execute(request);

            HttpEntity entity = response.getEntity();
            rotationsChampionDto = objectMapper.readValue(entity.getContent(), RotationsChampionDto.class);


        } catch (IOException e) {
            e.printStackTrace();
        }

        List<Integer> freeChampionInt = rotationsChampionDto.getFreeChampionIds();
        List<ChampionEnum> freeChampionString = new ArrayList<>();

        for (int i=0; i<freeChampionInt.size(); i++) {
            freeChampionString.add(ChampionEnum.findByKey(freeChampionInt.get(i)));

        }
        return freeChampionString;
    }

    public Map<String, ChampionInfoDto.ChampionData> ChampionInfo(ChampionEnum championEnum) {
        ChampionInfoDto championInfoDto = new ChampionInfoDto();

        try {
            HttpGet request = new HttpGet("https://ddragon.leagueoflegends.com/cdn/15.13.1/data/ko_KR/champion/"+championEnum+".json");
            HttpResponse response = httpClient.execute(request);

            HttpEntity entity = response.getEntity();
            championInfoDto = objectMapper.readValue(entity.getContent(), ChampionInfoDto.class);

        } catch (IOException e) {
            e.printStackTrace();

        }
        Map<String, ChampionInfoDto.ChampionData> championData = championInfoDto.getData();

        return championData;

    }
}
