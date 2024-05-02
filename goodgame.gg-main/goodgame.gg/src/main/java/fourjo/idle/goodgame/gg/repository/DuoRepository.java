package fourjo.idle.goodgame.gg.repository;


import fourjo.idle.goodgame.gg.web.dto.duo.DuoDto;
import fourjo.idle.goodgame.gg.web.dto.duo.DuoSearchDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DuoRepository {

    public int duoInsert(DuoDto duoDto);
    public List<DuoDto> duoSearchByQueAndTierAndPosition(DuoSearchDto duoSearchDto);

    public int getDuoTotalCount(DuoSearchDto duoSearchDto);


}
