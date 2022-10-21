import {DEX} from "../constants/dex";
import {ADDRESS_WBNB} from  "../constants/addresses";


export const dexBuyLink = (address,dex) =>`${dex.baseUrl}swap?outputCurrency=${address}`
export const dexAddLink = (token0,token1,dex) =>`${dex.baseUrl}add/${token0}/${token1}`
export const czCashBuyLink = (address)=>dexBuyLink(address,DEX.PCS);
export const czCashAddLink = (token0,token1)=>{
  if(token0 == ADDRESS_WBNB) token0 = "BNB";
  if(token1 == ADDRESS_WBNB) token1 = "BNB";
  return dexAddLink(token0,token1,DEX.PCS)
}