import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/node';
import fetchRetry from './fetchRetry';
import { memoize, random } from 'lodash';

const gatewayTools = new IPFSGatewayTools();
const gateways = [
    //"https://ipfs.fleek.co",
    //"https://cloudflare-ipfs.com",
    "https://czodiac.mypinata.cloud",
    //"https://gateway.ipfs.io"
]

export const getIpfsUrl = (sourceUrl,cycle=0) => {
    //console.log('gateway',gateways[cycle%gateways.length])
    return gatewayTools.convertToDesiredGateway(sourceUrl, gateways[cycle%gateways.length]);
}

let cycle = 0;
export const getIpfsJson = memoize(async (sourceUrl) => {
    let s = window.localStorage;
    let item = JSON.parse(s.getItem(sourceUrl));
    if(item != null) return item;

    cycle++;
    let result = await fetchRetry(
        getIpfsUrl(sourceUrl, cycle)
    );
    item = await result.json();
    s.setItem(sourceUrl,JSON.stringify(item));
    return item;
})