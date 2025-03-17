package fourjo.idle.goodgame.gg.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@AllArgsConstructor
@Getter
public class CustomSameUserIdException extends RuntimeException{
    private Map<String, String> errorMap;
}
