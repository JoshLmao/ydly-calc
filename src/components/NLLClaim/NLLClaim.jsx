import React from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk from "algosdk";

const _algodClient = new algosdk.Algodv2('', "https://mainnet-api.algonode.cloud", 443);

const _myAlgoWallet = new MyAlgoConnect();

const NLL_PROXY_APP_ID = 233725848;
const NLL_APP_ID = 233725844;
const ESCROW_ADDR = "FMBXOFAQCSAD4UWU4Q7IX5AV4FRV6AKURJQYGXLW3CTPTQ7XBX6MALMSPY";
const YLDY_ASA_ID = 226701642;
const ESCROW_PROGRAM_STR = "AiAGAgaYv7lvAAUBMgQiDzIEIw4QQQAuMwAYJBJAAANCACMzABAjEjMAGSUSIQQzABkSERAzASAyAxIQMwAgMgMSEEAAAiVDIQVD";
const FEE_ADDR = "IM6CZ4KUPWT23PKA23MW5S4ZQVF4376GWELLAL5QA5NCMB635JTRUGIDPY";

const stringToBytes = (arg) => {
    return new Uint8Array(Buffer.from(arg));
}

export default class NLLClaim extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            claimAmount: 0.001,
            connectedWallet: "",// undefined,
            stakeAmount: 0,
            unstakeAmount: 0,
        };
    }

    async OnConnectWallet() {
        const address = await this.ConnectMyAlgo();
        this.setState({
            connectedWallet: address ? address : this.state.connectedWallet,
        });
    }

    async ConnectMyAlgo() {
        try {
            const accounts = await _myAlgoWallet.connect();
            return accounts[0].address;
        }
        catch (e) {
            console.error("MyAlgo Connect error", e);
        }
    }

    async StakeAmount() {
        if (this.state.stakeAmount && this.state.stakeAmount > 0 && this.state.connectedWallet) {
            const suggestedParamTxn = await _algodClient.getTransactionParams().do();
            if (!suggestedParamTxn) {
                return;
            }

            const ualgoStake = this.state.stakeAmount * 1000000;
            console.log(`Staking`, this.state.stakeAmount, `(${ualgoStake}) algos`);

            // call proxy contract
            const checkAppArg = stringToBytes("check");
            const checkTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, NLL_PROXY_APP_ID, [ checkAppArg ]);

            // Call NLL contract
            const depositAppArg = stringToBytes("D");
            const stakingCall = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, NLL_APP_ID, [ depositAppArg ], [ ESCROW_ADDR ]);

            // Send Algo to the escrow
            const algoToContract = algosdk.makePaymentTxnWithSuggestedParams(this.state.connectedWallet, ESCROW_ADDR, ualgoStake, undefined, undefined, suggestedParamTxn);

            // fee txn
            const feeTxn = this.MakeFeeTxn(this.state.stakeAmount, suggestedParamTxn);

            const groupedTxns = algosdk.assignGroupID([
                feeTxn, // place first
                checkTxn,
                stakingCall,
                algoToContract,
            ]);

            const userSignedTxns = await this.SignTxns(groupedTxns);
            if (userSignedTxns) {
                const result = await this.PublishTxns(userSignedTxns);
                if (result) {
                    console.log("Staked Algo ok!");
                }
                else {
                    console.error("Error publishing algo stake txns");
                }
            }
        }
    }

    async UnstakeAmount() {
        if (this.state.unstakeAmount && this.state.unstakeAmount > 0) {
            const suggestedParamTxn = await _algodClient.getTransactionParams().do();
            if (!suggestedParamTxn) {
                return;
            }


            const unstakeUalgos = this.state.unstakeAmount * 1000000;
            console.log("Unstaking", this.state.unstakeAmount, `(${unstakeUalgos}) algos`);

            // proxy contract
            const checkArg = stringToBytes("check");
            const checkProxyTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, NLL_PROXY_APP_ID, [ checkArg ]);

            // Withdraw algos from NLL contract
            const wAppArg = stringToBytes("W");
            const withdrawTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, NLL_APP_ID, [ wAppArg ], [ ESCROW_ADDR ]);

            // Algo from Escrow
            const escrowLogicSig = this.GetNllLogicSigAccount();
            const escrowToUserTxn = algosdk.makePaymentTxnWithSuggestedParams(ESCROW_ADDR, this.state.connectedWallet, unstakeUalgos, undefined, undefined, suggestedParamTxn);
            const signedEscrowTxn = algosdk.signLogicSigTransaction(escrowToUserTxn, escrowLogicSig);

            // Pay for withdraw txn fee
            const withdrawFeeTxn = algosdk.makePaymentTxnWithSuggestedParams(this.state.connectedWallet, ESCROW_ADDR, 1000, undefined, undefined, suggestedParamTxn);

            // Group all user txns 
            const groupedTxns = algosdk.assignGroupID([
                checkProxyTxn,
                withdrawTxn,
                withdrawFeeTxn,
            ]);
            // Prompt user to sign
            const signedTxns = await this.SignTxns(groupedTxns);
            if (!signedTxns) {
                return;
            }

            // Join logic sig txn and user signed ones
            const allSignedTxns = [ ...signedTxns, signedEscrowTxn ];
            const published = await this.PublishTxns(allSignedTxns);
            if (!published) {
                return;
            }
        }
    }

    async ClaimAmount() {
        if (this.state.claimAmount && this.state.claimAmount > 0) {

            const suggestedParamTxn = await _algodClient.getTransactionParams().do();
            if (!suggestedParamTxn) {
                return;
            }

            // Amount in YLDY to claim, convert to decimal amount. YLDY has 6 decimals
            const yldyClaimAmt = this.state.claimAmount * 1000000;
            console.log("Claimining", this.state.claimAmount, "YLDY (", yldyClaimAmt, ")");

            const flavourNote = stringToBytes("NLL Claim on yldy-calculator by JoshLmao <3");

            // Call proxy contract
            const checkAppArg = stringToBytes("check");
            console.log(checkAppArg);
            const checkTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, NLL_PROXY_APP_ID, [ checkAppArg ]);

            // Claim YLDY from NLL
            const caAppArg =  stringToBytes("CA");
            const appAccounts = [ ESCROW_ADDR ];
            const appWithdrawTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, NLL_APP_ID, [ caAppArg ], appAccounts, undefined, undefined, flavourNote);

            // Pay for txn transfer fee
            const withdrawFeeTxn = algosdk.makePaymentTxnWithSuggestedParams(this.state.connectedWallet, ESCROW_ADDR, 1000, undefined, flavourNote, suggestedParamTxn);

            // Tranfer YLDY from escrow to claimer, sign with logic sig
            const escrowLogicSig = this.GetNllLogicSigAccount();
            const claimTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(ESCROW_ADDR, this.state.connectedWallet, undefined, undefined, yldyClaimAmt, undefined, YLDY_ASA_ID, suggestedParamTxn);
            const signedLogicSig = algosdk.signLogicSigTransaction(claimTxn, escrowLogicSig);

            const groupedTxns = algosdk.assignGroupID([
                checkTxn,
                appWithdrawTxn,
                withdrawFeeTxn,
            ]);

            let userSignedTxns = await this.SignTxns(groupedTxns);
            if (userSignedTxns === null) {
                return;
            }

            const allSignedTxns = [ ...userSignedTxns, signedLogicSig ];
            const result = await this.PublishTxns(allSignedTxns);
            if (result) {
                console.log("Published good!");
            }
            else {
                console.error("Not published!");
            }

        }
    }

    // Creates the LogicSig Account for the NLL escrow
    GetNllLogicSigAccount() {
        const program = new Uint8Array(Buffer.from(ESCROW_PROGRAM_STR, "base64"));
        const escrowLogicSig = new algosdk.LogicSigAccount(program);
        return escrowLogicSig;
    }

    // Creates a fee txn to the set fee address
    MakeFeeTxn(totalAmount, suggestedParams, optionalNote = undefined) {
        const feePercent = 5 / 100;
        const fivePercentOfStake = totalAmount * feePercent;
        const feeUalgos = fivePercentOfStake * 1000000;
        return algosdk.makePaymentTxnWithSuggestedParams(this.state.connectedWallet, FEE_ADDR, feeUalgos, undefined, optionalNote, suggestedParams);
    }

    // Signs the given txns
    async SignTxns(txns) {
        let byteTxns = txns.map(x => x.toByte())
        let userSigned = null;
        try {
            userSigned = await _myAlgoWallet.signTransaction(byteTxns);
        }   
        catch (e) {
            console.warn("Sign txn error, user cancelled?", e);
        }
        return userSigned;
    }

    // Publishes the given signed txns
    async PublishTxns(allSignedTxns) {
        const allBlobs = allSignedTxns.map(x => x.blob);
        try {
            const published = await _algodClient.sendRawTransaction(allBlobs).do().catch(x => console.error("Error publishing txns", x));
            if (published) {
                return true;
            }

        }
        catch (e) {
            console.error("Error submitting", e);
        }
        return false;
    }

    render() {
        return (
            <Container
                className="mb-3 mt-2 border border-primary rounded p-3"
                >
                <div
                    className="d-flex flex-column mb-3"
                    >
                    <Button
                        variant="primary"
                        className="mx-auto"
                        onClick={ async () => {
                            this.OnConnectWallet({ shouldSelectOneAccount: true, });
                        }}
                        >     
                        Connect/Change Wallet               
                    </Button>
                    {
                        this.state.connectedWallet && (
                            <div
                                className="text-primary mx-auto"
                                >
                                { this.state.connectedWallet }
                            </div>
                        )
                    }
                </div>
                
                {
                    [
                        {
                            title: "Algos to Stake",
                            value: this.state.stakeAmount,
                            onChange: (e) => {
                                this.setState({
                                    stakeAmount: e.target.value,
                                });
                            },
                            btnText: "Stake",
                            onClick: async () => {
                                await this.StakeAmount();
                            }
                        },
                        {
                            title: "Unstake Algos",
                            value: this.state.unstakeAmount,
                            onChange: (e) => {
                                this.setState({
                                    unstakeAmount: e.target.value,
                                });
                            },
                            btnText: "Unstake",
                            onClick: async () => {
                                await this.UnstakeAmount();
                            }
                        },
                        {
                            title: "YLDY to Claim",
                            value: this.state.claimAmount,
                            onChange: (e) => {
                                this.setState({
                                    claimAmount: e.target.value,
                                });
                            },
                            btnText: "Claim",
                            onClick: async () => {
                                await this.ClaimAmount();
                            }
                        }
                    ].map((x) => {
                        return (
                            <div
                                className="my-2"
                                >
                                <Row
                                    className=""
                                    >
                                    <Col
                                        md={ 4 }
                                        className="text-right"
                                        >
                                        <div
                                            className="me-3"
                                            >
                                            { x.title }
                                        </div>
                                    </Col>
                                    <Col
                                        md={ 4 }
                                        >
                                        <Form.Control
                                            value={ x.value }
                                            onChange={ x.onChange }
                                            type="number"
                                            className="mx-3"
                                            />
                                    </Col>
                                    <Col
                                        md={ 4 }
                                        className="text-left"
                                        >
                                        <Button
                                            className="ms-3"
                                            variant="outline-primary"
                                            onClick={ x.onClick }
                                            style={{
                                                minWidth: "150px"
                                            }}
                                            >
                                            { x.btnText }
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        )
                    })
                }
            </Container>
        )
    }

}