import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function LinksIcons({
  noabout = false,
  home = false,
}) {
  return (
    <div className={`mt-3 mx-auto text-center w-max flex gap-1 icons`}>
      {home ? (
        <Link to="/">
          <FaHome />
        </Link>
      ) : null}
      {noabout ? null : (
        <a href="https://gratia.apoliteia.ru/" className=' text-primary'>
          Благодарность
        </a>
      )}|
      <a href="https://github.com/siebentod/portfolio-rebalance" className=' text-primary'>
        Github
      </a>
    </div>
  );
}

export default LinksIcons;
