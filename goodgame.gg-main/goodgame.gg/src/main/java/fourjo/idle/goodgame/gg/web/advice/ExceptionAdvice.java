package fourjo.idle.goodgame.gg.web.advice;

import fourjo.idle.goodgame.gg.exception.*;
import fourjo.idle.goodgame.gg.web.dto.CMRespDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionAdvice {
    @ExceptionHandler(CustomNullValueException.class)
    public ResponseEntity<?> nullValueError(CustomNullValueException e){
        return ResponseEntity.badRequest()
                .body(new CMRespDto<>(HttpStatus.BAD_REQUEST.value(), "Null Value Error", e.getErrorMap()));
    }

    @ExceptionHandler(CustomSameUserIdException.class)
    public ResponseEntity<?> sameUserIdError(CustomSameUserIdException e){
        return ResponseEntity.badRequest()
                .body(new CMRespDto<>(HttpStatus.BAD_REQUEST.value(), "SameUserId Error", e.getErrorMap()));
    }

    @ExceptionHandler(CustomInputPasswordException.class)
    public ResponseEntity<?> sameUserIdError(CustomInputPasswordException e){
        return ResponseEntity.badRequest()
                .body(new CMRespDto<>(HttpStatus.BAD_REQUEST.value(), "Password Error", e.getErrorMap()));
    }

    @ExceptionHandler(CustomSameNickNameException.class)
    public ResponseEntity<?> sameUserNickNameError(CustomSameNickNameException e){
        return ResponseEntity.badRequest()
                .body(new CMRespDto<>(HttpStatus.BAD_REQUEST.value(), "SameNickName Error", e.getErrorMap()));
    }

    @ExceptionHandler(CustomInputUserGenderException.class)
    public ResponseEntity<?> inputUserGenderError(CustomInputUserGenderException e){
        return ResponseEntity.badRequest()
                .body(new CMRespDto<>(HttpStatus.BAD_REQUEST.value(), "InputUserGender Error", e.getErrorMap()));
    }

    @ExceptionHandler(CustomRiotResponseCodeException.class)
    public ResponseEntity<?> riotResponseCodeException(CustomRiotResponseCodeException e){
        return ResponseEntity.badRequest()
                .body(new CMRespDto<>(HttpStatus.BAD_REQUEST.value(), "riot response Error", e.getErrorMap()));
    }

    @ExceptionHandler(CustomNullReplyValueException.class)
    public ResponseEntity<?> nullReplyValueException(CustomNullReplyValueException e){
        return ResponseEntity.badRequest()
                .body(new CMRespDto<>(HttpStatus.BAD_REQUEST.value(), "null Reply Error", e.getErrorMap()));
    }
}
