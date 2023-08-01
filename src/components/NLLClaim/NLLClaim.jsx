import React from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";
import algosdk from "algosdk";
import { getContractValues, getUserStateValues } from "../../js/AlgoExplorerAPI";
import { calculateYLDYRewardsFromDayPeriod } from "../../js/YLDYCalculation";
import { getDayDifference } from "../../js/utility";
import { constants, unitToIcon } from "../../js/consts";
import { DateTime } from "luxon";
import AlgoInterface from "../../js/AlgoInterface";
import YieldlyAPI from "../../js/yieldly/YieldlyAPI";

const _algodClient = new algosdk.Algodv2('', "https://mainnet-api.algonode.cloud", 443);

const YLDY_ASA_ID = 226701642;
const FEE_ADDR = "IM6CZ4KUPWT23PKA23MW5S4ZQVF4376GWELLAL5QA5NCMB635JTRUGIDPY";

const stringToBytes = (arg) => {
    return new Uint8Array(Buffer.from(arg));
}

export default class NLLClaim extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            claimAmount: 0,
            connectedWallet: undefined,
            stakeAmount: 0,
            // Amount of ualgo user can unstake
            unstakeAmount: 0,
            // Any error happened during interaction
            operationError: undefined,
            // Amount of ualgos the user has
            userCurrentUalgos: undefined,
            contractValuesLastEpochMs: undefined,
        };
    }

    async componentDidMount() {
        const address = await AlgoInterface.Reconnect();
        this.setState({
            connectedWallet: address ? address : this.state.connectedWallet,
        });
        this.updateContractValues();
    }

    async OnConnectWallet() {
        const address = await AlgoInterface.Connect();
        this.setState({
            connectedWallet: address ? address : this.state.connectedWallet,
        });

        this.updateContractValues();
    }

    async ConnectMyAlgo() {
        this.setState({
            connectedWallet: await AlgoInterface.Connect(),
        });
    }

    async StakeAmount() {
        if (this.state.stakeAmount && this.state.stakeAmount > 0 && this.state.connectedWallet && this.state.userCurrentUalgos) {
            this.setState({ operationError: undefined });

            const suggestedParamTxn = await _algodClient.getTransactionParams().do();
            if (!suggestedParamTxn) {
                return;
            }

            const ualgoStake = this.state.stakeAmount * 1000000;
            console.log(`Staking`, this.state.stakeAmount, `(${ualgoStake}) algos`);


            /*
                Check user has enough to pay fee
            */
            const feeAmt = this.DetermineFeeAmt(this.state.stakeAmount);
            const totalUalgosNllFee = ualgoStake + feeAmt;
            if (this.state.userCurrentUalgos < totalUalgosNllFee) {
                console.error("User doesn't have enough for NLL and fee!");
                this.setState({ operationError: "You dont have enough Algos to deposit into NLL and pay the fee. Check the amount and try again" });
                return;
            }

            // call proxy contract
            const checkAppArg = stringToBytes("check");
            const checkTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, constants.PROXY_APP_ID, [ checkAppArg ]);

            // Call NLL contract
            const depositAppArg = stringToBytes("D");
            const stakingCall = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, constants.NO_LOSS_LOTTERY_APP_ID, [ depositAppArg ], [ constants.YLDY_ESCROW_ADDR ]);

            // Send Algo to the escrow
            const algoToContract = algosdk.makePaymentTxnWithSuggestedParams(this.state.connectedWallet, constants.YLDY_ESCROW_ADDR, ualgoStake, undefined, undefined, suggestedParamTxn);

            // Create specific txn group and order for deposit
            const groupedTxns = algosdk.assignGroupID([
                checkTxn,
                stakingCall,
                algoToContract,
            ]);

            // Sign all user txns
            const userSignedTxns = await AlgoInterface.SignTxns(groupedTxns);
            if (!userSignedTxns) {
                const err = "User denied NLL txns";
                console.error(err);
                this.setState({ operationError: err });
                return;
            }

            // Publish user txns
            if (userSignedTxns) {
                const result = await AlgoInterface.PublishTxns(userSignedTxns);
                if (result) {
                    console.log("Staked Algo ok!");
                }
                else {
                    console.error("Error publishing algo stake txns");
                    this.setState({ operationError: "Unable to publish stake txn. Check you have enough algos!" });
                }

                if (result) {
                    this.setState({ operationSuccess: "Wait a few seconds and refresh the page to see your new stake!" });
                }
            }
        }
    }

    async UnstakeAmount() {
        if (this.state.unstakeAmount && this.state.unstakeAmount > 0) {
            this.setState({ operationError: undefined });

            const suggestedParamTxn = await _algodClient.getTransactionParams().do();
            if (!suggestedParamTxn) {
                return;
            }

            const unstakeUalgos = this.state.unstakeAmount * 1000000;
            console.log("Unstaking", this.state.unstakeAmount, `(${unstakeUalgos}) algos`);

            // proxy contract
            const checkArg = stringToBytes("check");
            const checkProxyTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, constants.PROXY_APP_ID, [ checkArg ]);

            // Withdraw algos from NLL contract
            const wAppArg = stringToBytes("W");
            const withdrawTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, constants.NO_LOSS_LOTTERY_APP_ID, [ wAppArg ], [ constants.YLDY_ESCROW_ADDR ]);

            // Algo from Escrow
            const escrowToUserTxn = algosdk.makePaymentTxnWithSuggestedParams(
                constants.YLDY_ESCROW_ADDR,
                this.state.connectedWallet,
                unstakeUalgos,
                undefined, undefined,
                suggestedParamTxn
            );

            // Pay for withdraw txn fee
            const withdrawFeeTxn = algosdk.makePaymentTxnWithSuggestedParams(this.state.connectedWallet, constants.YLDY_ESCROW_ADDR, 1000, undefined, undefined, suggestedParamTxn);

            // Group all user txns
            const groupedTxns = algosdk.assignGroupID([
                checkProxyTxn,
                withdrawTxn,
                escrowToUserTxn,
                withdrawFeeTxn,
            ]);


            // Prompt user to sign
            const signedUserTxns = await AlgoInterface.SignTxns([ groupedTxns[0], groupedTxns[1], escrowToUserTxn, groupedTxns[3] ]);
            if (!signedUserTxns) {
                return;
            }

            // Sign after assigning group
            const escrowLogicSigAccount = YieldlyAPI.GetLogicSigAccount();
            const signedEscrowTxn = algosdk.signLogicSigTransactionObject(groupedTxns[2], escrowLogicSigAccount);

            // Join logic sig txn and user signed ones *in specific order*
            const allSignedTxns = [ signedUserTxns[0], signedUserTxns[1], signedEscrowTxn.blob, signedUserTxns[2] ];
            const published = await AlgoInterface.PublishTxns(allSignedTxns);
            if (!published) {
                this.setState({ operationError: "Unable to publish stake txn. Check you have enough algos!" });
                return;
            }
        }
    }

    async ClaimAmount() {
        if (this.state.claimAmount && this.state.claimAmount > 0) {
            this.setState({ operationError: undefined });

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
            const checkTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, constants.PROXY_APP_ID, [ checkAppArg ]);

            // Claim YLDY from NLL
            const caAppArg =  stringToBytes("CA");
            const appAccounts = [ constants.YLDY_ESCROW_ADDR ];
            const appWithdrawTxn = algosdk.makeApplicationNoOpTxn(this.state.connectedWallet, suggestedParamTxn, constants.NO_LOSS_LOTTERY_APP_ID, [ caAppArg ], appAccounts, undefined, undefined, flavourNote);

            // Pay for txn transfer fee
            const withdrawFeeTxn = algosdk.makePaymentTxnWithSuggestedParams(this.state.connectedWallet, constants.YLDY_ESCROW_ADDR, 1000, undefined, flavourNote, suggestedParamTxn);

            // Tranfer YLDY from escrow to claimer, sign with logic sig
            const escrowLogicSig = YieldlyAPI.GetLogicSigAccount();
            const claimTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(constants.YLDY_ESCROW_ADDR, this.state.connectedWallet, undefined, undefined, yldyClaimAmt, undefined, YLDY_ASA_ID, suggestedParamTxn);

            // Create group in specific orderr
            const groupedTxns = algosdk.assignGroupID([
                checkTxn,
                appWithdrawTxn,
                claimTxn,
                withdrawFeeTxn,
            ]);

            // Sign logic sig
            const signedEscrowTxn = algosdk.signLogicSigTransaction(claimTxn, escrowLogicSig);

            // Sign only user txns
            const signedUserTxns = await AlgoInterface.SignTxns([ groupedTxns[0], groupedTxns[1], groupedTxns[3] ]);
            if (signedUserTxns === null) {
                return;
            }

            // Construct back into specific order and publish
            const allSignedTxns = [ signedUserTxns[0], signedUserTxns[1], signedEscrowTxn.blob, signedUserTxns[2] ];
            const result = await AlgoInterface.PublishTxns(allSignedTxns);
            if (result) {
                console.log("Published good!");
            }
            else {
                console.error("Not published!");
                this.setState({ operationError: "Unable to publish stake txn. Check you have enough algos!" });
            }

        }
    }

    async OptInNll() {
        const suggestedParamTxn = await AlgoInterface.GetSuggestedParams();
        if (!suggestedParamTxn) {
            return;
        }

        const optInNllTxn = YieldlyAPI.MakeOptInNll(this.state.connectedWallet, suggestedParamTxn);
        const signedTxns = await AlgoInterface.SignTxns([optInNllTxn]);
        const result = await AlgoInterface.PublishTxns(signedTxns);
        if (!result) {
            console.error("Not published!");
            this.setState({ operationError: "Unable to publish opt in Nll txn" });
        }
    }

    DetermineFeeAmt(stakeUalgos) {
        const feePercent = 5 / 100;
        const fivePercentOfStake = stakeUalgos * feePercent;
        const feeUalgos = fivePercentOfStake;
        return feeUalgos;
    }

    // Creates a fee txn to the set fee address
    MakeFeeTxn(totalAmount, suggestedParams) {
        const feeUalgos = this.DetermineFeeAmt(totalAmount);
        const feeNote = stringToBytes(`Deposited ${(totalAmount / 1000000).toFixed(2)}A into NLL using yldy-calc <3`);
        return algosdk.makePaymentTxnWithSuggestedParams(this.state.connectedWallet, FEE_ADDR, feeUalgos, undefined, feeNote, suggestedParams);
    }

    updateContractValues() {
        // Get ALGO staked
        getUserStateValues(this.state.connectedWallet, constants.NO_LOSS_LOTTERY_APP_ID, [ "UA", "USS", "UT" ], (values, userUalgos) => {
            this.setState({
                userAppValues: values ?? undefined,
                userAlgoStaked: values?.UA ?? undefined,
                userUSS: values?.USS ?? undefined,
                userCurrentUalgos: userUalgos,
                unstakeAmount: values?.UA ? values.UA / 1000000 : this.state.claimAmount,
            }, () => {
                // Determine YLDY staked
                getContractValues(constants.NO_LOSS_LOTTERY_APP_ID, [ "GSS", "GT", "GA", "TYUL"], (obtainedVars) => {
                    if (obtainedVars && this.state.userAppValues) {
                        const dayDiff = getDayDifference( this.state.userAppValues["UT"], obtainedVars["GT"] )
                        let claimable = calculateYLDYRewardsFromDayPeriod(
                            this.state.userUSS ?? 0,
                            dayDiff,
                            this.state.unstakeAmount * 1000000,
                            obtainedVars.GSS,
                            obtainedVars.TYUL,
                        );

                        this.setState({
                            claimAmount: Math.floor( claimable / 1000 ) / 1000,
                            contractValuesLastEpochMs: new Date().getTime(),
                            contractRefreshGT: obtainedVars.GT ? obtainedVars.GT * 1000 : undefined,
                            globalAppVars: obtainedVars,
                        });
                    }
                });
            });
        })
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
                    <div
                        className={ (this.state.connectedWallet || this.state.userCurrentUalgos ? "mt-2" : "") + " text-center" }
                        >
                        {
                            this.state.connectedWallet && (
                                <div
                                    className="text-primary mx-auto"
                                    >
                                    { this.state.connectedWallet }
                                </div>
                            )
                        }
                        {
                            this.state.userCurrentUalgos && (
                                <div
                                    className="text-primary mx-auto"
                                    >
                                    <img
                                        src={ unitToIcon("ALGO") }
                                        className="my-auto mr-1"
                                        height={ 21 }
                                        width={ 21 }
                                        alt="Algorand icon"
                                        />
                                    { this.state.userCurrentUalgos / 1000000 }
                                </div>
                            )
                        }
                    </div>

                    {
                        this.state.operationError && (
                            <div
                                className="text-center border-danger border rounded my-2 py-1"
                                >
                                Oops! Something went wrong.
                                <br />
                                { this.state.operationError }
                            </div>
                        )
                    }
                    {
                        this.state.operationSuccess && (
                            <div
                                className="text-center border-primary border rounded my-2 py-1"
                                >
                                Success!
                                <br />
                                { this.state.operationSuccess }
                            </div>
                        )
                    }
                </div>

                {
                    this.state.userAppValues && (
                        <div
                            className="text-center mb-2"
                            >
                            Current Staked ALGO: { (this.state.userAppValues["UA"] / 1000000) }
                        </div>
                    )
                }

                <div
                    className="text-center"
                    >
                    <Button
                        className="ms-3 mx-auto"
                        variant="outline-primary"
                        style={{
                            minWidth: "150px"
                        }}
                        onClick={ async () => {
                            await this.OptInNll();
                        }}
                        >
                        Opt in to NLL
                    </Button>
                </div>

                {
                    [
                        {
                            title: "Algos to Stake",
                            value: this.state.stakeAmount,
                            onChange: (e) => {
                                this.setState({
                                    stakeAmount: parseInt(e.target.value),
                                });
                            },
                            btnText: "Stake",
                            onClick: async () => {
                                await this.StakeAmount();
                            },
                            unit: "ALGO",
                            afterControl: (
                                <div
                                    className="text-center"
                                    >
                                    ALGO Stake Fee (5%): { (this.DetermineFeeAmt(this.state.stakeAmount * 1000000) / 1000000).toFixed(2) }
                                </div>
                            )
                        },
                        {
                            title: "Unstake Algos",
                            value: this.state.unstakeAmount,
                            onChange: (e) => {
                                this.setState({
                                    unstakeAmount: parseInt(e.target.value),
                                });
                            },
                            btnText: "Unstake",
                            onClick: async () => {
                                await this.UnstakeAmount();
                            },
                            unit: "ALGO",
                        },
                        {
                            title: "YLDY to Claim",
                            value: this.state.claimAmount,
                            onChange: (e) => {
                                this.setState({
                                    claimAmount: parseInt(e.target.value),
                                });
                            },
                            btnText: "Claim",
                            onClick: async () => {
                                await this.ClaimAmount();
                            },
                            unit: "YLDY",
                        }
                    ].map((x, index) => {
                        return (
                            <div
                                className="my-2"
                                key={ `val-${index}` }
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
                                        <InputGroup className="mb-2">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>
                                                    <img
                                                        src={ unitToIcon( x.unit ) }
                                                        className="my-auto mr-1 img-fluid"
                                                        height="23px"
                                                        width="23px"
                                                        alt="Algorand icon"
                                                        />
                                                </InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control
                                                value={ x.value }
                                                onChange={ x.onChange }
                                                type="number"
                                                disabled={ !this.state.connectedWallet }
                                                />
                                        </InputGroup>
                                        {
                                            x.afterControl
                                        }
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
                {
                    this.state.connectedWallet && (
                        <div
                            className="d-flex flex-column justify-content-center align-items-center"
                            >
                            <Button
                                className="mt-2"
                                onClick={ () => {
                                    this.updateContractValues();
                                }}
                                >
                                Refresh Clamable Amount
                            </Button>
                            {
                                this.state.contractValuesLastEpochMs && (
                                    <div
                                        className="text-muted"
                                        >
                                        Last updated at { DateTime.fromMillis(this.state.contractValuesLastEpochMs).toLocaleString(DateTime.DATETIME_FULL) }
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                {
                    this.state.contractRefreshGT && (
                        <div
                            className="text-center text-muted"
                            >
                            Next Refresh Time (GT): { DateTime.fromMillis(this.state.contractRefreshGT).toLocaleString(DateTime.DATETIME_HUGE_WITH_SECONDS) }
                        </div>
                    )
                }
            </Container>
        )
    }

}