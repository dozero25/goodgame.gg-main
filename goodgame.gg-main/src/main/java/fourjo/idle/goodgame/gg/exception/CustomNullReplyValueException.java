package fourjo.idle.goodgame.gg.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@AllArgsConstructor
@Getter
public class CustomNullReplyValueException extends RuntimeException{
    private Map<String, String> errorMap;
}
