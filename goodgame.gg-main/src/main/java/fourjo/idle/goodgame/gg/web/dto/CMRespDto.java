package fourjo.idle.goodgame.gg.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class CMRespDto<T> {

    private int code;
    private String message;
    private T data;
}
