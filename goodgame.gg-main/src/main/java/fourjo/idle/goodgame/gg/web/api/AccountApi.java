package fourjo.idle.goodgame.gg.web.api;

import fourjo.idle.goodgame.gg.entity.UserMst;
import fourjo.idle.goodgame.gg.web.dto.CMRespDto;
import fourjo.idle.goodgame.gg.web.dto.account.EmpDto;
import fourjo.idle.goodgame.gg.web.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/account")
@Tag(name ="Account Api", description = "Account Api 입니다. 계정 관리에 관한 api가 있습니다.")
public class AccountApi {


    private final AccountService accountService;

    @PostMapping("/register/user")
    @Operation(summary ="회원가입", description = "조건에 맞으면 회원가입이 진행됩니다." )
    public ResponseEntity<CMRespDto<?>> registerUser (@RequestBody UserMst userMst, BindingResult bindingResult){
        accountService.registerUser(userMst);
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", true));
    }

    @GetMapping("/auth/login")
    public String login(@RequestParam(value = "error", required = false)
                            String error, @RequestParam(value = "exception", required = false)
                            String exception, Model model) {
        model.addAttribute("error", error);
        model.addAttribute("exception", exception);
        return "/user/user-login";
    }


    @PostMapping("/register/emp")
    @Operation(summary ="회원가입", description = "조건에 맞으면 회원가입이 진행됩니다." )
    public ResponseEntity<CMRespDto<?>> registerEmp (@RequestBody EmpDto empDto, BindingResult bindingResult){
        accountService.registerEmp(empDto);
        return ResponseEntity.ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully registered", true));
    }

    @GetMapping("/principal")
    @Operation(summary ="권한 확인", description = "로그인할때 권환을 확인합니다." )
    public ResponseEntity<CMRespDto<?>> getPrincipalDetails (@AuthenticationPrincipal Object principal){

        Map<String, Object> userInfo = accountService.extractUserOfOauth2Info(principal);

        if(userInfo == null){
            return ResponseEntity
                    .badRequest()
                    .body(new CMRespDto<>(HttpStatus.BAD_REQUEST.value(), "failed login", null));

        }
        return ResponseEntity
                .ok()
                .body(new CMRespDto<>(HttpStatus.OK.value(), "Successfully data", userInfo));
    }
}
