package fourjo.idle.goodgame.gg.web.dto.board;

import lombok.Data;

@Data
public class BoardSearchDTO {

    private int page; // 조회하고자하는 페이지 번호
    private String searchKey;
    private String searchValue;
    private String limit; // Y
    private int count; // 한 페이지 당 표시할 데이터 갯수 // xml mapper에서 사용하는 #{index}, #{count}
    private int index; // 시작행 번호

     public void pageIndex() {
     index = (page-1) * count;

    }
}