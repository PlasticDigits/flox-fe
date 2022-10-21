import React from 'react'
import styled from 'styled-components'
import { useEthers, getExplorerAddressLink, useEtherBalance } from '@usedapp/core'
import { formatEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'

const formatter = new Intl.NumberFormat('en-us', {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
})

const formatBalance = (balance: BigNumber | undefined) =>
  formatter.format(parseFloat(formatEther(balance ?? BigNumber.from('0'))))

export type AccountModalProps = {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

export const AccountModal = ({ setShowModal }: AccountModalProps) => {
  const { account, chainId } = useEthers()
  const balance = useEtherBalance(account)
  if (account && chainId) {
    return (
      <ModalBackground onClick={() => setShowModal(false)}>
        <Modal
          onClick={(e) => e.stopPropagation()}
        >
          <TitleRow>
            Your Connected Wallet
            <ClosingButton onClick={() => setShowModal(false)}>+</ClosingButton>
          </TitleRow>
          <AccountInfo>
            <AccountAddress>Address: {account}</AccountAddress>
            <LinkWrapper>
              <a href={getExplorerAddressLink(account, chainId)} target="_blank" rel="noopener noreferrer">
                Show on BSCScan
              </a>
              {window.isSecureContext && (
                <button onClick={() => console.log(navigator.clipboard.writeText(account))}>Copy to clipboard</button>
              )}
            </LinkWrapper>
          </AccountInfo>
        </Modal>
      </ModalBackground>
    )
  } else {
    setShowModal(false)
    return <div />
  }
}

const LinkWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`

const LinkIconWrapper = styled.div`
  width: 12px;
  height: 12px;
`


const AccountAddress = styled.p`
  font-weight: 700;
  margin-bottom: 10px;
`

const ClosingButton = styled.button`
  display: flex;
  position: absolute;
  top: 8px;
  right: 8px;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  line-height: 1;
  width: 24px;
  height: 24px;
  transform: rotate(45deg);
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  padding: 16px;
  width: 100%;
  font-size: 20px;
`

const AccountInfo = styled.div`
  display: block;
  margin: 16px;
  padding: 16px;
  border-radius: 10px;
`

const Modal = styled.div`
  position: fixed;
  width: 600px;

  left: calc(50% - 300px);
  top: 100px;
  background-color: white;
  border-radius: 10px;
  z-index: 3;
`

const ModalBackground = styled.div`
  top: 0;
  left: 0;
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0px;
  z-index: 2;
  background-color: rgba(235, 232, 223, 0.5);
`
