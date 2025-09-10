import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-cube';
import 'swiper/css/pagination';
import { Pagination, EffectCube, Navigation } from 'swiper/modules';

function MySwiper() {
  const swiperRef = useRef(null);
  const data = ["slide1", "slide2", "slide3", "slide4", "slide5"];

  return (
    <>
      <Swiper
        modules={[Pagination, EffectCube, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        pagination={{ clickable: true, type: "fraction" }}
        navigation
        effect="cube"
        centeredSlides={true}
        onSlideChange={() => console.log("change")}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {data.map((d, i) => (
          <SwiperSlide key={i}>
            <div>{d}</div>
          </SwiperSlide>
        ))}
      </Swiper>
      <button onClick={() => swiperRef.current?.slidePrev()}>Prev</button>
      <button onClick={() => swiperRef.current?.slideNext()}>Next</button>
    </>
  );
}

export default MySwiper;
