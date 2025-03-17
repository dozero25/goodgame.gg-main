package fourjo.idle.goodgame.gg.web.dto.record.matches;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PerkStyleDto {
    private String description;
    private List<PerkStyleSelectionDto> selections;
    private int style;

}
