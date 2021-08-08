import { useEffect, useState } from "react";

export const Now = () => {
  const [now, setNow] = useState<string>();
  useEffect(() => {
    let mounted = true;
    const handleRaf = () => {
      const now = new Date();
      setNow(now.toISOString());
      if (mounted) {
        window.requestAnimationFrame(handleRaf);
      }
    };
    let handle = window.requestAnimationFrame(handleRaf);
    return () => {
      mounted = false;
      cancelAnimationFrame(handle);
    };
  }, [setNow]);
  return <div>{now}</div>;
};
