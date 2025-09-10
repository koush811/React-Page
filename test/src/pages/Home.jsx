import { Link } from "react-router-dom"
import { ROUTES } from "../url/u"
import Swiper from "../component/Swiper"


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
      <Link to={ROUTES.TETO}>
        teto
      </Link>   
      <Swiper></Swiper>
    </body>
    </>
  )
}
