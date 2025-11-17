import React from "react";
import { Pen, Trash } from "lucide-react";
import styled from "styled-components";
import { IconComponentProps } from "@/types/edit";

// สร้าง style สำหรับวงกลมข้างนอก
const IconWrapper = styled.div`
  display: inline-block;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 50%;
  border: 2px solid #ccc;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IconContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const IconComponent: React.FC<IconComponentProps> = ({ icon }) => (
  <IconWrapper>{icon}</IconWrapper>
);

const App = () => {
  return (
    <IconContainer>
      <IconComponent icon={<Pen />} /> {/* ปากกา */}
      <IconComponent icon={<Trash />} /> {/* ถังขยะ */}
    </IconContainer>
  );
};

export default App;
