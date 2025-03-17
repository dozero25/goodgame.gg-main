package fourjo.idle.goodgame.gg.web.dto.mypage;


import lombok.Data;

@Data
public class ReplySearchDTO {
    private int userIndex;

    private String limit;
    private int count;
    private int page;
    private int index;

    public void setIndex(){
        index = (page-1) * count;
    }
}
