
let ddragonUrl = "https://ddragon.leagueoflegends.com/cdn";


const mySwiper = new Swiper('.swiper-container', {

    direction: 'horizontal',
    createElements: true,
    preloadImages: false,
    lazy: true,


    spaceBetween: 24,
    slideToClickedSlide: true,


    autoplay: {
        delay: 2000,
        disableOnInteraction: false
    },

    pagination: {
        el: '.swiper-pagination-pointer',
        clickable:true,
        type: 'bullets',


    },


    on: {
        init: function () {

            this.slides.forEach((slide, index) => {
                slide.style.width = index === 0 ? "518px" : "180px";
            });
        },
        slideChange: function () {

            this.slides.forEach((slide, index) => {
                slide.style.width = index === this.activeIndex ? "518px" : "180px";
            });
            var translateValue = 204;

            this.wrapperEl.style.transform = `translate3d(-${(translateValue * this.activeIndex)}px, 0px, 0px)`;
        },
    },
});


mySwiper.slides.forEach(slide => {
    slide.addEventListener('mouseenter', () => {
        mySwiper.autoplay.stop();
    });
    slide.addEventListener('mouseleave', () => {
        mySwiper.autoplay.start();
    });
});




class RotationsApi {
    static #instance = null;
    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new RotationsApi();
        }
        return this.#instance;
    }

    getRotationsChampion() {
        let returnData = null;

        $.ajax({
            async : false,
            type: "get",
            url: `http://localhost:8000/api/rotations/rotationsChampion`,
            dataType: "json",
            success : response => {
                returnData = response.data;
            },
            error: error => {
                console.log(error);
            }
        });
        return returnData;
    }




}

class RotationsService {
    static #instance = null;

    static getInstance() {
        if (this.#instance == null) {
            this.#instance = new RotationsService();
        }
        return this.#instance;
    }


    loadRotationsChampion() {
        const responseData = RotationsApi.getInstance().getRotationsChampion();
        const swiperSlide = document.querySelectorAll('.swiper-slide')


        swiperSlide.forEach((slide, i) => {
            let championInfoList = responseData[i];
            let championKey = Object.keys(championInfoList)[0]; //리스트 i번째 맵에 0번 키 (리스트 개당 오브젝트하나)
            let championInfo = championInfoList[championKey];
             championInfo.spells.forEach((spell, j) => {
                //툴팁 정리
                spell.tooltip = spell.tooltip.replace(/{{.*?}}/g, '[?]');
                let tooltip = spell.tooltip;
                const lastIndex = tooltip.lastIndexOf('<br />');

                if (lastIndex !== -1) {
                    tooltip = tooltip.substring(0, lastIndex) + '  ' + tooltip.substring(lastIndex + 6);
                }

                spell.tooltip = tooltip;
                championInfo.spells[j].tooltip = spell.tooltip;
            });
                slide.innerHTML = `
                        <div class="image-column">
                            <img src="${ddragonUrl}/img/champion/loading/${championKey}_0.jpg">
                            <h3 class="mini-Name">${championInfo.name}</h3>
                       </div>
                       <div class="text-column">
                            <div class="champion-name">
                                   ${championInfo.name}
                                <span class="champion-title">${championInfo.title}</span>
                            </div>
                            <div class="grid-row">
                                <img class="spells" src="${ddragonUrl}/14.8.1/img/passive/${championInfo.passive.image.full}">
                                ${championInfo.passive.name}
                                <div class="description-container">
                                    <div class="d-name">${championInfo.passive.name}</div>
                                    <br>
                                    <div>${championInfo.passive.description}</div>
                                </div>
                            </div>
                            <div class="grid-row">
                                <img class="spells" src="${ddragonUrl}/14.8.1/img/spell/${championInfo.spells[0].image.full}">
                                ${championInfo.spells[0].name}
                                <div class="description-container">
                                    <div class="d-name">${championInfo.spells[0].name}</div>
         
                                    <div class="d-info">재사용 대기시간(초) : ${championInfo.spells[0].cooldownBurn}</div>
                                    <div class="d-info">소모값 : ${championInfo.spells[0].costBurn}</div>
                                    <div class="d-info">범위 : ${championInfo.spells[0].rangeBurn}</div>
                                    <br>
                                    <div>${championInfo.spells[0].tooltip}</div>
                                    <br>
                                    <div class="d-client">[?]로 표시된 값은 Riot API 에서 제공하지 않는 데이터입니다. 정확한 값은 LoL 클라이언트에서 확인 하실 수 있습니다.</div>
                                    <br>
                                    <div>${championInfo.spells[0].description}</div>
                                </div>
                            </div>
                            <div class="grid-row">
                                <img class="spells" src="${ddragonUrl}/14.8.1/img/spell/${championInfo.spells[1].image.full}">
                                ${championInfo.spells[1].name}
                                <div class="description-container">
                                    <div class="d-name">${championInfo.spells[1].name}</div>
                                    <div class="d-info">재사용 대기시간(초) : ${championInfo.spells[1].cooldownBurn}</div>
                                    <div class="d-info">소모값 : ${championInfo.spells[1].costBurn}</div>
                                    <div class="d-info">범위 : ${championInfo.spells[1].rangeBurn}</div>
                                    <br>
                                    <div>${championInfo.spells[1].tooltip}</div>
                                    <br>
                                    <div class="d-client">[?]로 표시된 값은 Riot API 에서 제공하지 않는 데이터입니다. 정확한 값은 LoL 클라이언트에서 확인 하실 수 있습니다.</div>
                                    <br>
                                    <div>${championInfo.spells[1].description}</div>
                                </div>
                            </div>
                            <div class="grid-row">
                                <img class="spells" src="${ddragonUrl}/14.8.1/img/spell/${championInfo.spells[2].image.full}">${championInfo.spells[2].name}
                                <div class="description-container">
                                    <div class="d-name">${championInfo.spells[2].name}</div>
                                    <div class="d-info">재사용 대기시간(초) : ${championInfo.spells[2].cooldownBurn}</div>
                                    <div class="d-info">소모값 : ${championInfo.spells[2].costBurn}</div>
                                    <div class="d-info">범위 : ${championInfo.spells[2].rangeBurn}</div>
                                    <br>
                                    <div>${championInfo.spells[2].tooltip}</div>
                                    <br>
                                    <div class="d-client">[?]로 표시된 값은 Riot API 에서 제공하지 않는 데이터입니다. 정확한 값은 LoL 클라이언트에서 확인 하실 수 있습니다.</div>
                                    <br>
                                    <div>${championInfo.spells[2].description}</div>
                                </div>
                            </div>
                            <div class="grid-row">
                                <img class="spells" src="${ddragonUrl}/14.8.1/img/spell/${championInfo.spells[3].image.full}">
                                ${championInfo.spells[3].name}
                                <div class="description-container">
                                    <div class="d-name">${championInfo.spells[3].name}</div>
                                    <div class="d-info">재사용 대기시간(초) : ${championInfo.spells[3].cooldownBurn}</div>
                                    <div class="d-info">소모값 : ${championInfo.spells[3].costBurn}</div>
                                    <div class="d-info">범위 : ${championInfo.spells[3].rangeBurn}</div>
                                    <br>
                                    <div>${championInfo.spells[3].tooltip}</div>
                                    <br>
                                    <div class="d-client">[?]로 표시된 값은 Riot API 에서 제공하지 않는 데이터입니다. 정확한 값은 LoL 클라이언트에서 확인 하실 수 있습니다.</div>
                                    <br>
                                    <div>${championInfo.spells[3].description}</div>
                                </div>
                            </div>
                        </div>
                
                `;

            });

        document.querySelectorAll('.spells').forEach(function(img) {
            img.addEventListener('mouseover', function() {
                if (this.nextElementSibling.style.display !== 'flex') {
                    this.nextElementSibling.style.display = 'flex';
                }
            });
            img.parentNode.addEventListener('mouseleave', function() {
                this.querySelector('.description-container').style.display = 'none';
            });
        });

    }

}

class Css {

    addClickEventsCssButton(){









        // const description =


        // selectButton.addEventListener('click', function() {
        //     selectButton.classList.toggle('selectButton-clicked');
        //     selectDiv.style.display = selectDiv.style.display === 'none' ? 'flex' : 'none';
        //     // 화살표 방향 변경
        //     this.querySelector('.arrow').textContent = selectDiv.style.display === 'none' ? '▼' : '▲';
        // });

    }


}