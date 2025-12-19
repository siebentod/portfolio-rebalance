import { motion } from 'framer-motion';
import { onlyOpacityMotion } from '../lib/motion';

export default function Header() {
  return (
    <motion.h1
      className='text-2xl font-bold md:mb-8 mb-6 text-center leading-6'
      {...onlyOpacityMotion}
    >
      Ребалансировка портфеля
    </motion.h1>
  );
}
