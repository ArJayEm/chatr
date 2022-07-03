import { Link } from "react-router-dom";
import * as Icon from "react-bootstrap-icons";

export default function AppBar({ title, component }) {
  return (
    <nav className="appbar">
      <h1>
        <Link className="link" to="/">
          <Icon.ArrowLeftShort />
        </Link>
      </h1>
      {title && <h5>{title}</h5>}
      {component && <>{component}</>}
    </nav>
  );
}
