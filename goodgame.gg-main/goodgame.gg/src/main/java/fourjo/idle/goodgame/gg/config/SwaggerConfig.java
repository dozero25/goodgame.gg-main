package fourjo.idle.goodgame.gg.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("goodgmae.gg API")
                        .description("League Of Legend 전적 사이트 프로젝트입니다.")
                        .version("1.0.0"));
    }
}
