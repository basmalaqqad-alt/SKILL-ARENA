import React from 'react';
import logo from '../../assets/logo.png';

const Logo = ({ height = 36 }) => (
  <img src={logo} alt="SkillArena" style={{ height, objectFit: 'contain' }} />
);

export default Logo;