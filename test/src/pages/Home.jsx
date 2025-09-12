
import Swiper from "../component/Swiper"
import backimg from "../img/wp2640159.jpg"
export default function Home() {
  return (
    <>
    <header>
      <a>1</a>
      <a>2</a>
      <a>3</a>
    </header>
    <body>
      <h1>home</h1>
      <img className="backimg"src={backimg} alt="写真" />
      <Swiper></Swiper>
    </body>
    </>
  )
}
