import { Link } from "react-router-dom"
import { ROUTES } from "../url/u"


export default function Home() {
  return (
    <>
    <div>home</div>
    <Link to={ROUTES.TETO}>aa
    </Link>
    </>
  )
}
