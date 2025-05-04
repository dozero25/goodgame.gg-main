package fourjo.idle.goodgame.gg.web.controller;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/main")
    public String main (Model model){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if(auth instanceof UsernamePasswordAuthenticationToken userToken){
            UserDetails userDetails = (UserDetails) userToken.getPrincipal();
            String username = userDetails.getUsername();
            model.addAttribute("loginStatus", "일반 로그인됨");
            model.addAttribute("username", username);
            model.addAttribute("type", "일반 로그인");

        } else if(auth instanceof OAuth2AuthenticationToken oauthToken){
            OAuth2User oAuth2User = oauthToken.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            model.addAttribute("loginStatus", "OAuth2 로그인됨");
            model.addAttribute("username", email);
            model.addAttribute("type", "소셜 로그인");

        } else {
            model.addAttribute("username", "게스트");
            model.addAttribute("type", "인증되지 않음");
        }
        return "main/main.html";
    }

    @GetMapping("/record")
    public String record(){
        return "record/record";
    }

    @GetMapping("/record/{gameNameAndTagLine}")
    public String recordSearch(){
        return "record/record";
    }

    @GetMapping("/ranking")
    public String ranking () {return "ranking/main";}

    @GetMapping("/duo")
    public String duo(){return "duo/main";}

    @GetMapping("/login")
    public String login(){
        return "login/login";
    }

    @GetMapping("/loginError")
    public String loginError(){
        return "login/loginError";
    }

    @GetMapping("/lolbti")
    public String lolbti(){
        return "lolbti/lolbti";
    }

    @GetMapping("/board")
    public String board(){return "board/main";}

    @GetMapping("/board/selectOne")
    public String boardList(){return "board/selectOne";}

    @GetMapping("/board/insert")
    public String boardInsert(){return "board/insert";}

    @GetMapping("/board/update")
    public String boardUpdate(){return "board/update";}

    @GetMapping("/mypage")
    public String myPageMain(){return "/mypage/main.html";}

    @GetMapping("/mypage/delete")
    public String myPageDelete(){return "/mypage/delete.html";}





}
