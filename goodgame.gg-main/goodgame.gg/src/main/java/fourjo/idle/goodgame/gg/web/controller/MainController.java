package fourjo.idle.goodgame.gg.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/main")
    public String main (){return "main/main.html";}

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
