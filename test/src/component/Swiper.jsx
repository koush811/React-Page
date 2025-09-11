import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';
import { Pagination, EffectCube, Navigation } from 'swiper/modules';
import { Link } from "react-router-dom"
import { ROUTES } from "../url/u"

function MySwiper() {
  const swiperRef = useRef(null);
  const data = ["slide1", "slide2", "slide3", "slide4", "slide5"];

  return (
    <>
      <Swiper
        modules={[Pagination, EffectCube, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        
        navigation
        loop="true"
        effect="cube"
        centeredSlides={true}
        onSlideChange={() => console.log("change")}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        
        <Swiper slidesPerView={1}>
          <SwiperSlide className='SwiperSlide1'>
            <Link to={ROUTES.TETO}>
              teto
            </Link>   
          </SwiperSlide>
          <SwiperSlide className='SwiperSlide2'>
            <div>スライド2</div>
          </SwiperSlide>
          <SwiperSlide className='SwiperSlide3'>
            <div>スライド3</div>
          </SwiperSlide>
        </Swiper>

      </Swiper>
      <button onClick={() => swiperRef.current?.slidePrev()}>Prev</button>
      <button onClick={() => swiperRef.current?.slideNext()}>Next</button>
    </>
  );
}

export default MySwiper;
