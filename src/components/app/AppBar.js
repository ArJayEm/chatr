import { Link } from "react-router-dom";
import * as Icon from "react-bootstrap-icons";

export default function AppBar({ history, title, component }) {
  return (
    <nav className="appbar">
      {history && (
        <h1>
          <Link className="link" to={history}>
            <Icon.ArrowLeftShort />
          </Link>
        </h1>
      )}
      {title && <h5>{title}</h5>}
      {component && <>{component}</>}
    </nav>
  );
}
