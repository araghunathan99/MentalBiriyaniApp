import { useState } from "react";
import BottomNav from "../BottomNav";

export default function BottomNavExample() {
  const [activeTab, setActiveTab] = useState<"reels" | "grid">("reels");

  return (
    <div className="w-full h-32 bg-background flex items-end">
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          console.log("Tab changed to:", tab);
        }} 
      />
    </div>
  );
}
