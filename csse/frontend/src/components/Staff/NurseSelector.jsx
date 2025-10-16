import React from 'react';
import NurseModal from './NurseModal';

const NurseSelector = ({ nurses, open, onClose, onSelect }) => {
  if (!open) return null;
  return <NurseModal nurses={nurses} open={open} onClose={onClose} onSelect={onSelect} />;
};

export default NurseSelector;
