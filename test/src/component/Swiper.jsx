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
import oseroImg from "../img/osero.jpg"
import gandam from "../img/gandam.jpg";


function MySwiper() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const imgs = [
  tetoImg,
  oipImg,
  oseroImg,
  gandam
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
        <SwiperSlide className='swiper-slide'>
          <img src={imgs[0]} alt="" />
          <Link className="link"to={ROUTES.TETO}>紹介ページへ</Link>
        </SwiperSlide>
        <SwiperSlide className='swiper-slide'>
          <img src={imgs[2]} alt="" />
          <Link className="link"to={ROUTES.OSERO}>紹介ページへ</Link>
        </SwiperSlide>
        <SwiperSlide className='swiper-slide'>
          <img src={imgs[3]} alt="" />
          <Link className="link"to={ROUTES.GANDAM}>紹介ページへ</Link>
        </SwiperSlide>
        
      </Swiper>
      
      <div ref={prevRef} className="pbtn">Prev</div>
      <div ref={nextRef} className="nbtn">Next</div>
    </>
  );
}

export default MySwiper;
