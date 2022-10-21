
import { useState, useEffect } from 'react';
import Web3ModalButton from '../../components/Web3ModalButton';
import Footer from '../../components/Footer';
import "./index.module.scss";
import { useEthers, useToken, useContractFunction, useCall, useTokenBalance, useTokenAllowance, useEtherBalance } from '@usedapp/core'
import { useCoingeckoPrice } from '@usedapp/coingecko';
import { utils, Contract, BigNumber } from 'ethers';
import useAutoRewardPool from "../../hooks/useAutoRewardPool";
import useCurrentEpoch from "../../hooks/useCurrentEpoch";
import FloxLogo from '../../public/static/assets/logo.png';
import ShipImg from '../../public/static/assets/images/ship.png';
import HeaderBanner from '../../public/static/assets/images/bg.jpg';
import CZCashLogo from '../../public/static/assets/images/czcash.png';
import TopVideo from '../../public/static/assets/vids/bgv1.mp4';
import { shortenAddress } from '@usedapp/core'
import IERC20Abi from "../../abi/IERC20.json";
import FloxAbi from "../../abi/FLOX.json";
import AutoRewardPoolAbi from "../../abi/AutoRewardPool.json";
import { SOCIAL_TELEGRAM } from '../../constants/social';
import { deltaCountdown } from '../../utils/timeDisplay';
import { weiToShortString, tokenAmtToShortString } from '../../utils/bnDisplay';
import { ADDRESS_TEAM, ADDRESS_MARKETING, ADDRESS_FLOH, ADDRESS_FLOX, ADDRESS_AUTO_REWARD_POOL, ADDRESS_FLOXCZUSD_PAIR, ADDRESS_CZUSD } from '../../constants/addresses';
import { czCashBuyLink } from '../../utils/dexBuyLink';
import Stat from '../../components/Stat';


const { formatEther, commify, parseEther, Interface } = utils;

const primaryColor = "rgb(190, 224, 161)"
const secondaryColor = "rgb(98, 167, 237)"

const FloxInterface = new Interface(FloxAbi);
const CONTRACT_FLOX = new Contract(ADDRESS_FLOX, FloxInterface);

const AutoRewardPoolInterface = new Interface(AutoRewardPoolAbi);
const CONTRACT_AUTO_REWARD_POOL = new Contract(ADDRESS_AUTO_REWARD_POOL, AutoRewardPoolInterface);

const Ierc20Interface = new Interface(IERC20Abi);
const CONTRACT_FLOXCZUSD_PAIR = new Contract(ADDRESS_FLOXCZUSD_PAIR, Ierc20Interface);



const displayWad = (wad) => !!wad ? Number(formatEther(wad)).toFixed(2) : "...";

const INITIAL_FLOX_PRICE = "0.0000425";
const INITIAL_FLOX_PRICE_FLOOR = "0.0000425";
const INTIAL_FLOX_SUPPLY = parseEther("1000000000");

function Home() {

  const { account, library, chainId } = useEthers();

  const { state: stateClaim, send: sendClaim } = useContractFunction(
    CONTRACT_AUTO_REWARD_POOL,
    'claim');

  const floxInfo = useToken(ADDRESS_FLOX);
  const floxCzusdPairInfo = useToken(ADDRESS_FLOXCZUSD_PAIR);

  const accFLOHBal = useTokenBalance(ADDRESS_FLOH, account);
  const accFloxBal = useTokenBalance(ADDRESS_FLOX, account);
  const marketingFLOHBal = useTokenBalance(ADDRESS_FLOH, ADDRESS_MARKETING);
  const teamFloxBal = useTokenBalance(ADDRESS_FLOH, ADDRESS_TEAM);
  const lpCzusdBal = useTokenBalance(ADDRESS_CZUSD, ADDRESS_FLOXCZUSD_PAIR);
  const lpFloxBal = useTokenBalance(ADDRESS_FLOX, ADDRESS_FLOXCZUSD_PAIR);
  const autoRewardPoolFLOHBal = useTokenBalance(ADDRESS_FLOH, ADDRESS_AUTO_REWARD_POOL);
  const lockedLpTokens = useTokenBalance(ADDRESS_FLOXCZUSD_PAIR, ADDRESS_FLOX);
  const czusdPrice = "1.00";
  const FLOHPrice = useCoingeckoPrice("FLOHcoin");

  const currentEpoch = useCurrentEpoch();

  const [floxPrice, setFloxPrice] = useState("0");
  const [floxMcapWad, setFloxMcapWad] = useState(parseEther("0"));
  const [floxPriceFloor, setFloxPriceFloor] = useState("0");
  const [FLOHTotalPaidWad, setFLOHTotalPaidWad] = useState(parseEther("0"));
  const [floxAprWad, setFloxAprWad] = useState(parseEther("0"));
  const [liqRatioWad, setLiqRatioWad] = useState(parseEther("0"));

  const {
    rewardPerSecond,
    totalRewardsPaid,
    combinedStakedBalance,
    totalRewardsReceived,
    pendingReward,
    isAccountAutoClaim,
    totalStaked,
    timestampLast
  } = useAutoRewardPool(library, account);

  useEffect(() => {
    if (!czusdPrice || !lpCzusdBal || !lpFloxBal) {
      setFloxPrice("0");
      return;
    }
    const priceWad = lpCzusdBal.mul(parseEther(czusdPrice)).div(lpFloxBal);
    setFloxPrice(formatEther(priceWad));

  }, [czusdPrice, lpCzusdBal?.toString(), lpFloxBal?.toString()]);

  useEffect(() => {
    console.log("floxPrice", floxPrice?.toString());
    console.log("floxInfo?.totalSupply", floxInfo?.totalSupply?.toString());
    console.log("totalRewardsPaid", totalRewardsPaid?.toString());
    console.log("rewardPerSecond", rewardPerSecond?.toString());
    console.log("autoRewardPoolFLOHBal", autoRewardPoolFLOHBal?.toString());
    console.log("currentEpoch", currentEpoch?.toString());
    if (!floxPrice || !floxInfo?.totalSupply || !totalRewardsPaid || !rewardPerSecond || !autoRewardPoolFLOHBal || !currentEpoch || !timestampLast) {
      setFloxMcapWad(parseEther("0"));
      setFLOHTotalPaidWad(parseEther("0"));
      return;
    }
    const mcapWad = floxInfo.totalSupply.mul(parseEther(floxPrice)).div(parseEther("1"));
    console.log({ mcapWad })
    setFloxMcapWad(mcapWad);
    const secondsRemaining = timestampLast.add(86400 * 7).sub(currentEpoch);
    const FLOHPaidUsdWad = totalRewardsPaid.add(autoRewardPoolFLOHBal).sub(rewardPerSecond.mul(secondsRemaining));
    setFLOHTotalPaidWad(FLOHPaidUsdWad);
  }, [floxPrice?.toString(), floxInfo?.totalSupply?.toString(), totalRewardsPaid?.toString(), autoRewardPoolFLOHBal?.toString(), rewardPerSecond?.toString(), currentEpoch?.toString(), timestampLast?.toString()]);

  useEffect(() => {
    if (!floxPrice || !totalStaked || !rewardPerSecond || totalStaked?.eq(0) || floxPrice == 0) {
      setFloxAprWad(parseEther("0"));
      return;
    }
    const stakedUsd = totalStaked.mul(parseEther(floxPrice)).div(parseEther("1"));
    const usdPerDay = rewardPerSecond.mul(86400 * 365).mul(parseEther(FLOHPrice ?? "0")).div(10 ** 8);
    console.log({ usdPerDay })
    const apr = usdPerDay?.mul(parseEther("100")).div(stakedUsd) ?? BigNumber.from(0);
    setFloxAprWad(apr);
  }, [floxPrice, FLOHPrice, totalStaked?.toString(), rewardPerSecond?.toString()]);

  useEffect(() => {
    if (!lpFloxBal || !floxInfo?.totalSupply || floxInfo.totalSupply.eq(0)) {
      setLiqRatioWad(parseEther("0"));
      return;
    }
    const ratio = lpFloxBal.mul(2).mul(parseEther("100")).div(floxInfo.totalSupply);
    setLiqRatioWad(ratio);

  }, [lpFloxBal?.toString(), floxInfo?.totalSupply?.toString()]);

  useEffect(() => {
    if (!czusdPrice || !lpFloxBal || !lockedLpTokens || !floxInfo?.totalSupply || !floxCzusdPairInfo?.totalSupply) {
      setFloxPriceFloor("0");
      return;
    }
    const lockedInvariant = lpCzusdBal.mul(lpFloxBal).mul(lockedLpTokens).div(floxCzusdPairInfo.totalSupply);
    const lpCzusdBalAfterMaxSell = lockedInvariant.div(floxInfo.totalSupply);
    const priceWad = lpCzusdBalAfterMaxSell.mul(parseEther(czusdPrice)).div(floxInfo.totalSupply);
    setFloxPriceFloor(formatEther(priceWad));

  }, [czusdPrice, lpCzusdBal?.toString(), lpFloxBal?.toString(), lockedLpTokens?.toString(), floxInfo?.totalSupply?.toString(), floxCzusdPairInfo?.totalSupply?.toString()]);


  return (<>
    <section id="top" className="hero has-text-centered">
      <div className="m-0 p-0" style={{ position: "relative", width: "100%", height: "7.5em" }}>
        <div style={{ position: "absolute", width: "100vw", height: "7.5em", overflow: "hidden" }}>
          <video poster={HeaderBanner} preload="none" autoPlay loop muted style={{ display: "inline-block", objectFit: "cover", objectPosition: "center", width: "100vw", minWidth: "1920px", height: "7.5em", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <source src={TopVideo} type="video/mp4" />
          </video>

        </div>

        <Web3ModalButton className="mt-5 mb-5" />
        <p className='has-text-grey-lighter is-size-7 is-dark' style={{ position: "absolute", bottom: "0", left: "0", right: "0", zIndex: "2", backgroundColor: "rgba(0,10,40,0.8)" }}>
          <span className="mr-2 mb-0 is-inline-block has-text-left" style={{ width: "11em" }}>Network: {!!account ? (chainId == 56 ? (<span className="has-text-success">✓ BSC</span>) : <span className="has-text-error has-text-danger">❌NOT BSC</span>) : "..."}</span>
          <span className="mt-0 is-inline-block has-text-left" style={{ width: "11em" }}>Wallet: {!!account ? shortenAddress(account) : "..."}</span>
        </p>
      </div>
      <div className="m-0 " style={{ background: "linear-gradient(301deg, rgba(1,31,23,1) 0%, rgba(5,24,40,1) 100%)", paddingBottom: "5em", paddingTop: "1em" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <a href="https://FlokiMultiverse.io" target="_blank">
              <img src={FloxLogo} width={110} height={110} alt="FLOX symbol" />
            </a>
            <div>
              ${floxPrice?.substring(0, 10)}
            </div>
          </div>
        </div>
        {/* <p>Contract address</p>
        <p>Contract address</p> */}
        <br />
        {/* BUY BUTTON LINK */}
        <a target="_blank" href={czCashBuyLink(ADDRESS_FLOX)} className="button is-dark is-outlined is-large mt-0 mb-5 is-rounded" style={{ display: "block", width: "12em", border: "solid #126a85 2px", color: "white", marginLeft: "auto", marginRight: "auto", paddingTop: "0.45em" }} >
          BUY ON
          <img src={CZCashLogo} style={{ height: "1em", marginLeft: "0.1em", position: "relative", top: "0.1em" }} alt="CZ.Cash" />
        </a>
        {/* Rewards Block */}
        <div className="container is-2" style={{ padding: "0 2em 2em 2em" }}>
          <h3 className="outline-text" style={{ margin: "2rem 0 2rem 0", fontSize: "2rem", fontWeight: 'normal', color: 'white', textTransform: 'uppercase', whiteSpace: "pre-line" }}>
            Your <span style={{ color: secondaryColor }}>Wallet</span>{"\n"}
            {account && <span className="is-size-5 is-block" style={{ marginTop: "-0.25em", textTransform: "none" }}>{shortenAddress(account)}</span>}
          </h3>
          {account && <button
            className="button is-dark"
            style={{
              border: "1px solid " + primaryColor,
              textTransform: "uppercase",
              backgroundColor: "#045F87"
            }}
            onClick={() => sendClaim()}
          >
            Claim Pending
          </button>}
          {account ?
            <div className="columns" style={{ border: "3px solid rgb(237, 209, 98)", backgroundColor: 'rgba(97, 89, 57, 0.4)', borderRadius: '1em', padding: "1.5em 1.5em 1.5em 1.5em", justifyContent: 'space-evenly' }}>
              <Stat
                color={primaryColor}
                title="Earned"
                primaryText={`${commify(formatEther((totalRewardsReceived ?? BigNumber.from("0")).mul(10 ** 10)))}\nFLOH`}
                secondaryText={`$ ${commify((parseFloat(formatEther((totalRewardsReceived ?? BigNumber.from("0")).mul(10 ** 10))) * (FLOHPrice ?? 0)).toFixed(2))}`}
              />
              <Stat
                color={primaryColor}
                title="Per Day"
                primaryText={`${commify(formatEther((rewardPerSecond?.mul(86400).mul(combinedStakedBalance ?? 0).div(totalStaked)).mul(10 ** 10)))}\nFLOH`}
                secondaryText={`$ ${commify((parseFloat(formatEther((rewardPerSecond?.mul(86400).mul(combinedStakedBalance ?? 0).div(totalStaked)).mul(10 ** 10))) * (FLOHPrice ?? 0)).toFixed(2))}`}
              />
              <Stat
                color={secondaryColor}
                title="Held"
                primaryText={`${commify(formatEther((accFLOHBal ?? BigNumber.from("0")).mul(10 ** 10)))}\nFLOH`}
                secondaryText={`$ ${commify((parseFloat(formatEther((accFLOHBal ?? BigNumber.from("0")).mul(10 ** 10))) * (FLOHPrice ?? 0)).toFixed(2))}`}
              />
              <Stat
                color={secondaryColor}
                title="Pending"
                primaryText={`${commify(formatEther((pendingReward ?? BigNumber.from("0")).mul(10 ** 10)))}\nFLOH`}
                secondaryText={`$ ${commify((parseFloat(formatEther((pendingReward ?? BigNumber.from("0")).mul(10 ** 10))) * (FLOHPrice ?? 0)).toFixed(2))}`}
              />
              <Stat
                color={primaryColor}
                title="FLOX Held"
                primaryText={`${commify(parseFloat(formatEther(accFloxBal ?? BigNumber.from("0"))).toFixed(2))}\nFLOX`}
                secondaryText={`$ ${commify((parseFloat(formatEther(accFloxBal ?? BigNumber.from("0"))) * (floxPrice ?? 0)).toFixed(2))}`}
              />
            </div>
            : <button
              className="px-6 py-3 button is-dark"
              style={{
                border: "2px solid rgb(18, 106, 133)",
                color: "white",
                fontSize: "1.5rem",
                textTransform: "uppercase",
                borderRadius: "2em",
              }}

              onClick={e => window.scrollTo({ top: 0, behaviour: "smooth" })}
            >
              Connect on top
            </button>}
          <h3 className="outline-text" style={{ margin: "2rem 0 2rem 0", fontSize: "2rem", fontWeight: 'bold', color: secondaryColor, }}>
            Rewards
          </h3>
          <div className="columns" style={{ border: "3px solid rgb(237, 209, 98)", backgroundColor: 'rgba(97, 89, 57, 0.4)', borderRadius: '1em', padding: "1.5em 1.5em 1.5em 1.5em", justifyContent: 'space-evenly' }}>
            <Stat
              color={secondaryColor}
              title="Accumulated"
              primaryText={`${commify(formatEther((FLOHTotalPaidWad ?? BigNumber.from("0")).mul(10 ** 10)))} FLOH`}
              secondaryText={`$ ${commify((parseFloat(formatEther((FLOHTotalPaidWad ?? BigNumber.from("0")).mul(10 ** 10))) * (FLOHPrice ?? 0)).toFixed(2))}`}
            />
            <Stat
              color={secondaryColor}
              title="Distributed"
              primaryText={`${commify(formatEther((totalRewardsPaid ?? BigNumber.from("0")).mul(10 ** 10)))} FLOH`}
              secondaryText={`$ ${commify((parseFloat(formatEther((totalRewardsPaid ?? BigNumber.from("0")).mul(10 ** 10))) * (FLOHPrice ?? 0)).toFixed(2))}`}
            />
            <Stat
              color={secondaryColor}
              title="Today"
              primaryText={`${commify(formatEther((rewardPerSecond ?? BigNumber.from("0"))?.mul(86400).mul(10 ** 10)))} FLOH`}
              secondaryText={`$ ${commify((parseFloat(formatEther((rewardPerSecond ?? BigNumber.from("0")).mul(86400).mul(10 ** 10))) * (FLOHPrice ?? 0)).toFixed(2))}`}
            />
          </div>
          <h3 className="outline-text" style={{ margin: "2rem 0 2rem 0", fontSize: "2rem", fontWeight: 'bold', color: primaryColor, }}>
            FlokiMultiverse Stats
          </h3>
          <div className="columns" style={{ border: "3px solid rgb(161, 224, 189)", backgroundColor: "rgb(42, 67, 50)", borderRadius: '1em', padding: "1.5em 1.5em 1.5em 1.5em" }}>
            <Stat
              color={secondaryColor}
              title="Market Cap"
              primaryText={`$ ${commify(formatEther(floxMcapWad)).split(".")[0]}`}
            />
            <Stat
              color={secondaryColor}
              title="Price FLOX"
              primaryText={`$ ${commify(floxPrice?.substring(0, 10))}`}
            />
            <Stat
              color={secondaryColor}
              title="Price % Diff"
              primaryText={`${weiToShortString(parseEther("100").mul(parseEther(floxPrice)).div(parseEther(INITIAL_FLOX_PRICE)).sub(parseEther("100")), 2)} %`}
            />
            <Stat
              color={secondaryColor}
              title="Floor Price"
              primaryText={`$ ${floxPriceFloor?.substring(0, 10)}`}
            />
            <Stat
              color={secondaryColor}
              title="Floor % Diff"
              primaryText={`${weiToShortString(parseEther("100").mul(parseEther(floxPriceFloor)).div(parseEther(INITIAL_FLOX_PRICE_FLOOR)).sub(parseEther("100")), 2)} %`}
            />
          </div>
          <h3 className="outline-text" style={{ margin: "2rem 0 2rem 0", fontSize: "2rem", fontWeight: 'bold', color: primaryColor, }}>
            FlokiMultiverse Performance
          </h3>
          <div className="columns" style={{ border: "3px solid rgb(161, 224, 189)", backgroundColor: "rgb(42, 67, 50)", borderRadius: '1em', padding: "1.5em 1.5em 1.5em 1.5em" }}>
            <Stat
              color={secondaryColor}
              title="Marketing"
              primaryText={`${commify(formatEther((marketingFLOHBal ?? BigNumber.from("0")).mul(10 ** 10))).split(".")[0]} FLOH`}
              secondaryText={`$ ${commify((parseFloat(formatEther((marketingFLOHBal ?? BigNumber.from("0")).mul(10 ** 10))) * (FLOHPrice ?? 0)).toFixed(2))}`}
            />
            <Stat
              color={secondaryColor}
              title="Burned"
              primaryText={`${commify(formatEther(INTIAL_FLOX_SUPPLY.sub(floxInfo?.totalSupply ?? INTIAL_FLOX_SUPPLY)).split(".")[0])} FLOX`}
              secondaryText={`$ ${commify((parseFloat(formatEther(INTIAL_FLOX_SUPPLY.sub(floxInfo?.totalSupply ?? INTIAL_FLOX_SUPPLY))) * (floxPrice ?? 0)).toFixed(2))}`}
            />
            <Stat
              color={secondaryColor}
              title="APR"
              primaryText={`${weiToShortString(floxAprWad, 2)} %`}
            />
            <Stat
              color={secondaryColor}
              title="Liquidity %"
              primaryText={`${weiToShortString(liqRatioWad, 2)} %`}
              secondaryText={`of MCAP`}
            />
          </div>
        </div>
        {/* <div className="columns is-centered is-vcentered is-multiline pl-2 pr-2 mb-5">
          <div className="stat stat-FLOH">
            <span className="stat-title">{tokenAmtToShortString(FLOHTotalPaidWad ?? 0, 8, 6)}</span>
            <span className="stat-content">Total FLOHcoin Rewards</span>
          </div>
          <div className="stat stat-FLOH">
            <span className="stat-title">{tokenAmtToShortString(totalRewardsPaid ?? 0, 8, 2)}</span>
            <span className="stat-content">Total FLOHcoin Distributed</span>
          </div>
          <div className="stat stat-FLOH-small">
            <span className="stat-title">{tokenAmtToShortString(rewardPerSecond?.mul(86400) ?? 0, 8, 2)}</span>
            <span className="stat-content">FLOHcoin Rewards Today</span>
          </div>
          <div className="stat stat-FLOH-small">
            <span className="stat-title">{tokenAmtToShortString(marketingFLOHBal ?? 0, 8, 2)}</span>
            <span className="stat-content">Total Marketing</span>
          </div>
          <div className="stat stat-flox">
            <span className="stat-title">${floxPrice?.substring(0, 10)}</span>
            <span className="stat-content">FlokiMultiverse Price</span>
          </div>
          <div className="stat stat-flox">
            <span className="stat-title">+{weiToShortString(parseEther("100").mul(parseEther(floxPrice)).div(parseEther(INITIAL_FLOX_PRICE)).sub(parseEther("100")), 2)}%</span>
            <span className="stat-content">FlokiMultiverse % Increase</span>
          </div>
          <div className="stat stat-flox">
            <span className="stat-title">${floxPriceFloor?.substring(0, 10)}</span>
            <span className="stat-content">FlokiMultiverse Floor Price</span>
          </div>
          <div className="stat stat-flox">
            <span className="stat-title">+{weiToShortString(parseEther("100").mul(parseEther(floxPriceFloor)).div(parseEther(INITIAL_FLOX_PRICE_FLOOR)).sub(parseEther("100")), 2)}%</span>
            <span className="stat-content">Floor % Increase</span>
          </div>
          <div className="stat stat-flox-small">
            <span className="stat-title">${weiToShortString(weiToUsdWeiVal(INTIAL_FLOX_SUPPLY.sub(floxInfo?.totalSupply ?? INTIAL_FLOX_SUPPLY), floxPrice), 2)}</span>
            <span className="stat-content">Total FlokiMultiverse Burned</span>
          </div>
          <div className="stat stat-flox-small">
            <span className="stat-title">TBD</span>
            <span className="stat-content">FlokiMultiverse Burned Today</span>
          </div>
          <div className="stat stat-flox-small">
            <span className="stat-title">{weiToShortString(floxAprWad, 2)}%</span>
            <span className="stat-content">FlokiMultiverse APR</span>
          </div>
          <div className="stat stat-flox-small">
            <span className="stat-title">${weiToShortString(floxMcapWad, 2)}</span>
            <span className="stat-content">FlokiMultiverse MCAP</span>
          </div>
          <div className="stat stat-flox-small">
            <span className="stat-title">{weiToShortString(liqRatioWad, 2)}%</span>
            <span className="stat-content">Liquidity % of MCAP</span>
          </div>
        </div> */}
        {/* <h3 className="is-size-3 m-3 mt-5">
            YOUR <span style={{color:"#FFCB16"}}>WALLET</span>
            {!!account ? (
              <span className="is-size-5 is-block" style={{marginTop:"-0.25em"}}>{shortenAddress(account)}</span>
            ) : (<>
              <a className="is-size-5 is-block" style={{marginTop:"-0.25em",textDecoration:"underline",color:"white"}} href="#top">Connect your wallet at top</a>
              <a className="is-size-5 is-block" target="_blank" style={{textDecoration:"underline"}} href={SOCIAL_TELEGRAM}>Need help? Ask on Telegram</a>
            </>)

            }
            
          </h3> */}
        {!!account && (<>
          <div className="columns is-vcentered is-centered is-multiline pl-5 pr-5 mb-5">
            {/* <div className="stat stat-FLOH">
              <span className="stat-title">{tokenAmtToShortString(totalRewardsReceived, 8, 2)}</span>
              <span className="stat-content">Total FLOHcoin Earned</span>
            </div>
            <div className="stat stat-FLOH">
              <span className="stat-title">{totalStaked?.gt(0) ? tokenAmtToShortString(rewardPerSecond?.mul(86400).mul(combinedStakedBalance ?? 0).div(totalStaked), 8, 2) : "0.00"}</span>
              <span className="stat-content">FLOHcoin Per Day</span>
            </div>
            <div className="stat stat-FLOH">
              <span className="stat-title">{tokenAmtToShortString(accFLOHBal, 8, 2)}</span>
              <span className="stat-content">FLOHcoin Held</span>
            </div>
            <div className="stat stat-FLOH-small">
              <span className="stat-title">{tokenAmtToShortString(pendingReward ?? 0, 8, 2)}</span>
              <span className="stat-content">Pending FLOHcoin Reward</span>
              <button className='button is-rounded mt-1 is-small is-dark' style={{ maxWidth: "10em", position: "absolute", bottom: "-1.5em", right: "0em", backgroundColor: "rgba(0,10,40,1)", border: "solid #126a85 2px" }}
                onClick={() => sendClaim()}
              >Manual Claim</button>
            </div>
            <div className="stat stat-flox">
              <span className="stat-title">{weiToShortString(accFloxBal, 2)}</span>
              <span className="stat-content">FlokiMultiverse Held</span>
            </div> */}
            {/*accountFloxInitial?.gt(0) && (<>
              <div className="stat stat-flox-small">
                <span className="stat-title">{weiToShortString(accountVestBal, 2)}</span>
                <span className="stat-content">FlokiMultiverse Vesting</span>
              </div>
              <div className="stat stat-flox-small">
                <span className="stat-title">{accountFloxClaimable?.gt(0) ? "AVAILABLE" : (deltaCountdown(currentEpoch, firstUnlockEpoch.gt(currentEpoch) ? firstUnlockEpoch : secondUnlockEpoch))}</span>
                <span className="stat-content">Next Vesting Unlock</span>
                {accountFloxClaimable?.gt(0) && (<>
                  <button className='button is-rounded mt-1 is-small is-dark' style={{ maxWidth: "10em", position: "absolute", bottom: "-1.5em", right: "0em", backgroundColor: "rgba(0,10,40,1)", border: "solid #126a85 2px" }}
                    onClick={() => sendWithdraw()}
                  >Withdraw</button>
                </>)}
              </div>
                </>)*/}

          </div>
        </>)}
        <br /> <br />
        <img src={ShipImg} className="mt-1" alt="FLOX dog waving" />
        <br /><br />
        {/*
        <div id="dexscreener-embed" className='mt-5'><iframe src={`https://dexscreener.com/bsc/${ADDRESS_FLOXCZUSD_PAIR}?embed=1&theme=dark&info=0`}></iframe></div>
        */}
      </div>
    </section>

    <Footer />

  </>);
}

export default Home
