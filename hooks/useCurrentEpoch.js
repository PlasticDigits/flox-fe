import { useEffect, useState } from "react";

function useCurrentEpoch() {
  const [value, setValue] = useState(null);

  useEffect(()=>{
    const updateTime = ()=>{
      setValue(Math.floor(Date.now() / 1000));
    }        
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return ()=>clearInterval(interval);
  },[]);

    return value;
}

export default useCurrentEpoch;