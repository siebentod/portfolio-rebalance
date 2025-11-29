import { FaGithub, FaHome, FaInfo } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function LinksIcons({
  noabout = false,
  home = false,
}) {
  return (
    <div className={`mt-3 mx-auto text-center w-max text-primary flex gap-1 icons`}>
      {home ? (
        <Link to="/">
          <FaHome />
        </Link>
      ) : null}
      {noabout ? null : (
        <a href="https://gratia.apoliteia.ru/">
          <FaInfo />
        </a>
      )}
      <a href="https://github.com/siebentod/portfolio-rebalance">
        <FaGithub />
      </a>
    </div>
  );
}

export default LinksIcons;
