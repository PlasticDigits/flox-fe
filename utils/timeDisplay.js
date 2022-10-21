

export const  deltaCountdown = (currentEpoch,endEpoch) => {
  currentEpoch = Number(currentEpoch) ?? 0;
  endEpoch = Number(endEpoch) ?? 0;
  if(!currentEpoch || !endEpoch || endEpoch-currentEpoch <= 0) return "0h 0m 0s";
  const delta = endEpoch-currentEpoch;
  const days = Math.floor(delta/86400);
  const hours = Math.floor((delta-days*86400)/3600);
  const minutes = Math.floor((delta-days*86400-hours*3600)/60);
  const seconds = delta-days*86400-hours*3600-minutes*60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}