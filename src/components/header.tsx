import Balancer from 'react-wrap-balancer';
import { motion } from 'framer-motion';
import { onlyOpacityMotion } from '../lib/motion';

export default function Header() {
  return (
    <motion.h1
      className='text-2xl font-bold mb-8 text-center leading-6'
      {...onlyOpacityMotion}
    >
      <Balancer>Утилита для ребалансировки инвестиционного портфеля</Balancer>
    </motion.h1>
  );
}
