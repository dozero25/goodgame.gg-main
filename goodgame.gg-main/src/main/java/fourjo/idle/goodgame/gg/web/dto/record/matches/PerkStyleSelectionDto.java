package fourjo.idle.goodgame.gg.web.dto.record.matches;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PerkStyleSelectionDto {
    private int perk;
    private int var1;
    private int var2;
    private int var3;
}
