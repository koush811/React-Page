import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';
import { Pagination, EffectCube, Navigation } from 'swiper/modules';
import { Link } from "react-router-dom"
import { ROUTES } from "../url/u"
import tetoImg from "../img/teto.jpg";
import oipImg from "../img/OIP.jpg";


function MySwiper() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const imgs = [
  tetoImg,
  oipImg
  ];

  return (
    <>
      <Swiper
        modules={[Pagination, EffectCube, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        effect="cube"
        
        centeredSlides={true}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onInit={(swiper) => {
          setTimeout(() => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.destroy();
            swiper.navigation.init();
            swiper.navigation.update();
          });
        }}
      >
        {imgs.map((img, i) => (
          <SwiperSlide key={i} className='swiper-slide'>
            <img src={img} alt="" />
            <p>aaaaaaaaaaaaaaaaaaaa<br/>
            aaaaaaaaaaaaaaaaaaaaaaaa</p>
            <Link className="link"to={ROUTES.TETO}>ゲーム画面へ</Link>
          </SwiperSlide>
        ))}
        <SwiperSlide className='swiper-slide'>
          <h1>3</h1>
        </SwiperSlide>
        <SwiperSlide className='swiper-slide'>
            <h1>4</h1>
        </SwiperSlide>
      </Swiper>
      <div ref={prevRef} className="pbtn">Prev</div>
      <div ref={nextRef} className="nbtn">Next</div>
    </>
  );
}

export default MySwiper;
