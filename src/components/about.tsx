import qrCode from '/qrCode.png';
import styles from './Collapsible.module.css';
import LinksIcons from './links-icons';

export default function About() {
  return (
    <div className='text-center mt-5 font-semibold'>
      <LinksIcons noabout home />
      <a
        href='mailto:siebentod@mail.ru'
        className='hover:underline text-primary mt-1.5 block'
      >
        siebentod@mail.ru
      </a>

      <li className='list-none mt-1'>
        <label className={styles.collapsibleLabel}>
          <input type='checkbox' className='hidden' />
          <p className='text-primary'>Пожертвование</p>
          <ul className={styles.collapsibleContent}>
            <a
              href='https://pay.cloudtips.ru/p/573f6bb3'
              className='block group bg-[#f6f7f8] px-2.5 pb-0.5 rounded-lg'
            >
              <img
                src={qrCode}
                alt='QR code'
                width={500}
                height={500}
                className='w-[20dvw] h-[20dvw] mx-auto'
              />
              <span className='block mb-1.5 text-gray-500 group-hover:underline'>
                https://pay.cloudtips.ru/p/573f6bb3
              </span>
            </a>
            <li className='list-none'>
              <label className={styles.collapsibleLabel}>
                <input type='checkbox' className='hidden' />
                <p className='text-primary'>Прямой номер</p>
                <ul className={styles.collapsibleContent}>
                  <span className='text-gray-500 bg-[#f6f7f8] px-2.5 pb-0.5 rounded-lg'>4276 1300 1766 7498</span>
                </ul>
              </label>
            </li>
          </ul>
        </label>
      </li>

      <div className='blank'></div>
    </div>
  );
}
