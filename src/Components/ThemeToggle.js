// src/components/ThemeToggle.js
import React from 'react';
import { useColorMode, Switch, Flex } from '@chakra-ui/react';

const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex align="center" justify="flex-end">
      <Switch isChecked={colorMode === 'dark'} onChange={toggleColorMode} />
    </Flex>
  );
};

export default ThemeToggle;
